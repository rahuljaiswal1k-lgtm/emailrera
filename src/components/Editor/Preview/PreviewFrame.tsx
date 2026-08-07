import { useMemo, useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { generateHTML, previewResolver } from '../../../lib/htmlGenerator';
import type { CanvasMessage } from '../../../lib/canvasEditor';

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

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const html = useMemo(() => {
    if (!current) return '';
    return generateHTML(current, globalSettings, previewResolver(images), {
      interactive: true,
      selectedId: selectedSectionId,
    });
  }, [current, images, globalSettings, selectedSectionId]);

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
  }, [selectSection, duplicateSection, removeSection, setSections]);

  if (!current) return null;

  const frameWidth = device === 'mobile' ? 400 : 700;

  return (
    <div className="flex-1 min-w-0 bg-[#E9EBEF] flex flex-col">
      <div className="flex items-center justify-center gap-3 py-2 border-b border-gray-200 bg-white">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Live Preview</span>
        <span className="text-[11px] text-gray-400 hidden lg:inline">
          click a section to edit · drag to reorder
        </span>
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

      <div className="flex-1 overflow-y-auto thin-scroll py-8 px-4">
        <iframe
          ref={iframeRef}
          title="Newsletter preview"
          srcDoc={html}
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
    </div>
  );
}
