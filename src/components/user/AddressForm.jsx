'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/lib/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export default function AddressForm({ isOpen, onClose, onSubmit, initialData, isLoading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      fullName: '',
      phone: '',
      street: '',
      apartment: '',
      floor: '',
      entrance: '',
      city: '',
      zipCode: '',
      label: 'home',
      isDefault: false,
    },
  });

  const selectedLabel = watch('label');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'עריכת כתובת' : 'כתובת חדשה'}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'ערוך את פרטי הכתובת ושמור את השינויים'
              : 'הוסף כתובת חדשה למשלוחים'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">שם מלא *</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="ישראל ישראלי"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">טלפון *</Label>
            <Input
              id="phone"
              {...register('phone')}
              dir="ltr"
              placeholder="0501234567"
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="street">רחוב ומספר בית *</Label>
            <Input
              id="street"
              {...register('street')}
              placeholder="הרצל 123"
            />
            {errors.street && (
              <p className="text-sm text-red-500 mt-1">
                {errors.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="apartment">דירה</Label>
              <Input
                id="apartment"
                {...register('apartment')}
                placeholder="5"
              />
              {errors.apartment && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.apartment.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="floor">קומה</Label>
              <Input
                id="floor"
                {...register('floor')}
                placeholder="2"
              />
              {errors.floor && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.floor.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="entrance">כניסה</Label>
              <Input
                id="entrance"
                {...register('entrance')}
                placeholder="א"
              />
              {errors.entrance && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.entrance.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">עיר *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="תל אביב"
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="zipCode">מיקוד *</Label>
              <Input
                id="zipCode"
                {...register('zipCode')}
                dir="ltr"
                placeholder="6436501"
                maxLength={7}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="label">תווית</Label>
            <Select
              value={selectedLabel}
              onValueChange={(value) => setValue('label', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">🏠 בית</SelectItem>
                <SelectItem value="work">💼 עבודה</SelectItem>
                <SelectItem value="other">📍 אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register('isDefault')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isDefault" className="cursor-pointer font-normal">
              הגדר ככתובת ברירת מחדל
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'שומר...' : 'שמור'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}