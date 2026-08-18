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

  const generated = useMemo(
    () => (current ? generateHTML(current, globalSettings, previewResolver(images)) : ''),
    [current, globalSettings, images]
  );

  const override = current?.htmlOverride ?? null;

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
    const t = setTimeout(() => setHtmlOverride(draft), 500);
    return () => clearTimeout(t);
    // generated intentionally omitted: react only to what the user typed,
    // not to store updates we just caused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  if (!current) return null;

  const dirty = draft !== (override ?? generated);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the textarea is selectable as a fallback */
    }
  };

  const download = () => {
    const blob = new Blob([draft], { type: 'text/html' });
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
        <span className="text-[11px] text-gray-500">{draft.length.toLocaleString()} chars</span>
        <span className="text-[11px] text-gray-500 hidden md:inline">
          · same document as the exported <code className="text-gray-400">index.html</code>
        </span>

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
