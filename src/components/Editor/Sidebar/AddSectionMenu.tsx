import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  SECTION_LABELS,
  BLOCK_CATALOG,
  BLOCK_CATEGORY_ORDER,
  type BlockCategory,
} from '../../../data/sectionDefaults';
import { useNewsletterStore } from '../../../store/useNewsletterStore';

export function AddSectionMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const addSection = useNewsletterStore((s) => s.addSection);
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
    else setQuery('');
  }, [open]);

  /** Matches the block label, its description and its extra keywords. */
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = BLOCK_CATALOG.filter((b) => {
      if (!q) return true;
      const haystack = [SECTION_LABELS[b.type], b.description, ...b.keywords].join(' ').toLowerCase();
      return haystack.includes(q);
    });

    const byCategory = new Map<BlockCategory, typeof BLOCK_CATALOG>();
    matches.forEach((b) => {
      const list = byCategory.get(b.category) ?? [];
      list.push(b);
      byCategory.set(b.category, list);
    });
    return BLOCK_CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
      category: c,
      blocks: byCategory.get(c)!,
    }));
  }, [query]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl bg-[#1D1F1F] text-white hover:bg-black"
      >
        <Plus size={16} /> Add Section
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg z-20 flex flex-col max-h-96">
          <div className="p-2 border-b border-gray-100 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blocks…"
                className="w-full rounded-lg border border-gray-200 pl-7 pr-2 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#FFDA4B]"
              />
            </div>
          </div>

          <div className="overflow-y-auto thin-scroll p-1.5">
            {grouped.length === 0 && (
              <p className="text-[12px] text-gray-400 text-center py-6">No blocks match “{query}”.</p>
            )}
            {grouped.map(({ category, blocks }) => (
              <div key={category} className="mb-1">
                <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {category}
                </div>
                {blocks.map((b) => (
                  <button
                    key={b.type}
                    onClick={() => {
                      addSection(b.type);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex flex-col"
                  >
                    <span className="text-[13px] font-semibold text-gray-800">{SECTION_LABELS[b.type]}</span>
                    <span className="text-[11px] text-gray-400">{b.description}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
