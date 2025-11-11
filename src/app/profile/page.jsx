'use client';

import { useState } from 'react';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '@/lib/utils/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Loading from '@/components/shared/Loading';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profileData, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { updateUser } = useAuth();

  const user = profileData?.data?.user;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: user ? {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      bio: user.bio || ''
    } : undefined
  });

  const onSubmit = async (data) => {
    await updateProfileMutation.mutateAsync(data);
    // Update AuthContext with new user data
    updateUser(data);
    setIsEditing(false);
    reset(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    });
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="שגיאה בטעינת הפרופיל" />;

  const stats = profileData?.data?.stats;

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">הפרופיל שלי</h1>

      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-sm text-muted-foreground">הזמנות</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalSpent || 0)}
              </div>
              <p className="text-sm text-muted-foreground">סה"כ הוצאות</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatDate(user?.createdAt)}
              </div>
              <p className="text-sm text-muted-foreground">חבר מאז</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>פרטים אישיים</CardTitle>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                ערוך
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">שם פרטי</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      disabled={!isEditing}
                      className="pr-10"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">שם משפחה</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      disabled={!isEditing}
                      className="pr-10"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email}
                    disabled
                    className="pr-10 bg-muted"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  לא ניתן לשנות את כתובת האימייל
                </p>
              </div>

              <div>
                <Label htmlFor="phone">טלפון</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    {...register('phone')}
                    disabled={!isEditing}
                    dir="ltr"
                    className="pr-10"
                    placeholder="0501234567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">על עצמי (אופציונלי)</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="ספר לנו משהו על עצמך..."
                  className="resize-none"
                />
                {errors.bio && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.bio.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {(user?.bio?.length || 0)}/500 תווים
                </p>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={!isDirty || updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'שומר...' : 'שמור שינויים'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                  >
                    ביטול
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>מידע חשבון</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">תאריך הצטרפות</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">סטטוס חשבון</p>
                <p className="text-sm text-muted-foreground">
                  {user?.accountStatus === 'active' ? 'פעיל' : 'לא פעיל'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
