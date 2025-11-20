'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HardDrive,
  Activity,
  Repeat,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { getMediaStats, syncImages, initialSyncImages } from '@/lib/api/media';
import ImagesTable from './ImagesTable';

export default function MediaDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [initialSyncing, setInitialSyncing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getMediaStats();
      console.log('Media stats full response:', response);
      console.log('Media stats data:', response.data);
      console.log('Has cloudinary?', !!response.data?.cloudinary);
      console.log('Has database?', !!response.data?.database);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('שגיאה בטעינת נתונים: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncImages();
      await fetchStats();
      alert('סנכרון הושלם בהצלחה');
    } catch (error) {
      console.error('Error syncing:', error);
      alert('שגיאה בסנכרון');
    } finally {
      setSyncing(false);
    }
  };

  const handleInitialSync = async () => {
    if (!confirm('האם אתה בטוח? פעולה זו תוסיף את כל התמונות מ-Cloudinary למעקב.')) {
      return;
    }

    try {
      setInitialSyncing(true);
      const response = await initialSyncImages();
      await fetchStats();
      alert(response.message || `נוספו ${response.data?.added || 0} תמונות למעקב`);
      window.location.reload(); // Refresh to see new images
    } catch (error) {
      console.error('Error initial syncing:', error);
      alert('שגיאה בסנכרון ראשוני');
    } finally {
      setInitialSyncing(false);
    }
  };

  if (loading) {
    return <div className="p-8">טוען...</div>;
  }

  if (!stats || !stats.cloudinary || !stats.database) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">לא ניתן לטעון נתונים</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  const { cloudinary, database, sync } = stats;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ניהול מדיה</h1>
        <p className="text-gray-600">ניהול ומעקב אחר תמונות ב-Cloudinary</p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UsageCard
          icon={<HardDrive className="w-6 h-6" />}
          title="אחסון"
          value={`${cloudinary.usage.storage.used} MB`}
          limit={`${cloudinary.usage.storage.limit} MB`}
          percent={cloudinary.usage.storage.percent}
        />
        <UsageCard
          icon={<Activity className="w-6 h-6" />}
          title="רוחב פס"
          value={`${cloudinary.usage.bandwidth.used} MB`}
          limit={`${cloudinary.usage.bandwidth.limit} MB`}
          percent={cloudinary.usage.bandwidth.percent}
        />
        <UsageCard
          icon={<Repeat className="w-6 h-6" />}
          title="טרנספורמציות"
          value={cloudinary.usage.transformations.used.toLocaleString()}
          limit={cloudinary.usage.transformations.limit.toLocaleString()}
          percent={cloudinary.usage.transformations.percent}
        />
      </div>

      {/* Total Credits */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              סך קרדיטים בשימוש
            </span>
            <span className="text-2xl font-bold">
              {cloudinary.usage.credits.used.toFixed(2)} / {cloudinary.usage.credits.limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                cloudinary.usage.credits.percent > 80 ? 'bg-red-500' :
                cloudinary.usage.credits.percent > 50 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(cloudinary.usage.credits.percent, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {cloudinary.usage.credits.percent.toFixed(1)}% בשימוש
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>סטטיסטיקות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatRow label="סך תמונות" value={cloudinary.images.total} />
              <StatRow label="תמונות פעילות" value={database.totalImages} />
              <StatRow
                label="תמונות לא בשימוש"
                value={sync.unusedInCloudinary}
                danger={sync.unusedInCloudinary > 0}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>תמונות לפי סוג</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatRow label="מוצרים" value={database.byType.products} />
              <StatRow label="קטגוריות" value={database.byType.categories} />
              <StatRow label="דף הבית" value={database.byType.homepage} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleSync}
              disabled={syncing || initialSyncing}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'מסנכרן...' : 'בדוק סנכרון'}
            </Button>

            {database.totalImages === 0 && cloudinary.images.total > 0 && (
              <Button
                onClick={handleInitialSync}
                disabled={syncing || initialSyncing}
                variant="default"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${initialSyncing ? 'animate-spin' : ''}`} />
                {initialSyncing ? 'מסנכרן...' : 'סנכרון ראשוני'}
              </Button>
            )}

            {sync.unusedInCloudinary > 0 && (
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                נקה {sync.unusedInCloudinary} תמונות
              </Button>
            )}
          </div>
          {database.totalImages === 0 && cloudinary.images.total > 0 && (
            <p className="mt-3 text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
              ⚠️ יש {cloudinary.images.total} תמונות ב-Cloudinary שלא במעקב. לחץ על "סנכרון ראשוני" להוסיף אותן למערכת.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Images Table */}
      <div className="mt-8">
        <ImagesTable />
      </div>
    </div>
  );
}

function UsageCard({ icon, title, value, limit, percent }) {
  const getColor = (percent) => {
    if (percent > 80) return 'text-red-600';
    if (percent > 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percent) => {
    if (percent > 80) return 'bg-red-500';
    if (percent > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500">{icon}</div>
          <span className={`text-2xl font-bold ${getColor(percent)}`}>
            {percent.toFixed(1)}%
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {value} / {limit}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressColor(percent)}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value, danger = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-semibold ${danger && value > 0 ? 'text-red-600' : ''}`}>
        {value}
      </span>
    </div>
  );
}
