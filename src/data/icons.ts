import type { IconDef } from '../types/newsletter';

// Every icon is drawn to sit inside the template's 44px black circle badge,
// using the same 24x24 viewBox / yellow-on-black language as the original
// hand-coded template so generated output is visually indistinguishable.

export const ICONS: IconDef[] = [
  {
    key: 'document',
    label: 'Documentation',
    svg: `<rect x="4" y="3.5" width="12" height="16" rx="1.6" fill="#FFDA4B"/><path d="M7 8h6M7 11.3h6M7 14.6h4" stroke="#1D1F1F" stroke-width="1.4" stroke-linecap="round"/><circle cx="17.5" cy="16.5" r="3.6" fill="#1D1F1F" stroke="#FFDA4B" stroke-width="1.4"/><path d="M16.3 16.5l0.9 0.9 1.6-1.9" stroke="#FFDA4B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    key: 'legal',
    label: 'Legal',
    svg: `<path d="M12 3.6v16.8" stroke="#FFDA4B" stroke-width="1.6" stroke-linecap="round"/><path d="M4 8.4h6M14 8.4h6" stroke="#FFDA4B" stroke-width="1.4" stroke-linecap="round"/><path d="M4 8.4l-2.4 5A2.6 2.6 0 0 0 4 16.8a2.6 2.6 0 0 0 2.4-3.4l-2.4-5z" fill="#FFDA4B"/><path d="M20 8.4l-2.4 5a2.6 2.6 0 0 0 2.4 3.4 2.6 2.6 0 0 0 2.4-3.4l-2.4-5z" fill="#FFDA4B"/><rect x="8" y="19.4" width="8" height="1.6" rx="0.8" fill="#FFDA4B"/>`,
  },
  {
    key: 'warning',
    label: 'Warning',
    svg: `<path d="M12 3.6l8.6 15.2H3.4L12 3.6z" fill="#FFDA4B"/><path d="M12 9.6v4" stroke="#1D1F1F" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="16.2" r="1" fill="#1D1F1F"/>`,
  },
  {
    key: 'construction',
    label: 'Construction',
    svg: `<path d="M4 20V11l8-6 8 6v9" stroke="#FFDA4B" stroke-width="1.6" stroke-linejoin="round" fill="none"/><rect x="10" y="14" width="4" height="6" fill="#FFDA4B"/><path d="M4 20h16" stroke="#FFDA4B" stroke-width="1.6" stroke-linecap="round"/>`,
  },
  {
    key: 'growth',
    label: 'Growth',
    svg: `<path d="M4 17l5-5 3.5 3.5L20 8" stroke="#FFDA4B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M14.5 8h5.5v5.5" stroke="#FFDA4B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  },
  {
    key: 'insight',
    label: 'Insight',
    svg: `<path d="M12 3.6l2.2 4.6 5 .7-3.6 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1-3.6-3.6 5-.7z" fill="#FFDA4B"/>`,
  },
  {
    key: 'marketing',
    label: 'Marketing',
    svg: `<path d="M4 10v4h3l5 3.5V6.5L7 10H4z" fill="#FFDA4B"/><path d="M15 9.5a3.5 3.5 0 0 1 0 5" stroke="#FFDA4B" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M17.5 7.5a6.5 6.5 0 0 1 0 9" stroke="#FFDA4B" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
  },
  {
    key: 'statistics',
    label: 'Statistics',
    svg: `<rect x="5" y="13" width="3.4" height="6.4" rx="0.6" fill="#FFDA4B"/><rect x="10.3" y="9" width="3.4" height="10.4" rx="0.6" fill="#FFDA4B"/><rect x="15.6" y="5.5" width="3.4" height="13.9" rx="0.6" fill="#FFDA4B"/>`,
  },
];

export const getIcon = (key: string): IconDef =>
  ICONS.find((i) => i.key === key) ?? ICONS[0];
