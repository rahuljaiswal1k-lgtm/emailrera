import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Collapsible group used to organise the Properties panel. The Design tab in
 * particular has grown well past a single scroll, so its controls are grouped
 * into Layout / Spacing / Colours / Borders / Effects rather than one long list.
 */
export function PanelGroup({
  title,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-1.5 py-2.5 text-left group"
      >
        {open ? (
          <ChevronDown size={13} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronRight size={13} className="text-gray-400 shrink-0" />
        )}
        <span className="text-[11.5px] font-bold text-gray-600 uppercase tracking-wide group-hover:text-gray-900">
          {title}
        </span>
        {badge !== undefined && badge !== 0 && badge !== '' && (
          <span className="ml-auto text-[10px] px-1.5 rounded-full bg-gray-100 text-gray-500">{badge}</span>
        )}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}
