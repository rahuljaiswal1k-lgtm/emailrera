import type { Section } from '../../../types/newsletter';

/**
 * One-line summary shown under each section in the sidebar. Extracted from
 * SortableSectionItem so the sidebar search can match against the same text
 * the user actually sees.
 */
export function sectionSubtitle(section: Section): string {
  switch (section.type) {
    case 'hero':
      return section.title || 'Untitled headline';
    case 'content':
      return section.heading || 'Untitled';
    case 'infoCard':
      return section.heading || 'Untitled';
    case 'mythFact':
      return `${section.myths.length} myth${section.myths.length !== 1 ? 's' : ''} · ${section.facts.length} fact${
        section.facts.length !== 1 ? 's' : ''
      }`;
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
    case 'textBlock':
      return section.heading || section.eyebrow || 'Text block';
    case 'boxGroup':
      return `${section.heading || 'Callouts'} · ${section.boxes?.length ?? 0} box${
        (section.boxes?.length ?? 0) === 1 ? '' : 'es'
      }`;
    case 'listBlock':
      return `${section.listStyle} · ${section.items.length} item${section.items.length === 1 ? '' : 's'}`;
    case 'columns':
      return `${section.count}-column ${section.columnStyle}`;
    case 'faq':
      return `${section.items.length} question${section.items.length === 1 ? '' : 's'}`;
    case 'comparison':
      return `${section.leftTitle} vs ${section.rightTitle}`;
    case 'testimonial':
      return section.authorName || 'Testimonial';
    case 'logoStrip':
      return `${section.imageIds.length} logo${section.imageIds.length === 1 ? '' : 's'}`;
    case 'gallery':
      return `${section.imageIds.length} image${section.imageIds.length === 1 ? '' : 's'}`;
    case 'divider':
      return section.dividerStyle === 'label' && section.label ? section.label : section.dividerStyle;
    case 'ctaBanner':
      return section.heading || 'CTA banner';
    case 'imageBanner':
      return section.heading || 'Image banner';
    case 'footer':
      return [
        section.showOffices !== false ? 'offices' : null,
        section.showSocial !== false ? 'social' : null,
        section.showLegal !== false ? 'legal' : null,
      ]
        .filter(Boolean)
        .join(' · ') || 'Footer';
    default:
      return '';
  }
}

/** Colour swatches offered for the sidebar colour-label feature. */
export const SECTION_COLOR_LABELS: { value: string; name: string }[] = [
  { value: '', name: 'None' },
  { value: '#EF4444', name: 'Red' },
  { value: '#F59E0B', name: 'Amber' },
  { value: '#10B981', name: 'Green' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#8B5CF6', name: 'Purple' },
];
