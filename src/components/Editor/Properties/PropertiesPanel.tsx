import { useState } from 'react';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { SECTION_LABELS } from '../../../data/sectionDefaults';
import type { Section } from '../../../types/newsletter';
import { HeroFields } from './sections/HeroFields';
import { ContentFields } from './sections/ContentFields';
import { InfoCardFields } from './sections/InfoCardFields';
import { MythFactFields } from './sections/MythFactFields';
import { ImageFields } from './sections/ImageFields';
import { QuoteFields } from './sections/QuoteFields';
import { CTAFields } from './sections/CTAFields';
import { StatsFields } from './sections/StatsFields';
import { AboutFields } from './sections/AboutFields';
import { TextBlockFields } from './sections/TextBlockFields';
import { BoxGroupFields } from './sections/BoxGroupFields';
import { ListBlockFields } from './sections/ListBlockFields';
import { ColumnsFields } from './sections/ColumnsFields';
import { FaqFields } from './sections/FaqFields';
import { ComparisonFields } from './sections/ComparisonFields';
import { TestimonialFields } from './sections/TestimonialFields';
import { LogoStripFields } from './sections/LogoStripFields';
import { GalleryFields } from './sections/GalleryFields';
import { DividerFields } from './sections/DividerFields';
import { CtaBannerFields } from './sections/CtaBannerFields';
import { ImageBannerFields } from './sections/ImageBannerFields';
import { StyleFields } from './shared/StyleFields';
import { ButtonFields } from './shared/ButtonFields';
import { BoxFields } from './shared/BoxFields';
import { Settings2 } from 'lucide-react';

type Tab = 'content' | 'design' | 'buttons' | 'boxes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'content', label: 'Content' },
  { key: 'design', label: 'Design' },
  { key: 'buttons', label: 'Buttons' },
  { key: 'boxes', label: 'Boxes' },
];

export function PropertiesPanel() {
  const current = useNewsletterStore((s) => s.current);
  const selectedSectionId = useNewsletterStore((s) => s.selectedSectionId);
  const [tab, setTab] = useState<Tab>('content');

  const section = current?.sections.find((s) => s.id === selectedSectionId) ?? null;

  const buttonCount = section?.buttons?.enabled ? section.buttons.buttons.length : 0;
  const boxCount = section?.boxes?.length ?? 0;

  return (
    <aside className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Properties</h2>
        {section && <p className="text-sm font-semibold text-gray-900 mt-0.5">{SECTION_LABELS[section.type]}</p>}
      </div>

      {section && (
        <div className="flex border-b border-gray-100 px-2 pt-2 gap-0.5">
          {TABS.map((t) => {
            const count = t.key === 'buttons' ? buttonCount : t.key === 'boxes' ? boxCount : 0;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 text-[11.5px] font-semibold px-1.5 py-2 rounded-t-lg border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-[#1D1F1F] text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className="ml-1 inline-block min-w-[15px] px-1 rounded-full bg-[#FFDA4B] text-[9px] text-[#1D1F1F] align-middle">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto thin-scroll px-4 py-4">
        {!section ? (
          <div className="text-center py-16 px-4">
            <Settings2 className="mx-auto text-gray-200 mb-3" size={30} />
            <p className="text-sm text-gray-400">Select a section on the left to edit its content.</p>
          </div>
        ) : tab === 'content' ? (
          <SectionFields section={section} />
        ) : tab === 'design' ? (
          <StyleFields section={section} />
        ) : tab === 'buttons' ? (
          <ButtonFields section={section} />
        ) : (
          <BoxFields section={section} />
        )}
      </div>
    </aside>
  );
}

/**
 * Per-type content editor. Design / Buttons / Boxes are deliberately NOT here
 * — they come from the shared tabs above, so every block gets them for free.
 */
function SectionFields({ section }: { section: Section }) {
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
    case 'textBlock':
      return <TextBlockFields section={section} />;
    case 'boxGroup':
      return <BoxGroupFields section={section} />;
    case 'listBlock':
      return <ListBlockFields section={section} />;
    case 'columns':
      return <ColumnsFields section={section} />;
    case 'faq':
      return <FaqFields section={section} />;
    case 'comparison':
      return <ComparisonFields section={section} />;
    case 'testimonial':
      return <TestimonialFields section={section} />;
    case 'logoStrip':
      return <LogoStripFields section={section} />;
    case 'gallery':
      return <GalleryFields section={section} />;
    case 'divider':
      return <DividerFields section={section} />;
    case 'ctaBanner':
      return <CtaBannerFields section={section} />;
    case 'imageBanner':
      return <ImageBannerFields section={section} />;
    default:
      return null;
  }
}
