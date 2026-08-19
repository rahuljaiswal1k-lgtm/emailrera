import { useMemo, useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone, Eye, Code2, AlertTriangle } from 'lucide-react';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { generateHTML, previewResolver } from '../../../lib/htmlGenerator';
import { sanitizeRich } from '../../../lib/htmlEscape';
import { CodeView } from './CodeView';
import type { CanvasMessage } from '../../../lib/canvasEditor';
import { styleForType } from '../../../lib/blockStyle';

/**
 * Live preview — and the primary editing surface.
 *
 * The newsletter is rendered into an iframe by the very same generator that
 * produces the export, with an in-canvas editing layer injected in preview mode
 * only. Selecting, reordering, duplicating and deleting sections can all be
 * done directly on the page, which is what makes this behave like Mailchimp or
 * Brevo rather than a read-only picture.
 */
export function PreviewFrame() {
  const current = useNewsletterStore((s) => s.current);
  const images = useNewsletterStore((s) => s.images);
  const globalSettings = useNewsletterStore((s) => s.globalSettings);
  const selectedSectionId = useNewsletterStore((s) => s.selectedSectionId);

  const selectSection = useNewsletterStore((s) => s.selectSection);
  const duplicateSection = useNewsletterStore((s) => s.duplicateSection);
  const removeSection = useNewsletterStore((s) => s.removeSection);
  const setSections = useNewsletterStore((s) => s.setSections);
  const updateSectionField = useNewsletterStore((s) => s.updateSectionField);
  const updateSection = useNewsletterStore((s) => s.updateSection);
  const updateGlobalField = useNewsletterStore((s) => s.updateGlobalField);
  const setHtmlOverride = useNewsletterStore((s) => s.setHtmlOverride);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [mode, setMode] = useState<'design' | 'code'>('design');

  // The freshest HTML the generator can produce right now.
  const nextHtml = useMemo(() => {
    if (!current) return '';
    // Custom HTML from Code mode wins, and is shown without the editing layer
    // since there are no addressable sections in hand-written markup.
    if (current.htmlOverride) return current.htmlOverride;
    // NOTE: selectedSectionId is deliberately NOT a dependency. Regenerating
    // the srcDoc reloads the iframe, which would destroy any inline edit in
    // progress the moment the click selected the section. Selection is pushed
    // into the frame as a message instead.
    return generateHTML(current, globalSettings, previewResolver(images), { interactive: true });
  }, [current, images, globalSettings]);

  // The HTML actually wired into the iframe's `srcDoc`. This lags `nextHtml`
  // on purpose: canvas-sourced edits (contenteditable text, toolbar formatting
  // etc.) already patched the iframe's DOM in place; recomputing the srcDoc
  // would then reload the whole iframe, blowing away the in-progress edit
  // session and eating fast follow-up clicks. `skipReloadRef.current` is set
  // by the canvas message handler for those "canvas already did it" cases so
  // we swallow just that one re-render.
  const [committedHtml, setCommittedHtml] = useState('');
  const skipReloadRef = useRef(false);
  useEffect(() => {
    if (skipReloadRef.current) {
      skipReloadRef.current = false;
      return;
    }
    setCommittedHtml(nextHtml);
  }, [nextHtml]);

  // Push selection into the frame without re-rendering it.
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'nl-editor', type: 'setSelected', id: selectedSectionId },
      '*'
    );
  }, [selectedSectionId, committedHtml]);

  // Messages from the in-canvas editing layer.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data as CanvasMessage;
      if (!msg || msg.source !== 'nl-canvas') return;

      if (msg.type === 'height') {
        const el = iframeRef.current;
        if (el) el.style.height = `${msg.height + 24}px`;
        return;
      }
      if (msg.type === 'select') return selectSection(msg.id);

      // Inline text edited on the canvas. Sanitised to the inline whitelist so
      // contenteditable can never inject arbitrary markup into the newsletter.
      // Paths prefixed "__global." target Global Settings (e.g. office labels /
      // addresses / legal text that appear inside the Footer block but live on
      // the settings object shared across every newsletter).
      //
      // The canvas already updated its own DOM in place (contenteditable did
      // the visual change); skip the srcDoc reload so the active edit session
      // survives.
      if (msg.type === 'edit') {
        const clean = sanitizeRich(msg.value);
        skipReloadRef.current = true;
        if (msg.path.startsWith('__global.')) return updateGlobalField(msg.path.slice('__global.'.length), clean);
        return updateSectionField(msg.id, msg.path, clean);
      }

      // Formatting from the floating toolbar maps onto the block's BlockStyle.
      // Font family / alignment / colour / scale are wrapper-style changes,
      // so we DO let the iframe reload to pick them up — otherwise the
      // dropdown would appear to do nothing.
      if (msg.type === 'format') {
        const sec = useNewsletterStore.getState().current?.sections.find((x) => x.id === msg.id);
        if (!sec) return;
        const style = { ...styleForType(sec.type, sec.style) };
        if (msg.key === 'align') style.align = msg.value as typeof style.align;
        else if (msg.key === 'fontFamily') style.fontFamily = msg.value;
        else if (msg.key === 'fontScale') style.fontScale = msg.value ? Number(msg.value) : 1;
        else if (msg.key === 'textColor') style.textColor = msg.value;
        updateSection(msg.id, { style } as never);
        return;
      }
      if (msg.type === 'duplicate') return duplicateSection(msg.id);
      if (msg.type === 'delete') return removeSection(msg.id);

      const sections = useNewsletterStore.getState().current?.sections;
      if (!sections) return;

      if (msg.type === 'move') {
        const from = sections.findIndex((s) => s.id === msg.id);
        const to = from + msg.dir;
        if (from === -1 || to < 0 || to >= sections.length) return;
        const next = [...sections];
        [next[from], next[to]] = [next[to], next[from]];
        setSections(next);
        return;
      }

      if (msg.type === 'reorder') {
        const moved = sections.find((s) => s.id === msg.id);
        if (!moved) return;
        const without = sections.filter((s) => s.id !== msg.id);
        const insertAt = msg.beforeId ? without.findIndex((s) => s.id === msg.beforeId) : without.length;
        if (insertAt === -1) return;
        const next = [...without];
        next.splice(insertAt, 0, moved);
        setSections(next);
        selectSection(msg.id);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [selectSection, duplicateSection, removeSection, setSections, updateSectionField, updateSection, updateGlobalField]);

  if (!current) return null;

  const frameWidth = device === 'mobile' ? 400 : 700;

  return (
    <div className="flex-1 min-w-0 bg-[#E9EBEF] flex flex-col">
      <div className="flex items-center justify-center gap-3 py-2 border-b border-gray-200 bg-white">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Live Preview</span>
        <span className="text-[11px] text-gray-400 hidden xl:inline">
          click text to edit · drag to reorder
        </span>
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode('design')}
            className={`flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold ${
              mode === 'design' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Eye size={13} /> Design
          </button>
          <button
            onClick={() => setMode('code')}
            className={`flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold ${
              mode === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Code2 size={13} /> Code
          </button>
        </div>
        <div className="flex items-center gap-0.5 ml-2 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setDevice('desktop')}
            title="Desktop width"
            className={`w-7 h-7 rounded-md flex items-center justify-center ${
              device === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            title="Mobile width"
            className={`w-7 h-7 rounded-md flex items-center justify-center ${
              device === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {mode === 'code' ? (
        <CodeView />
      ) : (
      <div className="flex-1 overflow-y-auto thin-scroll py-8 px-4">
        {current.htmlOverride && (
          <div className="mx-auto max-w-3xl mb-3 flex items-start gap-2 px-4 py-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-amber-900 leading-relaxed flex-1">
              <b>Custom HTML is active.</b> The canvas is showing hand-edited code from the Code
              view, so click-to-edit and drag-to-reorder are frozen. Switch back to structured
              sections to edit visually — your sections are still saved.
            </p>
            <button
              onClick={() => setHtmlOverride(null)}
              className="text-[11px] font-semibold text-amber-900 hover:text-amber-700 px-2 py-1 rounded hover:bg-amber-500/10"
            >
              Revert to sections
            </button>
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="Newsletter preview"
          srcDoc={committedHtml}
          className="mx-auto block bg-white shadow-lg rounded-lg transition-[width] duration-200"
          style={{ width: frameWidth, minHeight: 800, border: 'none' }}
          onLoad={(e) => {
            const doc = (e.target as HTMLIFrameElement).contentDocument;
            if (doc) {
              (e.target as HTMLIFrameElement).style.height = `${doc.documentElement.scrollHeight + 24}px`;
            }
          }}
        />
      </div>
      )}
    </div>
  );
}
