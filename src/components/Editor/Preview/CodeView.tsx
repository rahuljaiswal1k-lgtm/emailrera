import { useMemo, useState, useEffect, useRef } from 'react';
import { Copy, Check, Download, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { generateHTML, previewResolver } from '../../../lib/htmlGenerator';

type Scope = 'section' | 'full';

/**
 * Code mode.
 *
 * The code shown is *only the newsletter* — never dashboard chrome or React
 * source. It updates live as you edit the canvas (or the sections), and typing
 * in the code area updates the canvas back with a short debounce, so both
 * sides stay in sync automatically.
 *
 * Scope toggle:
 *  - "Section HTML" — just the body inside the email container (what most
 *    people mean by "the canvas HTML"): sections, no <html>/<head>/<style>.
 *  - "Full document" — the complete emailable file with <!DOCTYPE>, head,
 *    styles and MSO fallbacks. That is what the export ships as index.html.
 *
 * Reality check on round-tripping: arbitrary hand-typed HTML cannot be parsed
 * back into structured sections, so once you edit the code the newsletter
 * enters "custom HTML" mode and the sidebar sections stop driving the output.
 * A banner says so plainly and "Revert to sections" restores the generated
 * output. Sections are never destroyed.
 */
export function CodeView() {
  const current = useNewsletterStore((s) => s.current);
  const images = useNewsletterStore((s) => s.images);
  const globalSettings = useNewsletterStore((s) => s.globalSettings);
  const setHtmlOverride = useNewsletterStore((s) => s.setHtmlOverride);

  const [scope, setScope] = useState<Scope>('section');
  const [copied, setCopied] = useState(false);

  const fullHtml = useMemo(
    () => (current ? generateHTML(current, globalSettings, previewResolver(images)) : ''),
    [current, globalSettings, images]
  );

  /** The body inside the <body> tag — no doctype, no styles. */
  const sectionHtml = useMemo(() => extractBody(fullHtml), [fullHtml]);

  const override = current?.htmlOverride ?? null;
  const generated = scope === 'full' ? fullHtml : sectionHtml;

  // Draft is what the textarea shows. It follows `generated` when no override
  // is active, so canvas edits flow into the code view live.
  const [draft, setDraft] = useState(override ?? generated);
  useEffect(() => {
    if (!override) setDraft(generated);
  }, [generated, override]);

  // Debounced auto-apply: typing in the code updates the canvas ~500ms later.
  // Skipping the initial mount avoids clobbering a fresh override on first
  // render, and skipping identical values avoids no-op churn.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (draft === (override ?? generated)) return;
    const t = setTimeout(() => {
      // Only the "full" scope stores as htmlOverride; a section-only edit
      // rewrites the body inside the current full document so the wrapping
      // scaffold stays intact.
      const full = scope === 'full' ? draft : replaceBody(fullHtml, draft);
      setHtmlOverride(full);
    }, 500);
    return () => clearTimeout(t);
    // fullHtml/generated intentionally omitted: we only want to react to what
    // the user typed, not to the store change we just caused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  if (!current) return null;

  const dirty = draft !== (override ?? generated);
  const codeToWrite = scope === 'full' ? draft : draft; // shown text is the truth

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codeToWrite);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the textarea is selectable as a fallback */
    }
  };

  const download = () => {
    const out = scope === 'full' ? draft : replaceBody(fullHtml, draft);
    const blob = new Blob([out], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#1D1F1F]">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-white/10 shrink-0">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Newsletter HTML</span>
        <span className="text-[11px] text-gray-500">{draft.length.toLocaleString()} chars</span>

        <div className="flex items-center gap-0.5 bg-white/10 rounded-md p-0.5 ml-2">
          {(['section', 'full'] as Scope[]).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`text-[11px] font-semibold px-2 py-1 rounded ${
                scope === s ? 'bg-white text-[#1D1F1F]' : 'text-gray-300 hover:bg-white/10'
              }`}
              title={
                s === 'section'
                  ? 'Just the canvas body — no <!DOCTYPE>, no styles'
                  : 'Full emailable document, matching the export'
              }
            >
              {s === 'section' ? 'Canvas body' : 'Full document'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {dirty && !override && (
            <span className="text-[10.5px] text-amber-300/80" title="Waiting to apply your changes to the canvas">
              applying…
            </span>
          )}
          <button
            onClick={copy}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10"
          >
            <Download size={12} /> Download
          </button>
          {override && (
            <button
              onClick={() => setHtmlOverride(null)}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 px-2.5 py-1.5 rounded-md hover:bg-white/10"
            >
              <RotateCcw size={12} /> Revert to sections
            </button>
          )}
        </div>
      </div>

      {override && (
        <div className="flex gap-2 items-start px-4 py-2.5 bg-amber-500/15 border-b border-amber-500/25 shrink-0">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-amber-200 leading-relaxed">
            <b>Custom HTML is active — the canvas now shows exactly this code.</b> Section editing on
            the canvas no longer changes the output because hand-typed HTML cannot be parsed back
            into sections. Your sections are still saved — click <b>Revert to sections</b> to switch
            back.
          </p>
        </div>
      )}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        className="flex-1 min-h-0 w-full bg-[#1D1F1F] text-[#D6E2D6] font-mono text-[12px] leading-[19px] p-4 resize-none focus:outline-none thin-scroll"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Body extraction — pure string slicing so the newsletter code shown in
// "Canvas body" mode really is what sits inside the email container.
// ---------------------------------------------------------------------------

/** Return the content between <body …> and </body>. */
function extractBody(html: string): string {
  const start = html.search(/<body\b[^>]*>/i);
  const end = html.search(/<\/body>/i);
  if (start < 0 || end < 0) return html;
  return html
    .slice(html.indexOf('>', start) + 1, end)
    .replace(/^\s+|\s+$/g, '');
}

/** Replace the body of `full` with `body`. Used when saving a section-scope edit. */
function replaceBody(full: string, body: string): string {
  const openMatch = full.match(/<body\b[^>]*>/i);
  const closeMatch = full.match(/<\/body>/i);
  if (!openMatch || !closeMatch) return body;
  const openEnd = (openMatch.index as number) + openMatch[0].length;
  const closeStart = closeMatch.index as number;
  return full.slice(0, openEnd) + '\n' + body + '\n' + full.slice(closeStart);
}
