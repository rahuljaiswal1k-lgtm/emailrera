import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { nanoid } from '../../../../lib/id';
import type { StatsSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, ToggleField } from '../../../shared/FormFields';

export function StatsFields({ section }: { section: StatsSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<StatsSection>) => update(section.id, partial);

  const shownCount = section.metrics.filter((m) => m.show).length;

  const updateMetric = (id: string, partial: Partial<StatsSection['metrics'][number]>) => {
    set({ metrics: section.metrics.map((m) => (m.id === id ? { ...m, ...partial } : m)) });
  };
  const removeMetric = (id: string) => set({ metrics: section.metrics.filter((m) => m.id !== id) });
  const addMetric = () => set({ metrics: [...section.metrics, { id: nanoid(), number: '0', label: 'New Metric', show: shownCount < 4 }] });
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...section.metrics];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    set({ metrics: next });
  };

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>

      <FieldGroup
        label={`Metrics (${shownCount}/4 shown)`}
        hint={shownCount > 4 ? 'Only the first 4 metrics marked "Show" will appear — toggle some off.' : 'Only 4 metrics are displayed at once. Toggle which ones show.'}
      >
        <div className="space-y-2">
          {section.metrics.map((m, i) => (
            <div key={m.id} className="border border-gray-200 rounded-lg p-2.5 bg-white">
              <div className="flex gap-2 mb-2">
                <input
                  value={m.number}
                  onChange={(e) => updateMetric(m.id, { number: e.target.value })}
                  placeholder="7,000+"
                  className="w-24 rounded-md border border-gray-200 px-2 py-1.5 text-sm font-mono"
                />
                <input
                  value={m.label}
                  onChange={(e) => updateMetric(m.id, { label: e.target.value })}
                  placeholder="Label"
                  className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <ToggleField checked={m.show} onChange={(show) => updateMetric(m.id, { show })} label="Show" />
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} className="w-6 h-6 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center">
                    <ArrowUp size={12} />
                  </button>
                  <button onClick={() => move(i, 1)} className="w-6 h-6 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center">
                    <ArrowDown size={12} />
                  </button>
                  <button onClick={() => removeMetric(m.id)} className="w-6 h-6 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addMetric} className="text-xs font-semibold text-[#1D1F1F] hover:underline mt-2">
          + Add Metric
        </button>
      </FieldGroup>
    </>
  );
}
