import type { ReactNode } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Add / remove / reorder wrapper for any array of `{ id }` items.
 *
 * Every new block that holds a repeating list (list items, columns, FAQ pairs)
 * uses this rather than reimplementing the same four handlers, which is what
 * the original StatsFields and ListEditorField each did separately.
 */
export function RepeatableList<T extends { id: string }>({
  items,
  onChange,
  create,
  itemLabel,
  renderItem,
  max,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  itemLabel: string;
  renderItem: (item: T, update: (partial: Partial<T>) => void, index: number) => ReactNode;
  max?: number;
}) {
  const setItem = (id: string, partial: Partial<T>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...partial } : i)));

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const atMax = max !== undefined && items.length >= max;

  return (
    <>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={item.id} className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                {itemLabel} {i + 1}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => move(i, -1)}
                  className="w-6 h-6 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center"
                  title="Move up"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  className="w-6 h-6 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center"
                  title="Move down"
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  onClick={() => onChange(items.filter((x) => x.id !== item.id))}
                  className="w-6 h-6 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                  title={`Remove ${itemLabel.toLowerCase()}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            {renderItem(item, (partial) => setItem(item.id, partial), i)}
          </div>
        ))}
      </div>

      {!atMax && (
        <button
          onClick={() => onChange([...items, create()])}
          className="text-xs font-semibold text-[#1D1F1F] hover:underline mt-3 flex items-center gap-1"
        >
          <Plus size={12} /> Add {itemLabel}
        </button>
      )}
    </>
  );
}
