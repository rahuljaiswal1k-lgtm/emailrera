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
const INLINE_TAGS = 'b|i|u|s|strong|em|mark|br|ul|ol|li';

export function rich(str: string): string {
  return esc(str ?? '')
    .replace(new RegExp(`&lt;(/?(?:${INLINE_TAGS}))&gt;`, 'gi'), '<$1>')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/\n/g, '<br>');
}

/**
 * Strip everything except the inline whitelist — used when saving canvas
 * edits. Two things happen before the strip:
 *
 *  - Any `<span style="…background-color:…">` (what `execCommand('hiliteColor')`
 *    produces for the highlight button) is normalised to `<mark>` so it isn't
 *    silently discarded.
 *  - `<div>` / `<p>` from paste-in-contenteditable are turned into a `<br>`
 *    boundary so line breaks survive.
 *
 * We do NOT collapse runs of whitespace or trim — a user typing two spaces
 * or leaving a trailing space in a field expects that to be kept.
 */
export function sanitizeRich(html: string): string {
  return (html ?? '')
    .replace(
      /<span\b[^>]*background-color\s*:[^>]*>([\s\S]*?)<\/span>/gi,
      '<mark>$1</mark>'
    )
    // Lists produced by execCommand('insertUnorderedList' / 'insertOrderedList')
    // must survive whole; only strip their style/class attributes.
    .replace(/<(ul|ol|li)\b[^>]*>/gi, '<$1>')
    // <div>/<p> from paste-in-contenteditable become <br> boundaries so line
    // breaks land in the store.
    .replace(/<\/(?:div|p)>/gi, '<br>')
    .replace(/<(?:div|p)\b[^>]*>/gi, '')
    .replace(/<(?!\/?(?:b|i|u|s|strong|em|mark|br|ul|ol|li)\b)[^>]*>/gi, '')
    .replace(/(<br>\s*){3,}/gi, '<br><br>');
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
