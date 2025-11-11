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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-8 py-6 space-y-6">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-light tracking-widest uppercase text-neutral-500 pb-2 border-b border-neutral-100">פרטים אישיים</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">שם מלא *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="ישראל ישראלי"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1 font-light">
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
                  <p className="text-xs text-red-600 mt-1 font-light">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-light tracking-widest uppercase text-neutral-500 pb-2 border-b border-neutral-100">כתובת</h3>

            <div>
              <Label htmlFor="street">רחוב ומספר בית *</Label>
              <Input
                id="street"
                {...register('street')}
                placeholder="הרצל 123"
              />
              {errors.street && (
                <p className="text-xs text-red-600 mt-1 font-light">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="apartment">דירה</Label>
                <Input
                  id="apartment"
                  {...register('apartment')}
                  placeholder="5"
                />
                {errors.apartment && (
                  <p className="text-xs text-red-600 mt-1 font-light">
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
                  <p className="text-xs text-red-600 mt-1 font-light">
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
                  <p className="text-xs text-red-600 mt-1 font-light">
                    {errors.entrance.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">עיר *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="תל אביב"
                />
                {errors.city && (
                  <p className="text-xs text-red-600 mt-1 font-light">
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
                  <p className="text-xs text-red-600 mt-1 font-light">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-light tracking-widest uppercase text-neutral-500 pb-2 border-b border-neutral-100">הגדרות</h3>

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
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register('isDefault')}
              className="h-4 w-4 border-neutral-300"
            />
            <Label htmlFor="isDefault" className="cursor-pointer font-light text-sm">
              הגדר ככתובת ברירת מחדל
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 border border-neutral-300 text-sm font-light tracking-wide hover:border-black transition-colors disabled:opacity-50"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-neutral-800 transition-all disabled:opacity-50"
            >
              {isLoading ? 'שומר...' : 'שמור'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}