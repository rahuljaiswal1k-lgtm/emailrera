import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { SECTION_LABELS } from '../../../data/sectionDefaults';
import { HeroFields } from './sections/HeroFields';
import { ContentFields } from './sections/ContentFields';
import { InfoCardFields } from './sections/InfoCardFields';
import { MythFactFields } from './sections/MythFactFields';
import { ImageFields } from './sections/ImageFields';
import { QuoteFields } from './sections/QuoteFields';
import { CTAFields } from './sections/CTAFields';
import { StatsFields } from './sections/StatsFields';
import { AboutFields } from './sections/AboutFields';
import { Settings2 } from 'lucide-react';

export function PropertiesPanel() {
  const current = useNewsletterStore((s) => s.current);
  const selectedSectionId = useNewsletterStore((s) => s.selectedSectionId);

  const section = current?.sections.find((s) => s.id === selectedSectionId) ?? null;

  return (
    <aside className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Properties</h2>
        {section && <p className="text-sm font-semibold text-gray-900 mt-0.5">{SECTION_LABELS[section.type]}</p>}
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll px-4 py-4">
        {!section ? (
          <div className="text-center py-16 px-4">
            <Settings2 className="mx-auto text-gray-200 mb-3" size={30} />
            <p className="text-sm text-gray-400">Select a section on the left to edit its content.</p>
          </div>
        ) : (
          <SectionFields section={section} />
        )}
      </div>
    </aside>
  );
}

function SectionFields({ section }: { section: NonNullable<ReturnType<typeof useSelectedSection>> }) {
  switch (section.type) {
    case 'hero':
      return <HeroFields section={section} />;
    case 'content':
      return <ContentFields section={section} />;
    case 'infoCard':
      return <InfoCardFields section={section} />;
    case 'mythFact':
      return <MythFactFields section={section} />;
    case 'image':
      return <ImageFields section={section} />;
    case 'quote':
      return <QuoteFields section={section} />;
    case 'cta':
      return <CTAFields section={section} />;
    case 'stats':
      return <StatsFields section={section} />;
    case 'about':
      return <AboutFields section={section} />;
    default:
      return null;
  }
}

// helper purely for typing SectionFields' prop from the same source as above
function useSelectedSection() {
  const current = useNewsletterStore((s) => s.current);
  const selectedSectionId = useNewsletterStore((s) => s.selectedSectionId);
  return current?.sections.find((s) => s.id === selectedSectionId) ?? null;
}
