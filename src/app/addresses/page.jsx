'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/lib/hooks/useAddresses';
import AddressCard from '@/components/user/AddressCard';
import AddressForm from '@/components/user/AddressForm';
import Loading from '@/components/shared/Loading';
import ErrorMessage from '@/components/shared/ErrorMessage';
import EmptyState from '@/components/shared/EmptyState';

export default function AddressesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const { data: addressesData, isLoading, error } = useAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data) => {
    if (editingAddress) {
      await updateMutation.mutateAsync({
        id: editingAddress._id,
        data,
      });
      setEditingAddress(null);
    }
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleSetDefault = async (id) => {
    await setDefaultMutation.mutateAsync(id);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="שגיאה בטעינת הכתובות" />;

  const addresses = addressesData || [];

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">הכתובות שלי</h1>
          <p className="text-muted-foreground mt-2">
            נהל את כתובות המשלוח שלך
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          כתובת חדשה
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon="📍"
          title="אין כתובות שמורות"
          description="הוסף כתובת משלוח כדי להאיץ את תהליך ההזמנה בפעם הבאה"
          action={{
            label: 'הוסף כתובת ראשונה',
            onClick: () => setIsFormOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      <AddressForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingAddress ? handleUpdate : handleCreate}
        initialData={editingAddress}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}