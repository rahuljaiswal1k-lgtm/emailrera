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

/**
 * Escapes text but keeps a small whitelist of inline formatting tags, so text
 * edited in the canvas can carry bold / italic / underline / highlight without
 * ever letting arbitrary HTML through. Newlines become <br>.
 */
const INLINE_TAGS = 'b|i|u|s|strong|em|mark|br';

export function rich(str: string): string {
  return esc(str ?? '')
    .replace(new RegExp(`&lt;(/?(?:${INLINE_TAGS}))&gt;`, 'gi'), '<$1>')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/\n/g, '<br>');
}

/** Strip everything except the inline whitelist — used when saving canvas edits. */
export function sanitizeRich(html: string): string {
  return (html ?? '')
    .replace(/<(?!\/?(?:b|i|u|s|strong|em|mark|br)\b)[^>]*>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
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
