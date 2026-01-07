'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, RotateCcw, DollarSign, ShoppingCart, Mail, Settings2, Globe, Calculator } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  // Shipping & Order Form state
  const [shippingUsd, setShippingUsd] = useState(15);
  const [shippingIls, setShippingIls] = useState(49);
  const [estimatedDays, setEstimatedDays] = useState(14);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingThresholdUsd, setFreeShippingThresholdUsd] = useState(0);
  const [freeShippingThresholdIls, setFreeShippingThresholdIls] = useState(0);
  const [minimumAmountUsd, setMinimumAmountUsd] = useState(0);
  const [minimumAmountIls, setMinimumAmountIls] = useState(0);
  const [minimumItemsCount, setMinimumItemsCount] = useState(0);

  // Email Form state
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [fromName, setFromName] = useState('Amazon Dropship');

  // General Form state
  const [siteName, setSiteName] = useState('Amazon Dropship');
  const [currency, setCurrency] = useState('BOTH');
  const [timezone, setTimezone] = useState('Asia/Jerusalem');

  // Pricing Form state
  const [usdToIls, setUsdToIls] = useState(3.2);
  const [tier1MaxPrice, setTier1MaxPrice] = useState(50);
  const [tier1Multiplier, setTier1Multiplier] = useState(2.0);
  const [tier2MaxPrice, setTier2MaxPrice] = useState(99);
  const [tier2Multiplier, setTier2Multiplier] = useState(1.9);
  const [tier3Multiplier, setTier3Multiplier] = useState(1.8);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSystemSettings();

      // ✅ The interceptor already extracts response.data, so response.data is the actual data
      const data = response.data;

      if (!data) {
        console.error('No data in response:', response);
        toast.error('לא התקבלו הגדרות מהשרת');
        return;
      }

      setSettings(data);

      // Update shipping & order form state
      setShippingUsd(data.shipping?.flatRate?.usd ?? 15);
      setShippingIls(data.shipping?.flatRate?.ils ?? 49);
      setEstimatedDays(data.shipping?.estimatedDays ?? 14);
      setFreeShippingEnabled(data.shipping?.freeShipping?.enabled ?? false);
      setFreeShippingThresholdUsd(data.shipping?.freeShipping?.threshold?.usd ?? 0);
      setFreeShippingThresholdIls(data.shipping?.freeShipping?.threshold?.ils ?? 0);
      setMinimumAmountUsd(data.order?.minimumAmount?.usd ?? 0);
      setMinimumAmountIls(data.order?.minimumAmount?.ils ?? 0);
      setMinimumItemsCount(data.order?.minimumItemsCount ?? 0);

      // Update email form state
      setEmailEnabled(data.email?.notifications?.enabled ?? true);
      setAdminEmail(data.email?.notifications?.adminEmail ?? '');
      setFromName(data.email?.notifications?.fromName ?? 'Amazon Dropship');

      // Update general form state
      setSiteName(data.general?.siteName ?? 'Amazon Dropship');
      setCurrency(data.general?.currency ?? 'BOTH');
      setTimezone(data.general?.timezone ?? 'Asia/Jerusalem');

      // Update pricing form state
      setUsdToIls(data.pricing?.usdToIls ?? 3.2);
      setTier1MaxPrice(data.pricing?.multipliers?.tier1?.maxPrice ?? 50);
      setTier1Multiplier(data.pricing?.multipliers?.tier1?.multiplier ?? 2.0);
      setTier2MaxPrice(data.pricing?.multipliers?.tier2?.maxPrice ?? 99);
      setTier2Multiplier(data.pricing?.multipliers?.tier2?.multiplier ?? 1.9);
      setTier3Multiplier(data.pricing?.multipliers?.tier3?.multiplier ?? 1.8);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error(`שגיאה בטעינת הגדרות: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updates = {
        shipping: {
          flatRate: {
            usd: parseFloat(shippingUsd),
            ils: parseFloat(shippingIls)
          },
          estimatedDays: parseInt(estimatedDays, 10),
          freeShipping: {
            enabled: freeShippingEnabled,
            threshold: {
              usd: parseFloat(freeShippingThresholdUsd),
              ils: parseFloat(freeShippingThresholdIls)
            }
          }
        },
        order: {
          minimumAmount: {
            usd: parseFloat(minimumAmountUsd),
            ils: parseFloat(minimumAmountIls)
          },
          minimumItemsCount: parseInt(minimumItemsCount, 10)
        },
        email: {
          notifications: {
            enabled: emailEnabled,
            adminEmail: adminEmail,
            fromName: fromName
          }
        },
        general: {
          siteName: siteName,
          currency: currency,
          timezone: timezone
        },
        pricing: {
          usdToIls: parseFloat(usdToIls),
          multipliers: {
            tier1: {
              maxPrice: parseFloat(tier1MaxPrice),
              multiplier: parseFloat(tier1Multiplier)
            },
            tier2: {
              maxPrice: parseFloat(tier2MaxPrice),
              multiplier: parseFloat(tier2Multiplier)
            },
            tier3: {
              multiplier: parseFloat(tier3Multiplier)
            }
          }
        }
      };

      await adminApi.updateSystemSettings(updates);
      toast.success('ההגדרות נשמרו בהצלחה');
      await loadSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('שגיאה בשמירת הגדרות');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות לברירת מחדל?')) {
      return;
    }

    try {
      setSaving(true);
      await adminApi.resetSystemSettings();
      toast.success('ההגדרות אופסו לברירת מחדל');
      await loadSettings();
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('שגיאה באיפוס הגדרות');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">הגדרות מערכת</h1>
        <p className="text-gray-600 mt-2">ניהול הגדרות גלובליות של המערכת</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            הגדרות כלליות
          </CardTitle>
          <CardDescription>
            הגדרות בסיסיות של האתר
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site-name">שם האתר</Label>
            <Input
              id="site-name"
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Amazon Dropship"
            />
          </div>

          <div>
            <Label htmlFor="currency">מטבע</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="בחר מטבע" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">דולר בלבד (USD)</SelectItem>
                <SelectItem value="ILS">שקל בלבד (ILS)</SelectItem>
                <SelectItem value="BOTH">שני המטבעות (USD & ILS)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timezone">אזור זמן</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="בחר אזור זמן" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jerusalem">ירושלים (Asia/Jerusalem)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">ניו יורק (America/New_York)</SelectItem>
                <SelectItem value="Europe/London">לונדון (Europe/London)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings - Inventory Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            הגדרות תמחור (מצפן מלאי)
          </CardTitle>
          <CardDescription>
            שער המרה ומכפילים לחישוב מחירי מכירה
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="usd-to-ils">שער המרה USD → ILS</Label>
            <Input
              id="usd-to-ils"
              type="number"
              min="1"
              step="0.01"
              value={usdToIls}
              onChange={(e) => setUsdToIls(e.target.value)}
              placeholder="3.2"
            />
            <p className="text-sm text-gray-500 mt-1">
              שער ההמרה מדולר לשקל
            </p>
          </div>

          {/* Tier 1 */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-blue-800">רמה 1 - מוצרים זולים</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tier1-max">מחיר מקסימלי ($)</Label>
                <Input
                  id="tier1-max"
                  type="number"
                  min="0"
                  step="1"
                  value={tier1MaxPrice}
                  onChange={(e) => setTier1MaxPrice(e.target.value)}
                  placeholder="50"
                />
                <p className="text-xs text-gray-500 mt-1">עד סכום זה</p>
              </div>
              <div>
                <Label htmlFor="tier1-mult">מכפיל</Label>
                <Input
                  id="tier1-mult"
                  type="number"
                  min="1"
                  step="0.1"
                  value={tier1Multiplier}
                  onChange={(e) => setTier1Multiplier(e.target.value)}
                  placeholder="2.0"
                />
                <p className="text-xs text-gray-500 mt-1">x{tier1Multiplier}</p>
              </div>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-green-800">רמה 2 - מוצרים בינוניים</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tier2-max">מחיר מקסימלי ($)</Label>
                <Input
                  id="tier2-max"
                  type="number"
                  min="0"
                  step="1"
                  value={tier2MaxPrice}
                  onChange={(e) => setTier2MaxPrice(e.target.value)}
                  placeholder="99"
                />
                <p className="text-xs text-gray-500 mt-1">${tier1MaxPrice + 1} - ${tier2MaxPrice}</p>
              </div>
              <div>
                <Label htmlFor="tier2-mult">מכפיל</Label>
                <Input
                  id="tier2-mult"
                  type="number"
                  min="1"
                  step="0.1"
                  value={tier2Multiplier}
                  onChange={(e) => setTier2Multiplier(e.target.value)}
                  placeholder="1.9"
                />
                <p className="text-xs text-gray-500 mt-1">x{tier2Multiplier}</p>
              </div>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-purple-50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-purple-800">רמה 3 - מוצרים יקרים</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">מחיר</p>
                <p className="text-sm font-medium">${tier2MaxPrice}+</p>
              </div>
              <div>
                <Label htmlFor="tier3-mult">מכפיל</Label>
                <Input
                  id="tier3-mult"
                  type="number"
                  min="1"
                  step="0.1"
                  value={tier3Multiplier}
                  onChange={(e) => setTier3Multiplier(e.target.value)}
                  placeholder="1.8"
                />
                <p className="text-xs text-gray-500 mt-1">x{tier3Multiplier}</p>
              </div>
            </div>
          </div>

          {/* Preview Calculator */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">תצוגה מקדימה</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-white p-2 rounded border">
                <p className="text-gray-500">$30</p>
                <p className="font-bold">₪{Math.round(30 * tier1Multiplier * usdToIls)}</p>
              </div>
              <div className="bg-white p-2 rounded border">
                <p className="text-gray-500">$75</p>
                <p className="font-bold">₪{Math.round(75 * tier2Multiplier * usdToIls)}</p>
              </div>
              <div className="bg-white p-2 rounded border">
                <p className="text-gray-500">$150</p>
                <p className="font-bold">₪{Math.round(150 * tier3Multiplier * usdToIls)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            הגדרות מייל
          </CardTitle>
          <CardDescription>
            הגדרות התראות ומיילים אוטומטיים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled">התראות מייל</Label>
              <p className="text-sm text-gray-500">
                קבל התראות על הזמנות חדשות ופעולות חשובות
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>

          <div>
            <Label htmlFor="admin-email">מייל מנהל</Label>
            <Input
              id="admin-email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              כתובת המייל לקבלת התראות ניהוליות
            </p>
          </div>

          <div>
            <Label htmlFor="from-name">שם השולח</Label>
            <Input
              id="from-name"
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Amazon Dropship"
            />
            <p className="text-sm text-gray-500 mt-1">
              השם שיופיע כשולח במיילים ללקוחות
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            הגדרות משלוח
          </CardTitle>
          <CardDescription>
            עלות משלוח קבועה ותקופת אספקה משוערת
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping-usd">עלות משלוח (USD)</Label>
              <Input
                id="shipping-usd"
                type="number"
                min="0"
                step="0.01"
                value={shippingUsd}
                onChange={(e) => setShippingUsd(e.target.value)}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="shipping-ils">עלות משלוח (ILS)</Label>
              <Input
                id="shipping-ils"
                type="number"
                min="0"
                step="0.01"
                value={shippingIls}
                onChange={(e) => setShippingIls(e.target.value)}
                placeholder="49"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimated-days">זמן אספקה משוער (ימים)</Label>
            <Input
              id="estimated-days"
              type="number"
              min="1"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              placeholder="14"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                <Label htmlFor="free-shipping-enabled">משלוח חינם</Label>
                <p className="text-sm text-gray-500">
                  הפעל משלוח חינם מעל סכום מסוים
                </p>
              </div>
              <Switch
                id="free-shipping-enabled"
                checked={freeShippingEnabled}
                onCheckedChange={setFreeShippingEnabled}
              />
            </div>

            {freeShippingEnabled && (
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <Label htmlFor="free-shipping-usd">סף למשלוח חינם (USD)</Label>
                  <Input
                    id="free-shipping-usd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={freeShippingThresholdUsd}
                    onChange={(e) => setFreeShippingThresholdUsd(e.target.value)}
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0 = ללא משלוח חינם
                  </p>
                </div>
                <div>
                  <Label htmlFor="free-shipping-ils">סף למשלוח חינם (ILS)</Label>
                  <Input
                    id="free-shipping-ils"
                    type="number"
                    min="0"
                    step="0.01"
                    value={freeShippingThresholdIls}
                    onChange={(e) => setFreeShippingThresholdIls(e.target.value)}
                    placeholder="350"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0 = ללא משלוח חינם
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            דרישות הזמנה מינימליות
          </CardTitle>
          <CardDescription>
            סכום מינימלי ומספר פריטים מינימלי להזמנה (0 = ללא מגבלה)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimum-usd">סכום מינימלי (USD)</Label>
              <Input
                id="minimum-usd"
                type="number"
                min="0"
                step="0.01"
                value={minimumAmountUsd}
                onChange={(e) => setMinimumAmountUsd(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="minimum-ils">סכום מינימלי (ILS)</Label>
              <Input
                id="minimum-ils"
                type="number"
                min="0"
                step="0.01"
                value={minimumAmountIls}
                onChange={(e) => setMinimumAmountIls(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="minimum-items">מספר פריטים מינימלי</Label>
            <Input
              id="minimum-items"
              type="number"
              min="0"
              value={minimumItemsCount}
              onChange={(e) => setMinimumItemsCount(e.target.value)}
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              0 = ללא מגבלה על מספר הפריטים
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          איפוס לברירת מחדל
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          שמור שינויים
        </Button>
      </div>

      {/* Current Settings Display */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>הגדרות נוכחיות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">שם האתר:</span> {settings.general?.siteName}
              </div>
              <div>
                <span className="font-semibold">מטבע:</span> {settings.general?.currency}
              </div>
              <div>
                <span className="font-semibold">אזור זמן:</span> {settings.general?.timezone}
              </div>
              <div>
                <span className="font-semibold">התראות מייל:</span> {settings.email?.notifications?.enabled ? 'פעיל' : 'כבוי'}
              </div>
              <div>
                <span className="font-semibold">מייל מנהל:</span> {settings.email?.notifications?.adminEmail || 'לא הוגדר'}
              </div>
              <div>
                <span className="font-semibold">משלוח USD:</span> ${settings.shipping?.flatRate?.usd}
              </div>
              <div>
                <span className="font-semibold">משלוח ILS:</span> ₪{settings.shipping?.flatRate?.ils}
              </div>
              <div>
                <span className="font-semibold">זמן אספקה:</span> {settings.shipping?.estimatedDays} ימים
              </div>
              <div>
                <span className="font-semibold">משלוח חינם:</span> {settings.shipping?.freeShipping?.enabled ? 'פעיל' : 'כבוי'}
              </div>
              {settings.shipping?.freeShipping?.enabled && (
                <>
                  <div>
                    <span className="font-semibold">סף משלוח חינם USD:</span> ${settings.shipping?.freeShipping?.threshold?.usd}
                  </div>
                  <div>
                    <span className="font-semibold">סף משלוח חינם ILS:</span> ₪{settings.shipping?.freeShipping?.threshold?.ils}
                  </div>
                </>
              )}
              <div>
                <span className="font-semibold">מינימום USD:</span> ${settings.order?.minimumAmount?.usd}
              </div>
              <div>
                <span className="font-semibold">מינימום ILS:</span> ₪{settings.order?.minimumAmount?.ils}
              </div>
              <div>
                <span className="font-semibold">מינימום פריטים:</span> {settings.order?.minimumItemsCount}
              </div>
              <div>
                <span className="font-semibold">שער המרה:</span> {settings.pricing?.usdToIls} USD→ILS
              </div>
              <div>
                <span className="font-semibold">מכפיל רמה 1:</span> x{settings.pricing?.multipliers?.tier1?.multiplier} (עד ${settings.pricing?.multipliers?.tier1?.maxPrice})
              </div>
              <div>
                <span className="font-semibold">מכפיל רמה 2:</span> x{settings.pricing?.multipliers?.tier2?.multiplier} (עד ${settings.pricing?.multipliers?.tier2?.maxPrice})
              </div>
              <div>
                <span className="font-semibold">מכפיל רמה 3:</span> x{settings.pricing?.multipliers?.tier3?.multiplier} (${settings.pricing?.multipliers?.tier2?.maxPrice}+)
              </div>
              <div className="text-gray-500">
                <span className="font-semibold">עודכן לאחרונה:</span>{' '}
                {new Date(settings.lastUpdated).toLocaleString('he-IL')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
