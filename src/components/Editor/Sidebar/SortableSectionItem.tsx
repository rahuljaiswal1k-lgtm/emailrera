import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Section } from '../../../types/newsletter';
import { SECTION_LABELS } from '../../../data/sectionDefaults';
import { useNewsletterStore } from '../../../store/useNewsletterStore';

function sectionSubtitle(section: Section): string {
  switch (section.type) {
    case 'hero':
      return section.title || 'Untitled headline';
    case 'content':
      return section.heading || 'Untitled';
    case 'infoCard':
      return section.heading || 'Untitled';
    case 'mythFact':
      return `${section.myths.length} myth${section.myths.length !== 1 ? 's' : ''} · ${section.facts.length} fact${section.facts.length !== 1 ? 's' : ''}`;
    case 'image':
      return section.layout;
    case 'quote':
      return section.heading || section.eyebrow;
    case 'cta':
      return section.heading || 'Untitled';
    case 'stats':
      return `${section.metrics.filter((m) => m.show).length} metrics shown`;
    case 'about':
      return section.heading || 'Untitled';
    default:
      return '';
  }
}

export function SortableSectionItem({ section, selected }: { section: Section; selected: boolean }) {
  const selectSection = useNewsletterStore((s) => s.selectSection);
  const duplicateSection = useNewsletterStore((s) => s.duplicateSection);
  const removeSection = useNewsletterStore((s) => s.removeSection);
  const toggleSectionVisibility = useNewsletterStore((s) => s.toggleSectionVisibility);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : section.visible ? 1 : 0.5,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectSection(section.id)}
      className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer border ${
        selected ? 'bg-[#1D1F1F] border-[#1D1F1F]' : 'bg-white border-transparent hover:border-gray-200'
      }`}
    >
      <button {...attributes} {...listeners} className="drag-handle text-gray-300 hover:text-gray-500 shrink-0" onClick={(e) => e.stopPropagation()}>
        <GripVertical size={15} />
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-semibold truncate ${selected ? 'text-white' : 'text-gray-800'}`}>
          {SECTION_LABELS[section.type]}
        </div>
        <div className={`text-[11px] truncate ${selected ? 'text-gray-300' : 'text-gray-400'}`}>{sectionSubtitle(section)}</div>
      </div>
      <div className={`flex items-center gap-0.5 shrink-0 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSectionVisibility(section.id);
          }}
          title={section.visible ? 'Hide section' : 'Show section'}
          className={`w-6 h-6 rounded-md flex items-center justify-center ${selected ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`}
        >
          {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateSection(section.id);
          }}
          title="Duplicate section"
          className={`w-6 h-6 rounded-md flex items-center justify-center ${selected ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`}
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSection(section.id);
          }}
          title="Delete section"
          className={`w-6 h-6 rounded-md flex items-center justify-center ${selected ? 'text-gray-300 hover:text-red-400 hover:bg-white/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
