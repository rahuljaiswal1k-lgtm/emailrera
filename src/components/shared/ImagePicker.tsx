import { useRef, useState } from 'react';
import { useNewsletterStore } from '../../store/useNewsletterStore';

export function ImagePicker({
  value,
  onChange,
  compact = false,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  compact?: boolean;
}) {
  const images = useNewsletterStore((s) => s.images);
  const uploadImage = useNewsletterStore((s) => s.uploadImage);
  const fileInput = useRef<HTMLInputElement>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const current = value ? images[value] : null;
  const library = Object.values(images);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const id = await uploadImage(file);
      onChange(id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not read that image file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className={`flex items-center gap-3 ${compact ? '' : 'mb-2'}`}>
        <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {current ? (
            <img src={current.dataUrl} alt={current.originalName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-gray-400 text-center px-1">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              // Reset the input so picking the same file again still fires onChange.
              const file = e.target.files?.[0];
              e.target.value = '';
              handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[#1D1F1F] text-white hover:bg-black disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload Image'}
          </button>
          <div className="flex gap-2">
            {library.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLibrary((v) => !v)}
                className="text-[11px] text-gray-500 hover:text-gray-800 underline"
              >
                Choose existing
              </button>
            )}
            {current && (
              <button type="button" onClick={() => onChange(null)} className="text-[11px] text-red-400 hover:text-red-600 underline">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="text-[11px] text-red-600 mt-1">
          {uploadError}
        </p>
      )}

      {showLibrary && (
        <div className="mt-2 grid grid-cols-5 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto thin-scroll">
          {library.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                onChange(img.id);
                setShowLibrary(false);
              }}
              className={`aspect-square rounded-md overflow-hidden border-2 ${
                value === img.id ? 'border-[#1D1F1F]' : 'border-transparent'
              }`}
              title={img.originalName}
            >
              <img src={img.dataUrl} alt={img.originalName} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
