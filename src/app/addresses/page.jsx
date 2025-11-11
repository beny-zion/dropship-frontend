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

  // Handle both array and object with data property
  const addresses = Array.isArray(addressesData)
    ? addressesData
    : (addressesData?.data || []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-light tracking-widest uppercase text-center">הכתובות שלי</h1>
        </div>
      </div>

      <div className="container max-w-4xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-light text-neutral-600 tracking-wide">
            נהל את כתובות המשלוח שלך
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            כתובת חדשה
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="border border-dashed border-neutral-300 p-12 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-2xl font-light tracking-wide mb-2">אין כתובות שמורות</h2>
            <p className="text-sm font-light text-neutral-600 mb-6 tracking-wide">
              הוסף כתובת משלוח כדי להאיץ את תהליך ההזמנה בפעם הבאה
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-8 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all"
            >
              הוסף כתובת ראשונה
            </button>
          </div>
        ) : (
          <div className="space-y-4">
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
    </div>
  );
}