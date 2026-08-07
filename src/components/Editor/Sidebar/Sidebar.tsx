import { useState, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Search, X } from 'lucide-react';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { SECTION_LABELS } from '../../../data/sectionDefaults';
import { sectionSubtitle } from './sectionSummary';
import { SortableSectionItem } from './SortableSectionItem';
import { AddSectionMenu } from './AddSectionMenu';

export function Sidebar() {
  const current = useNewsletterStore((s) => s.current);
  const selectedSectionId = useNewsletterStore((s) => s.selectedSectionId);
  const setSections = useNewsletterStore((s) => s.setSections);
  const [query, setQuery] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const sections = useMemo(() => current?.sections ?? [], [current]);

  /** Filtered view for the search box. Dragging is disabled while filtering. */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((s) =>
      `${SECTION_LABELS[s.type]} ${sectionSubtitle(s)}`.toLowerCase().includes(q)
    );
  }, [sections, query]);

  if (!current) return null;

  const filtering = query.trim().length > 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setSections(arrayMove(sections, oldIndex, newIndex));
  };

  return (
    <aside className="w-72 shrink-0 border-r border-gray-200 bg-[#F7F8FA] flex flex-col">
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center justify-between px-1.5 mb-2">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Sections</h2>
          <span className="text-[11px] text-gray-400">{sections.length}</span>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections…"
            className="w-full rounded-lg border border-gray-200 bg-white pl-7 pr-7 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#FFDA4B]"
          />
          {filtering && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll px-3 space-y-1 pb-3">
        {filtering ? (
          // Reordering while filtered would be ambiguous, so the list is static.
          visible.map((section) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              selected={section.id === selectedSectionId}
              draggable={false}
            />
          ))
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  selected={section.id === selectedSectionId}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {sections.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8 px-4">No sections yet. Add your first section below.</p>
        )}
        {filtering && visible.length === 0 && sections.length > 0 && (
          <p className="text-xs text-gray-400 text-center py-8 px-4">No sections match “{query}”.</p>
        )}
      </div>

      <div className="p-3 border-t border-gray-200">
        <AddSectionMenu />
      </div>
    </aside>
  );
}
