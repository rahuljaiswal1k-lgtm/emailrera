import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { SECTION_LABELS, SECTION_ORDER } from '../../../data/sectionDefaults';
import { useNewsletterStore } from '../../../store/useNewsletterStore';

const DESCRIPTIONS: Record<string, string> = {
  hero: 'Big title banner at the top',
  content: 'Icon + heading + paragraph or list',
  infoCard: 'Highlighted callout box',
  mythFact: 'Common myths vs. correct facts',
  image: 'Photo, graphic, or image layout',
  quote: 'Dark "insight" callout',
  cta: 'Button that drives an action',
  stats: 'Row of company numbers',
  about: 'About RERA Easy + contact box',
};

export function AddSectionMenu() {
  const [open, setOpen] = useState(false);
  const addSection = useNewsletterStore((s) => s.addSection);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl bg-[#1D1F1F] text-white hover:bg-black"
      >
        <Plus size={16} /> Add Section
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg p-1.5 max-h-80 overflow-y-auto thin-scroll z-20">
          {SECTION_ORDER.map((type) => (
            <button
              key={type}
              onClick={() => {
                addSection(type);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex flex-col"
            >
              <span className="text-[13px] font-semibold text-gray-800">{SECTION_LABELS[type]}</span>
              <span className="text-[11px] text-gray-400">{DESCRIPTIONS[type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
