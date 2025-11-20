import MediaDashboard from '@/components/admin/media/MediaDashboard';

export const metadata = {
  title: 'ניהול מדיה | Admin',
  description: 'ניהול ומעקב אחר תמונות ב-Cloudinary'
};

export default function MediaPage() {
  return <MediaDashboard />;
}
