// Shared HTML-escaping primitives.
//
// These lived privately inside htmlGenerator.ts. They are extracted here so the
// block style / button / container renderers can use the exact same escaping
// rather than each keeping its own copy.

export const EMAIL_FONT = 'Arial,Helvetica,sans-serif';

export function esc(str: string): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function nl2br(str: string): string {
  return esc(str).replace(/\n/g, '<br>');
}

/** Relative luminance test used to pick readable text on a colored surface. */
export function isDark(hex: string): boolean {
  const h = (hex || '').replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55;
}
