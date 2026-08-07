import { Plus, Trash2 } from 'lucide-react';
import type { Section } from '../../../../types/newsletter';
import type { ButtonGroup, ButtonConfig, ButtonVariant, ButtonSize, ButtonShape, ButtonAlign, ButtonLayout } from '../../../../lib/blockButtons';
import { DEFAULT_BUTTON_GROUP, createButton } from '../../../../lib/blockButtons';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, SelectField, ToggleField } from '../../../shared/FormFields';

const VARIANTS: { value: ButtonVariant; label: string }[] = [
  { value: 'primary', label: 'Primary (yellow)' },
  { value: 'dark', label: 'Dark' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
  { value: 'yellow', label: 'Yellow bordered' },
  { value: 'ghost', label: 'Ghost (text only)' },
];

const SIZES: { value: ButtonSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const SHAPES: { value: ButtonShape; label: string }[] = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
  { value: 'square', label: 'Square' },
];

const ALIGNS: { value: ButtonAlign; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const LAYOUTS: { value: ButtonLayout; label: string }[] = [
  { value: 'inline', label: 'Inline (side by side)' },
  { value: 'stacked', label: 'Stacked' },
];

/**
 * The Buttons tab. Every block gets this — buttons are no longer exclusive to
 * the CTA section.
 */
export function ButtonFields({ section }: { section: Section }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const group: ButtonGroup = section.buttons ?? DEFAULT_BUTTON_GROUP;

  const set = (partial: Partial<ButtonGroup>) =>
    update(section.id, { buttons: { ...group, ...partial } } as Partial<Section>);

  const setButton = (id: string, partial: Partial<ButtonConfig>) =>
    set({ buttons: group.buttons.map((b) => (b.id === id ? { ...b, ...partial } : b)) });

  const addButton = () => set({ enabled: true, buttons: [...group.buttons, createButton()] });
  const removeButton = (id: string) => set({ buttons: group.buttons.filter((b) => b.id !== id) });

  return (
    <>
      <FieldGroup label="Buttons">
        <ToggleField
          checked={group.enabled}
          onChange={(enabled) => set({ enabled, buttons: enabled && group.buttons.length === 0 ? [createButton()] : group.buttons })}
          label="Show buttons in this section"
        />
      </FieldGroup>

      {group.enabled && (
        <>
          <FieldGroup label="Group Alignment">
            <SelectField value={group.align} onChange={(align) => set({ align })} options={ALIGNS} />
          </FieldGroup>
          <FieldGroup label="Group Layout">
            <SelectField value={group.layout} onChange={(layout) => set({ layout })} options={LAYOUTS} />
          </FieldGroup>

          <div className="space-y-3">
            {group.buttons.map((b, i) => (
              <div key={b.id} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Button {i + 1}</span>
                  <button
                    onClick={() => removeButton(b.id)}
                    className="w-7 h-7 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                    title="Remove button"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <FieldGroup label="Text">
                  <TextField value={b.text} onChange={(text) => setButton(b.id, { text })} />
                </FieldGroup>
                <FieldGroup label="URL">
                  <TextField value={b.url} onChange={(url) => setButton(b.id, { url })} placeholder="https://" />
                </FieldGroup>
                <FieldGroup label="Variant">
                  <SelectField value={b.variant} onChange={(variant) => setButton(b.id, { variant })} options={VARIANTS} />
                </FieldGroup>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="Size">
                    <SelectField value={b.size} onChange={(size) => setButton(b.id, { size })} options={SIZES} />
                  </FieldGroup>
                  <FieldGroup label="Shape">
                    <SelectField value={b.shape} onChange={(shape) => setButton(b.id, { shape })} options={SHAPES} />
                  </FieldGroup>
                </div>
                <ToggleField
                  checked={b.fullWidth}
                  onChange={(fullWidth) => setButton(b.id, { fullWidth })}
                  label="Full width"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addButton}
            className="text-xs font-semibold text-[#1D1F1F] hover:underline mt-3 flex items-center gap-1"
          >
            <Plus size={12} /> Add Button
          </button>
        </>
      )}
    </>
  );
}
