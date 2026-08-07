import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNewsletterStore } from '../../store/useNewsletterStore';
import { ImagePicker } from './ImagePicker';

/**
 * Ordered list of images, used by the Gallery and Logo Strip blocks.
 * Wraps the existing single ImagePicker rather than duplicating its
 * upload / library / error handling.
 */
export function ImageListPicker({
  imageIds,
  onChange,
}: {
  imageIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const images = useNewsletterStore((s) => s.images);

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= imageIds.length) return;
    const next = [...imageIds];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div>
      {imageIds.length > 0 && (
        <div className="space-y-2 mb-3">
          {imageIds.map((id, i) => {
            const img = images[id];
            return (
              <div key={`${id}-${i}`} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2">
                <div className="w-11 h-11 rounded-md border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
                  {img ? (
                    <img src={img.dataUrl} alt={img.originalName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-gray-400 flex items-center justify-center h-full">missing</span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 truncate flex-1 min-w-0">
                  {img?.originalName ?? 'Image not found'}
                </span>
                <button
                  onClick={() => move(i, -1)}
                  className="w-7 h-7 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center shrink-0"
                  title="Move earlier"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  className="w-7 h-7 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center shrink-0"
                  title="Move later"
                >
                  <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => onChange(imageIds.filter((_, idx) => idx !== i))}
                  className="w-7 h-7 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0"
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-1 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 mb-1.5">Add an image:</p>
        <ImagePicker
          value={null}
          onChange={(id) => {
            if (id) onChange([...imageIds, id]);
          }}
          compact
        />
      </div>
    </div>
  );
}
