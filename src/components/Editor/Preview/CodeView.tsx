import { useMemo, useState, useEffect, useRef } from 'react';
import { Copy, Check, Download, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { generateHTML, previewResolver } from '../../../lib/htmlGenerator';

/**
 * Code mode.
 *
 * Shows the full email HTML — the same document the export ships as
 * index.html — and keeps it in two-way sync with the canvas: canvas edits
 * flow into the code live, and typing in the code applies back onto the
 * canvas after a short debounce.
 *
 * Uploaded images are stored as base64 data URIs, so the raw HTML has huge
 * `data:image/png;base64,…` blobs baked into every <img>. That drowned the
 * textarea in unreadable base64. To keep the code readable, each unique
 * data-URI is replaced with a short placeholder token
 * (`data:image/png;base64,{{img:1}}`) in the textarea only. Copy, Download
 * and the auto-apply-to-canvas flow expand the tokens back to the real
 * data-URIs so nothing downstream loses image bytes.
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

  const [copied, setCopied] = useState(false);

  const rawHtml = useMemo(
    () => (current ? generateHTML(current, globalSettings, previewResolver(images)) : ''),
    [current, globalSettings, images]
  );

  const override = current?.htmlOverride ?? null;
  // Base HTML the textarea should track when there's no override.
  const baseHtml = override ?? rawHtml;
  const { display: baseDisplay, tokens: baseTokens } = useMemo(
    () => encodeInlineImages(baseHtml),
    [baseHtml]
  );

  const [draft, setDraft] = useState(baseDisplay);
  useEffect(() => {
    // When we're not in custom-HTML mode, keep the textarea live-synced to
    // whatever the canvas is generating.
    if (!override) setDraft(baseDisplay);
  }, [baseDisplay, override]);

  // Debounced auto-apply: typing in the code updates the canvas ~500ms later.
  // The stored HTML (and the exported HTML) always contains real data URIs —
  // tokens are a display-only convenience.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (draft === baseDisplay) return;
    const t = setTimeout(
      () => setHtmlOverride(decodeInlineImages(draft, baseTokens)),
      500
    );
    return () => clearTimeout(t);
    // baseDisplay/baseTokens intentionally omitted: react only to what the
    // user typed, not to store updates we just caused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  if (!current) return null;

  const dirty = draft !== baseDisplay;
  const codeToShip = decodeInlineImages(draft, baseTokens);
  const imageCount = Object.keys(baseTokens).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codeToShip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the textarea is selectable as a fallback */
    }
  };

  const download = () => {
    const blob = new Blob([codeToShip], { type: 'text/html' });
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
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          Newsletter HTML
        </span>
        <span className="text-[11px] text-gray-500">
          {codeToShip.length.toLocaleString()} chars
        </span>
        <span className="text-[11px] text-gray-500 hidden md:inline">
          · same document as the exported <code className="text-gray-400">index.html</code>
        </span>
        {imageCount > 0 && (
          <span
            className="text-[10.5px] text-gray-500 hidden md:inline"
            title="Uploaded images are stored as base64 data URIs. They are shown here as short placeholders so the code stays readable — the real bytes are restored on Copy, Download and when your edits apply to the canvas."
          >
            · {imageCount} inline image{imageCount === 1 ? '' : 's'} shown as{' '}
            <code className="text-gray-400">{'{{img:N}}'}</code>
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {dirty && !override && (
            <span
              className="text-[10.5px] text-amber-300/80"
              title="Waiting to apply your changes to the canvas"
            >
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
            <b>Custom HTML is active — the canvas now shows exactly this code.</b> Section editing
            on the canvas no longer changes the output because hand-typed HTML cannot be parsed
            back into sections. Your sections are still saved — click <b>Revert to sections</b> to
            switch back.
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
// Inline-image placeholder encoding.
//
// A newsletter can carry a handful of large base64 data URIs (an uploaded
// logo, banner image, etc). Rendering those literally in the code textarea
// buries the actual markup under thousands of lines of AAAA… noise.
//
// encodeInlineImages() rewrites every `data:image/…;base64,<payload>` src to
// a short readable placeholder `data:image/…;base64,{{img:N}}` and returns
// the payloads in a map. decodeInlineImages() reverses the substitution so
// the version we save, copy, download and apply back to the canvas is the
// real full-fidelity HTML. Users who don't touch the placeholders (the
// common case — you edit the surrounding text, not the base64 blob) get
// perfect round-tripping.
// ---------------------------------------------------------------------------

interface EncodedHtml {
  display: string;
  tokens: Record<string, string>; // token id -> full data URI
}

function encodeInlineImages(html: string): EncodedHtml {
  const tokens: Record<string, string> = {};
  const byUrl = new Map<string, string>(); // dedup identical data URIs
  let counter = 0;
  const display = html.replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, (match) => {
    if (byUrl.has(match)) return `data:image/placeholder;base64,{{img:${byUrl.get(match)}}}`;
    counter += 1;
    const id = String(counter);
    byUrl.set(match, id);
    tokens[id] = match;
    return `data:image/placeholder;base64,{{img:${id}}}`;
  });
  return { display, tokens };
}

function decodeInlineImages(display: string, tokens: Record<string, string>): string {
  if (!Object.keys(tokens).length) return display;
  return display.replace(
    /data:image\/placeholder;base64,\{\{img:(\d+)\}\}/g,
    (whole, id: string) => tokens[id] ?? whole
  );
}
