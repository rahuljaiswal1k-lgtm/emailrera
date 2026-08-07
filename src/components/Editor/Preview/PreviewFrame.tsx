import { useMemo } from 'react';
import { useNewsletterStore } from '../../../store/useNewsletterStore';
import { generateHTML, previewResolver } from '../../../lib/htmlGenerator';

export function PreviewFrame() {
  const current = useNewsletterStore((s) => s.current);
  const images = useNewsletterStore((s) => s.images);
  const globalSettings = useNewsletterStore((s) => s.globalSettings);

  const html = useMemo(() => {
    if (!current) return '';
    return generateHTML(current, globalSettings, previewResolver(images));
  }, [current, images, globalSettings]);

  if (!current) return null;

  return (
    <div className="flex-1 min-w-0 bg-[#E4E6EB] flex flex-col">
      <div className="flex items-center justify-center gap-2 py-2.5 border-b border-gray-200 bg-white">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Live Preview</span>
        <span className="text-[10px] text-gray-300">·</span>
        <span className="text-[11px] text-gray-400">this is how the final email will look</span>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll py-8 px-4">
        <iframe
          title="Newsletter preview"
          srcDoc={html}
          className="mx-auto block bg-white shadow-md"
          style={{ width: 680, minHeight: 800, border: 'none' }}
          onLoad={(e) => {
            const doc = (e.target as HTMLIFrameElement).contentDocument;
            if (doc) {
              const h = doc.documentElement.scrollHeight;
              (e.target as HTMLIFrameElement).style.height = `${h + 20}px`;
            }
          }}
        />
      </div>
    </div>
  );
}
