import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { SortableSectionItem } from './SortableSectionItem';
import { AddSectionMenu } from './AddSectionMenu';

export function Sidebar() {
  const current = useNewsletterStore((s) => s.current);
  const selectedSectionId = useNewsletterStore((s) => s.selectedSectionId);
  const setSections = useNewsletterStore((s) => s.setSections);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  if (!current) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = current.sections.findIndex((s) => s.id === active.id);
    const newIndex = current.sections.findIndex((s) => s.id === over.id);
    setSections(arrayMove(current.sections, oldIndex, newIndex));
  };

  return (
    <aside className="w-72 shrink-0 border-r border-gray-200 bg-[#F7F8FA] flex flex-col">
      <div className="px-3 pt-4 pb-2">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1.5">Sections</h2>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll px-3 space-y-1 pb-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={current.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {current.sections.map((section) => (
              <SortableSectionItem key={section.id} section={section} selected={section.id === selectedSectionId} />
            ))}
          </SortableContext>
        </DndContext>
        {current.sections.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8 px-4">No sections yet. Add your first section below.</p>
        )}
      </div>
      <div className="p-3 border-t border-gray-200">
        <AddSectionMenu />
      </div>
    </aside>
  );
}
