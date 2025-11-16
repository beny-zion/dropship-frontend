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
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/homepage')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate">{homepage.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {homepage.sections.length} sections
            </p>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            size="sm"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{previewMode ? 'מצב עריכה' : 'תצוגה מקדימה'}</span>
            <span className="sm:hidden">{previewMode ? 'ערוך' : 'תצוגה'}</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            size="sm"
          >
            <Save className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{saving ? 'שומר...' : 'שמור שינויים'}</span>
            <span className="sm:hidden">{saving ? '...' : 'שמור'}</span>
          </Button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Component Library (Show from sm screens) */}
        {!previewMode && (
          <div className="hidden sm:block w-40 md:w-44 lg:w-48 xl:w-56 2xl:w-64 border-r bg-white overflow-y-auto flex-shrink-0">
            <ComponentLibrary onAddSection={handleAddSection} />
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-1 sm:p-2 md:p-3 lg:p-4">
          <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
            <Card className="bg-white p-0.5 sm:p-1">
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
                    <div className="text-center py-6 sm:py-8 md:py-10 text-muted-foreground px-2 sm:px-4">
                      <p className="text-xs sm:text-sm mb-0.5 sm:mb-1">דף הבית ריק</p>
                      <p className="text-[10px] sm:text-xs">התחל להוסיף sections</p>
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

        {/* Right Sidebar - Properties Panel (Overlay on very small screens, sidebar on larger) */}
        {!previewMode && selectedSection && (
          <>
            {/* Backdrop for mobile only */}
            <div
              className="sm:hidden fixed inset-0 bg-black/50 z-20"
              onClick={() => setSelectedSection(null)}
            />

            {/* Properties Panel */}
            <div className="fixed sm:relative inset-y-0 left-0 w-full sm:w-56 md:w-64 lg:w-72 xl:w-80 2xl:w-96 border-l bg-white overflow-y-auto z-30 sm:z-auto flex-shrink-0">
              <PropertiesPanel
                section={selectedSection}
                onUpdate={handleUpdateSection}
                onClose={() => setSelectedSection(null)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
