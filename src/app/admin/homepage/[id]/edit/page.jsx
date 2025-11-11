'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getHomePageById, updateHomePage, addSection, updateSection, reorderSections, deleteSection } from '@/lib/api/homepage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Loading from '@/components/shared/Loading';
import ComponentLibrary from '@/components/admin/homepage/ComponentLibrary';
import SortableSection from '@/components/admin/homepage/SortableSection';
import PropertiesPanel from '@/components/admin/homepage/PropertiesPanel';
import { Save, Eye, ArrowLeft } from 'lucide-react';

export default function HomePageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [homepage, setHomepage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadHomePage();
  }, [params.id]);

  const loadHomePage = async () => {
    try {
      setLoading(true);
      const response = await getHomePageById(params.id);
      if (response.success) {
        setHomepage(response.data);
        // Sort sections by displayOrder
        if (response.data.sections) {
          response.data.sections.sort((a, b) => a.displayOrder - b.displayOrder);
        }
      }
    } catch (err) {
      alert('שגיאה בטעינת דף הבית: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = homepage.sections.findIndex((s) => s._id === active.id);
      const newIndex = homepage.sections.findIndex((s) => s._id === over.id);

      const newSections = arrayMove(homepage.sections, oldIndex, newIndex);

      // Update displayOrder
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        displayOrder: index
      }));

      setHomepage({ ...homepage, sections: updatedSections });

      // Save to backend
      try {
        await reorderSections(
          params.id,
          updatedSections.map((s) => ({ sectionId: s._id, displayOrder: s.displayOrder }))
        );
      } catch (err) {
        alert('שגיאה בשמירת הסדר: ' + err.message);
        loadHomePage(); // Reload on error
      }
    }
  };

  const handleAddSection = async (sectionTemplate) => {
    try {
      const response = await addSection(params.id, {
        ...sectionTemplate,
        displayOrder: homepage.sections.length
      });

      if (response.success) {
        loadHomePage();
      }
    } catch (err) {
      alert('שגיאה בהוספת section: ' + err.message);
    }
  };

  const handleUpdateSection = async (updatedSection) => {
    try {
      // Update section on the server
      const response = await updateSection(params.id, updatedSection._id, updatedSection);

      if (response.success) {
        // Update local state with server response
        setHomepage(response.data);
        alert('השינויים נשמרו בהצלחה!');
      }
    } catch (err) {
      alert('שגיאה בשמירת השינויים: ' + err.message);
      // Reload to get fresh data
      loadHomePage();
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק section זה?')) return;

    try {
      await deleteSection(params.id, sectionId);
      loadHomePage();
      if (selectedSection?._id === sectionId) {
        setSelectedSection(null);
      }
    } catch (err) {
      alert('שגיאה במחיקת section: ' + err.message);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Extract only the fields we want to update (excluding sections - they are updated separately)
      const { _id, createdAt, updatedAt, publishedAt, createdBy, lastModifiedBy, __v, analytics, sections, ...updateData } = homepage;

      await updateHomePage(params.id, updateData);
      alert('השינויים נשמרו בהצלחה!');
    } catch (err) {
      alert('שגיאה בשמירה: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (!homepage) return <div>דף בית לא נמצא</div>;

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/homepage')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{homepage.name}</h1>
            <p className="text-sm text-muted-foreground">
              {homepage.sections.length} sections
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'מצב עריכה' : 'תצוגה מקדימה'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Library */}
        {!previewMode && (
          <div className="w-80 border-r bg-white overflow-y-auto">
            <ComponentLibrary onAddSection={handleAddSection} />
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-white p-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={homepage.sections.map((s) => s._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {homepage.sections.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <p className="text-lg mb-2">דף הבית ריק</p>
                      <p className="text-sm">התחל להוסיף sections מהספרייה בצד שמאל</p>
                    </div>
                  ) : (
                    homepage.sections.map((section) => (
                      <SortableSection
                        key={section._id}
                        section={section}
                        isSelected={selectedSection?._id === section._id}
                        onClick={() => setSelectedSection(section)}
                        onDelete={() => handleDeleteSection(section._id)}
                        previewMode={previewMode}
                      />
                    ))
                  )}
                </SortableContext>
              </DndContext>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        {!previewMode && selectedSection && (
          <div className="w-96 border-l bg-white overflow-y-auto">
            <PropertiesPanel
              section={selectedSection}
              onUpdate={handleUpdateSection}
              onClose={() => setSelectedSection(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
