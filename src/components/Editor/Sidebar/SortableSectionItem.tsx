import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, Eye, EyeOff, Palette } from 'lucide-react';
import type { Section } from '../../../types/newsletter';
import { SECTION_LABELS } from '../../../data/sectionDefaults';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { sectionSubtitle, SECTION_COLOR_LABELS } from './sectionSummary';

export function SortableSectionItem({
  section,
  selected,
  draggable = true,
}: {
  section: Section;
  selected: boolean;
  /** Disabled while the sidebar list is filtered by search. */
  draggable?: boolean;
}) {
  const selectSection = useNewsletterStore((s) => s.selectSection);
  const duplicateSection = useNewsletterStore((s) => s.duplicateSection);
  const removeSection = useNewsletterStore((s) => s.removeSection);
  const toggleSectionVisibility = useNewsletterStore((s) => s.toggleSectionVisibility);
  const updateSection = useNewsletterStore((s) => s.updateSection);
  const [showColors, setShowColors] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : section.visible ? 1 : 0.5,
  };

  const iconBtn = `w-6 h-6 rounded-md flex items-center justify-center ${
    selected ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
  }`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectSection(section.id)}
      className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer border ${
        selected ? 'bg-[#1D1F1F] border-[#1D1F1F]' : 'bg-white border-transparent hover:border-gray-200'
      }`}
    >
      {section.colorLabel && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full"
          style={{ background: section.colorLabel }}
          aria-hidden
        />
      )}

      <button
        {...attributes}
        {...listeners}
        className={`drag-handle shrink-0 ${draggable ? 'text-gray-300 hover:text-gray-500' : 'text-gray-200 cursor-default'}`}
        onClick={(e) => e.stopPropagation()}
        title={draggable ? 'Drag to reorder' : 'Clear the search to reorder'}
      >
        <GripVertical size={15} />
      </button>

      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-semibold truncate ${selected ? 'text-white' : 'text-gray-800'}`}>
          {SECTION_LABELS[section.type]}
        </div>
        <div className={`text-[11px] truncate ${selected ? 'text-gray-300' : 'text-gray-400'}`}>
          {sectionSubtitle(section)}
        </div>
      </div>

      <div
        className={`flex items-center gap-0.5 shrink-0 ${
          selected || showColors ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColors((v) => !v);
          }}
          title="Colour label"
          className={iconBtn}
        >
          <Palette size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSectionVisibility(section.id);
          }}
          title={section.visible ? 'Hide section' : 'Show section'}
          className={iconBtn}
        >
          {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateSection(section.id);
          }}
          title="Duplicate section"
          className={iconBtn}
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSection(section.id);
          }}
          title="Delete section"
          className={`w-6 h-6 rounded-md flex items-center justify-center ${
            selected ? 'text-gray-300 hover:text-red-400 hover:bg-white/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {showColors && (
        <div
          className="absolute right-2 top-full mt-1 z-20 bg-white rounded-lg border border-gray-200 shadow-lg p-1.5 flex gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {SECTION_COLOR_LABELS.map((c) => (
            <button
              key={c.value || 'none'}
              title={c.name}
              onClick={() => {
                updateSection(section.id, { colorLabel: c.value } as Partial<Section>);
                setShowColors(false);
              }}
              className={`w-5 h-5 rounded-full border ${
                section.colorLabel === c.value ? 'border-gray-800' : 'border-gray-200'
              }`}
              style={{ background: c.value || 'transparent' }}
            >
              {!c.value && <span className="text-[10px] text-gray-400">×</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
