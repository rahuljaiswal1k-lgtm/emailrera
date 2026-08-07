import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { Section } from '../../../../types/newsletter';
import type { ContainerBox, BoxKind } from '../../../../lib/blockBoxes';
import { BOX_PRESETS, BOX_KINDS, createBox } from '../../../../lib/blockBoxes';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField, ColorField, SliderField, ListEditorField } from '../../../shared/FormFields';
import { IconPicker } from '../../../shared/IconPicker';

const KIND_OPTIONS: { value: BoxKind; label: string }[] = BOX_KINDS.map((k) => ({
  value: k,
  label: BOX_PRESETS[k].label,
}));

/**
 * The Boxes tab — styled sub-containers that can be added inside ANY block.
 * This is what lets one Content section carry a warning strip, a checklist
 * card and a quote card without three separate sections.
 */
export function BoxFields({ section }: { section: Section }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const boxes = section.boxes ?? [];

  const setBoxes = (next: ContainerBox[]) => update(section.id, { boxes: next } as Partial<Section>);
  const setBox = (id: string, partial: Partial<ContainerBox>) =>
    setBoxes(boxes.map((b) => (b.id === id ? { ...b, ...partial } : b)));
  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= boxes.length) return;
    const next = [...boxes];
    [next[idx], next[target]] = [next[target], next[idx]];
    setBoxes(next);
  };

  return (
    <>
      <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed mb-4">
        Boxes render <b>after</b> this section's own content and before its buttons. Add as many as you
        need — they are available on every block type.
      </p>

      <div className="space-y-3">
        {boxes.map((box, i) => {
          const preset = BOX_PRESETS[box.kind];
          const supportsItems = box.kind === 'checklist' || box.kind === 'feature';
          const isSpacer = box.kind === 'spacer';
          const isLine = box.kind === 'line';
          const isLayoutHelper = isSpacer || isLine;
          return (
            <div key={box.id} className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  {i + 1}. {preset.label}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Move up"
                    className="w-6 h-6 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-25 disabled:hover:bg-transparent flex items-center justify-center"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === boxes.length - 1}
                    title="Move down"
                    className="w-6 h-6 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-25 disabled:hover:bg-transparent flex items-center justify-center"
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={() => setBoxes(boxes.filter((b) => b.id !== box.id))}
                    title="Remove"
                    className="w-6 h-6 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <FieldGroup label="Box Type">
                <SelectField value={box.kind} onChange={(kind) => setBox(box.id, { kind })} options={KIND_OPTIONS} />
              </FieldGroup>

              {isSpacer ? (
                <FieldGroup label="Height">
                  <SliderField
                    value={box.padding || 18}
                    onChange={(padding) => setBox(box.id, { padding })}
                    min={4}
                    max={80}
                    unit="px"
                  />
                </FieldGroup>
              ) : isLine ? (
                <>
                  <FieldGroup label="Label" hint="Optional — splits the rule around centred text">
                    <TextField value={box.title} onChange={(title) => setBox(box.id, { title })} placeholder="Optional" />
                  </FieldGroup>
                  <FieldGroup label="Line Colour">
                    <ColorField value={box.borderColor} onChange={(borderColor) => setBox(box.id, { borderColor })} allowEmpty />
                  </FieldGroup>
                  <FieldGroup label="Space Around">
                    <SliderField value={box.padding || 14} onChange={(padding) => setBox(box.id, { padding })} min={0} max={48} unit="px" />
                  </FieldGroup>
                </>
              ) : (
                <>
                  <FieldGroup label={box.kind === 'quote' ? 'Attribution' : 'Title'}>
                    <TextField value={box.title} onChange={(title) => setBox(box.id, { title })} />
                  </FieldGroup>
                  <FieldGroup label="Text">
                    <TextAreaField value={box.text} onChange={(text) => setBox(box.id, { text })} rows={3} />
                  </FieldGroup>

                  {supportsItems && (
                    <FieldGroup label="Items">
                      <ListEditorField items={box.items} onChange={(items) => setBox(box.id, { items })} itemLabel="Item" multiline />
                    </FieldGroup>
                  )}

                  {box.kind !== 'quote' && (
                    <FieldGroup label="Icon" hint="Optional — click again to clear">
                      <IconPicker value={box.icon} onChange={(icon) => setBox(box.id, { icon: icon === box.icon ? '' : icon })} />
                    </FieldGroup>
                  )}
                </>
              )}

              {!isLayoutHelper && (
                <details className="mt-1">
                  <summary className="text-[11px] font-semibold text-gray-500 cursor-pointer select-none">
                    Appearance overrides
                  </summary>
                  <div className="pt-2">
                    <FieldGroup label="Background">
                      <ColorField value={box.backgroundColor} onChange={(backgroundColor) => setBox(box.id, { backgroundColor })} allowEmpty />
                    </FieldGroup>
                    <FieldGroup label="Border">
                      <ColorField value={box.borderColor} onChange={(borderColor) => setBox(box.id, { borderColor })} allowEmpty />
                    </FieldGroup>
                    <FieldGroup label="Text">
                      <ColorField value={box.textColor} onChange={(textColor) => setBox(box.id, { textColor })} allowEmpty />
                    </FieldGroup>
                    <FieldGroup label="Corner Radius" hint="0 uses the preset">
                      <SliderField value={box.borderRadius} onChange={(borderRadius) => setBox(box.id, { borderRadius })} min={0} max={30} unit="px" />
                    </FieldGroup>
                    <FieldGroup label="Padding" hint="0 uses the preset">
                      <SliderField value={box.padding} onChange={(padding) => setBox(box.id, { padding })} min={0} max={44} unit="px" />
                    </FieldGroup>
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {(['info', 'warning', 'highlight', 'callout', 'checklist', 'quote'] as BoxKind[]).map((k) => (
          <button
            key={k}
            onClick={() => setBoxes([...boxes, createBox(k)])}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
          >
            <Plus size={11} /> {BOX_PRESETS[k].label.replace(' Box', '').replace(' Card', '')}
          </button>
        ))}
        {(['spacer', 'line'] as BoxKind[]).map((k) => (
          <button
            key={k}
            onClick={() => setBoxes([...boxes, createBox(k)])}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
          >
            <Plus size={11} /> {k === 'spacer' ? 'Spacer' : 'Line'}
          </button>
        ))}
      </div>
    </>
  );
}
