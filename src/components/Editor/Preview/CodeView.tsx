import { useMemo, useState, useEffect } from 'react';
import { Copy, Check, Download, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { generateHTML, previewResolver } from '../../../lib/htmlGenerator';

/**
 * Code mode — shows the exact HTML the export produces, and lets it be edited.
 *
 * Editing is honest about its trade-off: hand-written HTML cannot be parsed
 * back into sections, so saving an override switches the newsletter to
 * "custom HTML" mode. Preview and export then use that HTML verbatim, and a
 * banner offers a one-click revert back to the section-generated output. The
 * sections themselves are never destroyed — reverting restores them intact.
 */
export function CodeView() {
  const current = useNewsletterStore((s) => s.current);
  const images = useNewsletterStore((s) => s.images);
  const globalSettings = useNewsletterStore((s) => s.globalSettings);
  const setHtmlOverride = useNewsletterStore((s) => s.setHtmlOverride);

  const generated = useMemo(
    () => (current ? generateHTML(current, globalSettings, previewResolver(images)) : ''),
    [current, globalSettings, images]
  );

  const override = current?.htmlOverride ?? null;
  const [draft, setDraft] = useState(override ?? generated);
  const [copied, setCopied] = useState(false);

  // Keep the editor in sync while the user is *not* in override mode.
  useEffect(() => {
    if (!override) setDraft(generated);
  }, [generated, override]);

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
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 shrink-0">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          Generated HTML
        </span>
        <span className="text-[11px] text-gray-500">{draft.length.toLocaleString()} chars</span>

        <div className="ml-auto flex items-center gap-1.5">
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
              onClick={() => {
                setHtmlOverride(null);
                setDraft(generated);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 px-2.5 py-1.5 rounded-md hover:bg-white/10"
            >
              <RotateCcw size={12} /> Revert to sections
            </button>
          )}
          <button
            onClick={() => setHtmlOverride(draft)}
            disabled={!dirty}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-md bg-[#FFDA4B] text-[#1D1F1F] disabled:opacity-40"
          >
            Apply HTML
          </button>
        </div>
      </div>

      {override && (
        <div className="flex gap-2 items-start px-4 py-2.5 bg-amber-500/15 border-b border-amber-500/25 shrink-0">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-amber-200 leading-relaxed">
            <b>Custom HTML is active.</b> The preview and the export now use this HTML verbatim, so
            section editing no longer affects the output. Your sections are still saved — click{' '}
            <b>Revert to sections</b> to go back to them.
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
