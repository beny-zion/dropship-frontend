'use client';

import ChangePasswordForm from '@/components/user/ChangePasswordForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2, Bell, AlertTriangle } from 'lucide-react';
import { useDeleteAccount } from '@/lib/hooks/useProfile';
import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    marketing: true,
  });

  const deleteAccountMutation = useDeleteAccount();

  const handleDeleteAccount = () => {
    const confirmed = confirm(
      'האם אתה בטוח לחלוטין שברצונך למחוק את החשבון?\n\n' +
      'פעולה זו תמחק לצמיתות את:\n' +
      '• כל הנתונים האישיים שלך\n' +
      '• היסטוריית ההזמנות\n' +
      '• הכתובות השמורות\n\n' +
      'פעולה זו אינה הפיכה!'
    );

    if (confirmed) {
      const password = prompt('הזן את הסיסמה שלך לאישור:');
      if (password) {
        deleteAccountMutation.mutate(password);
      }
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">הגדרות</h1>

      <div className="grid gap-6">
        {/* Change Password */}
        <ChangePasswordForm />

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>התראות</CardTitle>
            </div>
            <CardDescription>
              נהל את העדפות ההתראות שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications" className="text-base font-medium">
                  התראות במייל
                </Label>
                <p className="text-sm text-muted-foreground">
                  קבל עדכונים על הזמנות, משלוחים והצעות מיוחדות
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsNotifications" className="text-base font-medium">
                  התראות SMS
                </Label>
                <p className="text-sm text-muted-foreground">
                  קבל עדכונים בזמן אמת על סטטוס המשלוח
                </p>
              </div>
              <Switch
                id="smsNotifications"
                checked={notifications.sms}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sms: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketingEmails" className="text-base font-medium">
                  דיוור שיווקי
                </Label>
                <p className="text-sm text-muted-foreground">
                  קבל מבצעים, הנחות והצעות בלעדיות
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={notifications.marketing}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, marketing: checked })
                }
              />
            </div>

            <Button variant="outline" className="w-full sm:w-auto">
              שמור העדפות
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">אזור מסוכן</CardTitle>
            </div>
            <CardDescription>
              פעולות בלתי הפיכות על החשבון שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-red-900">מחיקת חשבון</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  מחיקת החשבון תמחק לצמיתות את כל הנתונים שלך, כולל היסטוריית הזמנות,
                  כתובות שמורות ומידע אישי. פעולה זו אינה הפיכה ולא ניתן לשחזר את המידע.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteAccountMutation.isPending ? 'מוחק חשבון...' : 'מחק חשבון לצמיתות'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}