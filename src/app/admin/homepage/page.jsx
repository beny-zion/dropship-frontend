'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAllHomePages,
  createHomePage,
  deleteHomePage,
  toggleHomePageStatus,
  cloneHomePage
} from '@/lib/api/homepage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loading from '@/components/shared/Loading';
import EmptyState from '@/components/shared/EmptyState';
import { Pencil, Trash2, Copy, Eye, EyeOff, Plus, BarChart3 } from 'lucide-react';

export default function HomePageManagementPage() {
  const router = useRouter();
  const [homepages, setHomepages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedHomePage, setSelectedHomePage] = useState(null);
  const [newHomePageData, setNewHomePageData] = useState({
    name: '',
    language: 'both'
  });

  useEffect(() => {
    loadHomePages();
  }, []);

  const loadHomePages = async () => {
    try {
      setLoading(true);
      const response = await getAllHomePages();
      if (response.success) {
        setHomepages(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const response = await createHomePage({
        ...newHomePageData,
        sections: []
      });

      if (response.success) {
        setDialogOpen(false);
        setNewHomePageData({ name: '', language: 'both' });
        loadHomePages();
        // Navigate to editor
        router.push(`/admin/homepage/${response.data._id}/edit`);
      }
    } catch (err) {
      alert('שגיאה ביצירת דף בית: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את "${name}"?`)) return;

    try {
      const response = await deleteHomePage(id);
      if (response.success) {
        loadHomePages();
      }
    } catch (err) {
      alert('שגיאה במחיקת דף בית: ' + err.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await toggleHomePageStatus(id);
      if (response.success) {
        loadHomePages();
      }
    } catch (err) {
      alert('שגיאה בשינוי סטטוס: ' + err.message);
    }
  };

  const handleClone = async () => {
    if (!newHomePageData.name) {
      alert('נא להזין שם לדף המשוכפל');
      return;
    }

    try {
      const response = await cloneHomePage(selectedHomePage._id, newHomePageData.name);
      if (response.success) {
        setCloneDialogOpen(false);
        setNewHomePageData({ name: '', language: 'both' });
        setSelectedHomePage(null);
        loadHomePages();
      }
    } catch (err) {
      alert('שגיאה בשכפול דף בית: ' + err.message);
    }
  };

  const openCloneDialog = (homepage) => {
    setSelectedHomePage(homepage);
    setNewHomePageData({ name: `${homepage.name} - עותק`, language: homepage.language });
    setCloneDialogOpen(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול דף הבית</h1>
          <p className="text-muted-foreground mt-1">
            נהל ועצב את דף הבית באופן דינמי
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              דף בית חדש
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>יצירת דף בית חדש</DialogTitle>
              <DialogDescription>
                צור דף בית חדש עם עיצוב מותאם אישית
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">שם דף הבית</Label>
                <Input
                  id="name"
                  placeholder="לדוגמה: דף בית חורף 2024"
                  value={newHomePageData.name}
                  onChange={(e) => setNewHomePageData({ ...newHomePageData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">שפה</Label>
                <Select
                  value={newHomePageData.language}
                  onValueChange={(value) => setNewHomePageData({ ...newHomePageData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">עברית ואנגלית</SelectItem>
                    <SelectItem value="he">עברית בלבד</SelectItem>
                    <SelectItem value="en">אנגלית בלבד</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleCreateNew} disabled={!newHomePageData.name}>
                יצירה
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שכפול דף בית</DialogTitle>
            <DialogDescription>
              צור עותק של "{selectedHomePage?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clone-name">שם לדף המשוכפל</Label>
              <Input
                id="clone-name"
                value={newHomePageData.name}
                onChange={(e) => setNewHomePageData({ ...newHomePageData, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleClone} disabled={!newHomePageData.name}>
              שכפול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          שגיאה: {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && homepages.length === 0 && (
        <EmptyState
          title="אין דפי בית"
          description="התחל ביצירת דף הבית הראשון שלך"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              צור דף בית
            </Button>
          }
        />
      )}

      {/* HomePage List */}
      <div className="grid gap-4">
        {homepages.map((homepage) => (
          <Card key={homepage._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{homepage.name}</h3>
                  {homepage.isActive && (
                    <Badge className="bg-green-500">פעיל</Badge>
                  )}
                  <Badge variant="outline">{
                    homepage.language === 'both' ? 'עב/אנג' :
                    homepage.language === 'he' ? 'עברית' : 'אנגלית'
                  }</Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Sections:</span>{' '}
                    {homepage.sections?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">צפיות:</span>{' '}
                    {homepage.analytics?.views || 0}
                  </div>
                  <div>
                    <span className="font-medium">נוצר:</span>{' '}
                    {new Date(homepage.createdAt).toLocaleDateString('he-IL')}
                  </div>
                  <div>
                    <span className="font-medium">עודכן:</span>{' '}
                    {new Date(homepage.updatedAt).toLocaleDateString('he-IL')}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleToggle(homepage._id)}
                  title={homepage.isActive ? 'השבת' : 'הפעל'}
                >
                  {homepage.isActive ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/admin/homepage/${homepage._id}/stats`)}
                  title="סטטיסטיקות"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openCloneDialog(homepage)}
                  title="שכפל"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/admin/homepage/${homepage._id}/edit`)}
                  title="ערוך"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(homepage._id, homepage.name)}
                  disabled={homepage.isActive}
                  title={homepage.isActive ? 'לא ניתן למחוק דף פעיל' : 'מחק'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
