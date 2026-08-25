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
  return autolink(esc(str).replace(/\n/g, '<br>'));
}

/**
 * Escapes text but keeps a small whitelist of inline formatting tags, so text
 * edited in the canvas can carry bold / italic / underline / highlight without
 * ever letting arbitrary HTML through. Newlines become <br>.
 */
const INLINE_TAGS = 'b|i|u|s|strong|em|mark|br|ul|ol|li|a';

export function rich(str: string): string {
  const rendered = esc(str ?? '')
    // Bare open/close tags: <b>, </b>, <mark>, </li>, </a>, …
    .replace(new RegExp(`&lt;(/?(?:${INLINE_TAGS}))&gt;`, 'gi'), '<$1>')
    // Open tags with attributes we care about — currently <mark style="…">
    // (for highlight colour) and <a href="…"> (for hand-added links). Any
    // quotes inside the attributes were escaped to &quot; by esc(); un-escape
    // just those two so the browser parses the tag.
    .replace(
      /&lt;(mark)\s+style=&quot;([^&"<>]*)&quot;&gt;/gi,
      '<$1 style="$2">'
    )
    .replace(
      /&lt;a\s+href=&quot;([^&"<>]*)&quot;(?:\s+target=&quot;([^&"<>]*)&quot;)?&gt;/gi,
      (_m, href: string, target?: string) =>
        `<a href="${href}" target="${target || '_blank'}" rel="noopener" style="color:#1A6CFF;text-decoration:underline;">`
    )
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/\n/g, '<br>');
  return autolink(rendered);
}

/**
 * Wrap bare `https://…` and `www.…` URLs in real <a> tags so anything the
 * user types or pastes becomes clickable in the export. Runs on the already-
 * rendered HTML, so it correctly skips URLs that are already inside an
 * anchor (from the toolbar's Link button or a manual <a> tag).
 */
export function autolink(html: string): string {
  return html.replace(
    /(?<!href=["'])(?<!>)\b(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)(?![^<]*<\/a>)/gi,
    (match: string) => {
      const trimmed = match.replace(/[),.;:!?]+$/, '');
      const trail = match.slice(trimmed.length);
      const href = trimmed.startsWith('www.') ? 'http://' + trimmed : trimmed;
      return `<a href="${href}" target="_blank" rel="noopener" style="color:#1A6CFF;text-decoration:underline;">${trimmed}</a>${trail}`;
    }
  );
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
    // Highlight spans from execCommand('hiliteColor').
    .replace(
      /<span\b[^>]*background-color\s*:[^>]*>([\s\S]*?)<\/span>/gi,
      '<mark>$1</mark>'
    )
    // Lists produced by execCommand: keep the tag but drop style/class attrs.
    .replace(/<(ul|ol|li)\b[^>]*>/gi, '<$1>')
    // Anchor tags: keep href (and target when present) and drop everything
    // else. This is what makes hand-added links survive Save.
    .replace(
      /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi,
      (_m, dq?: string, sq?: string) => {
        const href = (dq ?? sq ?? '').trim();
        return href ? `<a href="${escAttr(href)}">` : '';
      }
    )
    // <div>/<p> from paste-in-contenteditable become <br> boundaries so line
    // breaks land in the store.
    .replace(/<\/(?:div|p)>/gi, '<br>')
    .replace(/<(?:div|p)\b[^>]*>/gi, '')
    .replace(/<(?!\/?(?:b|i|u|s|strong|em|mark|br|ul|ol|li|a)\b)[^>]*>/gi, '')
    .replace(/(<br>\s*){3,}/gi, '<br><br>');
}

/** Small helper: escape only the characters that are unsafe in an HTML
 *  attribute value ("<>&). Kept private so callers can't accidentally
 *  double-escape. */
function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
