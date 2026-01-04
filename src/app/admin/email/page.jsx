'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  Send,
  Mail,
  Users,
  Search,
  X,
  Package,
  UserPlus,
  CheckCircle
} from 'lucide-react';

export default function EmailManagementPage() {
  // State for customer selection
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // State for external email
  const [externalEmail, setExternalEmail] = useState('');

  // State for email content
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // State for order context
  const [orderId, setOrderId] = useState('');
  const [includeOrderContext, setIncludeOrderContext] = useState(false);

  // State for sending
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Load customers on search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        loadCustomers(searchTerm);
      } else if (searchTerm.length === 0) {
        loadCustomers('');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCustomers = async (search) => {
    try {
      setLoadingCustomers(true);
      const response = await adminApi.getCustomersForEmail(search);
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('שגיאה בטעינת לקוחות');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const toggleCustomer = (customer) => {
    setSelectedCustomers(prev => {
      const exists = prev.find(c => c._id === customer._id);
      if (exists) {
        return prev.filter(c => c._id !== customer._id);
      }
      return [...prev, customer];
    });
  };

  const removeCustomer = (customerId) => {
    setSelectedCustomers(prev => prev.filter(c => c._id !== customerId));
  };

  const addExternalEmail = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(externalEmail)) {
      toast.error('כתובת מייל לא תקינה');
      return;
    }

    // Check if already added
    if (selectedCustomers.find(c => c.email === externalEmail)) {
      toast.error('כתובת מייל זו כבר נוספה');
      return;
    }

    // Add as external
    setSelectedCustomers(prev => [...prev, {
      _id: `external_${Date.now()}`,
      email: externalEmail,
      firstName: 'חיצוני',
      lastName: '',
      isExternal: true
    }]);

    setExternalEmail('');
    toast.success('כתובת מייל נוספה');
  };

  const selectAll = () => {
    setSelectedCustomers(customers);
  };

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  const handleSend = async () => {
    // Validation
    if (selectedCustomers.length === 0) {
      toast.error('נא לבחור לפחות נמען אחד');
      return;
    }

    if (!subject.trim()) {
      toast.error('נא להזין נושא למייל');
      return;
    }

    if (!body.trim()) {
      toast.error('נא להזין תוכן למייל');
      return;
    }

    try {
      setSending(true);
      setSendResult(null);

      const recipients = selectedCustomers.map(c => c.email);

      const response = await adminApi.sendBulkEmail({
        recipients,
        subject,
        body,
        orderId: includeOrderContext && orderId ? orderId : undefined
      });

      setSendResult(response.data);
      toast.success(response.message || 'מיילים נשלחו בהצלחה');

      // Clear form on success
      if (response.data?.failed === 0) {
        setSelectedCustomers([]);
        setSubject('');
        setBody('');
        setOrderId('');
        setIncludeOrderContext(false);
      }
    } catch (error) {
      console.error('Failed to send emails:', error);
      toast.error(error.message || 'שגיאה בשליחת מיילים');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">ניהול מיילים</h1>
        <p className="text-gray-600 mt-2">שליחת מיילים ללקוחות ודיוור שיווקי</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recipients Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              בחירת נמענים
            </CardTitle>
            <CardDescription>
              בחר לקוחות מהרשימה או הוסף כתובת מייל חיצונית
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="חיפוש לקוחות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Customer List */}
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {loadingCustomers ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </div>
              ) : customers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'לא נמצאו לקוחות' : 'הקלד לחיפוש לקוחות'}
                </div>
              ) : (
                <div className="divide-y">
                  {customers.map(customer => (
                    <div
                      key={customer._id}
                      className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
                        selectedCustomers.find(c => c._id === customer._id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleCustomer(customer)}
                    >
                      <Checkbox
                        checked={!!selectedCustomers.find(c => c._id === customer._id)}
                        onChange={() => {}}
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={customers.length === 0}
              >
                בחר הכל
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={selectedCustomers.length === 0}
              >
                נקה בחירה
              </Button>
            </div>

            {/* Add External Email */}
            <div className="border-t pt-4">
              <Label className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4" />
                הוספת כתובת מייל חיצונית
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addExternalEmail()}
                />
                <Button onClick={addExternalEmail} variant="outline">
                  הוסף
                </Button>
              </div>
            </div>

            {/* Selected Recipients */}
            {selectedCustomers.length > 0 && (
              <div className="border-t pt-4">
                <Label className="mb-2 block">
                  נמענים נבחרים ({selectedCustomers.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomers.map(customer => (
                    <div
                      key={customer._id}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                        customer.isExternal
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {customer.email}
                      <button
                        onClick={() => removeCustomer(customer._id)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              תוכן המייל
            </CardTitle>
            <CardDescription>
              כתוב את המייל שישלח לנמענים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">נושא המייל</Label>
              <Input
                id="subject"
                placeholder="הזן נושא..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="body">תוכן המייל</Label>
              <Textarea
                id="body"
                placeholder="הזן את תוכן המייל..."
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                טיפ: שורות חדשות יהפכו לפסקאות נפרדות
              </p>
            </div>

            {/* Order Context */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="include-order"
                  checked={includeOrderContext}
                  onCheckedChange={setIncludeOrderContext}
                />
                <Label htmlFor="include-order" className="flex items-center gap-2 cursor-pointer">
                  <Package className="w-4 h-4" />
                  צרף פרטי הזמנה (אופציונלי)
                </Label>
              </div>

              {includeOrderContext && (
                <Input
                  placeholder="מזהה הזמנה (Order ID)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              )}
            </div>

            {/* Send Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSend}
              disabled={sending || selectedCustomers.length === 0 || !subject || !body}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  שלח מייל ל-{selectedCustomers.length} נמענים
                </>
              )}
            </Button>

            {/* Send Result */}
            {sendResult && (
              <div className={`p-4 rounded-lg ${
                sendResult.failed === 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
              }`}>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  תוצאות שליחה
                </div>
                <div className="mt-2 text-sm">
                  <p>נשלחו בהצלחה: {sendResult.sent}</p>
                  {sendResult.failed > 0 && (
                    <p className="text-red-600">נכשלו: {sendResult.failed}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>תבניות מהירות</CardTitle>
          <CardDescription>
            לחץ על תבנית למילוי אוטומטי של תוכן המייל
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-right"
              onClick={() => {
                setSubject('הזמנתך בדרך אליך!');
                setBody(`שלום רב,

אנחנו שמחים לעדכן אותך שההזמנה שלך יצאה לדרך!

ההזמנה צפויה להגיע תוך 7-14 ימי עסקים.

נעדכן אותך כשהיא תגיע לישראל.

בברכה,
צוות Torino Shop`);
              }}
            >
              <Package className="w-5 h-5 mb-2" />
              <span className="font-medium">הזמנה נשלחה</span>
              <span className="text-xs text-gray-500">עדכון על משלוח</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-right"
              onClick={() => {
                setSubject('עדכון חשוב לגבי הזמנתך');
                setBody(`שלום רב,

רצינו לעדכן אותך לגבי הזמנתך.



במידה ויש לך שאלות, אל תהסס לפנות אלינו.

בברכה,
צוות Torino Shop`);
              }}
            >
              <Mail className="w-5 h-5 mb-2" />
              <span className="font-medium">עדכון כללי</span>
              <span className="text-xs text-gray-500">תבנית בסיסית</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-right"
              onClick={() => {
                setSubject('מבצע מיוחד ללקוחותינו!');
                setBody(`שלום רב,

יש לנו מבצע מיוחד בשבילך!



המבצע בתוקף עד [תאריך].

לצפייה במוצרים: https://www.torinoil.com

בברכה,
צוות Torino Shop`);
              }}
            >
              <Users className="w-5 h-5 mb-2" />
              <span className="font-medium">דיוור שיווקי</span>
              <span className="text-xs text-gray-500">מבצעים והנחות</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
