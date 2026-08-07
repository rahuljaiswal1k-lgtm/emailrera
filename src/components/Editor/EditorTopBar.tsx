import { useRef, useState } from 'react';
import { ArrowLeft, Copy, Download, Upload, Check, Loader2 } from 'lucide-react';
import { useNewsletterStore } from '../../store/useNewsletterStore';
import { exportNewsletterZip } from '../../lib/exportZip';
import { importNewsletterZip } from '../../lib/importZip';

export function EditorTopBar() {
  const current = useNewsletterStore((s) => s.current);
  const globalSettings = useNewsletterStore((s) => s.globalSettings);
  const images = useNewsletterStore((s) => s.images);
  const saveStatus = useNewsletterStore((s) => s.saveStatus);
  const goToDashboard = useNewsletterStore((s) => s.goToDashboard);
  const updateTitle = useNewsletterStore((s) => s.updateTitle);
  const duplicateCurrentAsNew = useNewsletterStore((s) => s.duplicateCurrentAsNew);
  const importNewsletter = useNewsletterStore((s) => s.importNewsletter);

  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!current) return null;

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await exportNewsletterZip(current, globalSettings, images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the newsletter ZIP.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const { newsletter, images: importedImages } = await importNewsletterZip(file);
      importNewsletter(newsletter, importedImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import this file.');
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-2.5 flex items-center gap-3">
      <button
        onClick={goToDashboard}
        className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"
        title="Back to dashboard"
      >
        <ArrowLeft size={17} />
      </button>

      <input
        value={current.title}
        onChange={(e) => updateTitle(e.target.value)}
        className="text-[15px] font-semibold text-gray-900 bg-transparent focus:outline-none focus:bg-gray-50 rounded-md px-2 py-1 min-w-0 flex-1 max-w-sm"
        placeholder="Untitled Newsletter"
      />

      <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0 mr-2">
        {saveStatus === 'saving' && (
          <>
            <Loader2 size={12} className="animate-spin" /> Saving…
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Check size={12} className="text-green-500" /> Saved
          </>
        )}
        {saveStatus === 'error' && (
          <span className="text-red-600 font-semibold" title="Browser storage is full or unavailable — export this newsletter now to avoid losing it.">
            Not saved
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          onClick={duplicateCurrentAsNew}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Copy size={15} /> Duplicate
        </button>

        <input
          ref={fileInput}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            // Reset the input so picking the same file again still fires onChange.
            const file = e.target.files?.[0];
            e.target.value = '';
            handleImportFile(file);
          }}
        />
        <button
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Upload size={15} /> Import
        </button>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#1D1F1F] bg-[#FFDA4B] hover:brightness-95 px-4 py-2 rounded-lg disabled:opacity-60"
        >
          <Download size={15} /> {exporting ? 'Generating…' : 'Generate Newsletter'}
        </button>
      </div>

      {error && (
        <div role="alert" className="fixed top-16 right-4 z-50 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-3 max-w-xs shadow-lg">
          {error}
          <button onClick={() => setError(null)} className="block mt-1 font-semibold underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
