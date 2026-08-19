import type { Section } from '../../../../types/newsletter';
import type { BlockStyle, BlockTheme, BlockVariant, ShadowSize, BlockAlign, DividerPosition } from '../../../../lib/blockStyle';
import { styleForType } from '../../../../lib/blockStyle';
import { DESIGN_PRESETS } from '../../../../lib/designTokens';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, SelectField, ColorField, SliderField, ToggleField } from '../../../shared/FormFields';
import { PanelGroup } from './PanelGroup';

const THEMES: { value: BlockTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'gray', label: 'Light Gray' },
  { value: 'dark', label: 'Dark' },
  { value: 'yellow', label: 'Brand Yellow' },
];

const VARIANTS: { value: BlockVariant; label: string }[] = [
  { value: 'plain', label: 'Plain (no chrome)' },
  { value: 'card', label: 'Card' },
  { value: 'outline', label: 'Outline' },
  { value: 'filled', label: 'Filled' },
  { value: 'elevated', label: 'Elevated (shadow)' },
  { value: 'minimal', label: 'Minimal' },
];

const SHADOWS: { value: ShadowSize; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const ALIGNS: { value: BlockAlign; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const DIVIDERS: { value: DividerPosition; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'top', label: 'Above section' },
  { value: 'bottom', label: 'Below section' },
  { value: 'both', label: 'Above and below' },
];

// Email-safe font stack list mirrored from the floating format toolbar in
// canvasEditor.ts. First value uses '' to mean "inherit / default".
const FONTS: { value: string; label: string }[] = [
  { value: '', label: 'Default (Arial)' },
  { value: 'Arial,Helvetica,sans-serif', label: 'Arial' },
  { value: 'Georgia,serif', label: 'Georgia' },
  { value: "'Times New Roman',Times,serif", label: 'Times New Roman' },
  { value: 'Verdana,Geneva,sans-serif', label: 'Verdana' },
  { value: 'Tahoma,Geneva,sans-serif', label: 'Tahoma' },
  { value: "'Trebuchet MS',sans-serif", label: 'Trebuchet MS' },
  { value: "'Courier New',monospace", label: 'Courier New' },
];

const FONT_SCALES: { value: string; label: string }[] = [
  { value: '1', label: 'Normal (100%)' },
  { value: '0.85', label: 'Small (85%)' },
  { value: '1.2', label: 'Large (120%)' },
  { value: '1.5', label: 'Extra large (150%)' },
];

/**
 * The Design tab. Edits the shared BlockStyle, so it works for every block type
 * without any per-type code. Controls are grouped into collapsible sections
 * because the full set is now well past one screen.
 */
export function StyleFields({ section }: { section: Section }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const current = useNewsletterStore((s) => s.current);
  const setSections = useNewsletterStore((s) => s.setSections);

  // styleForType (not resolveStyle) so the panel shows the same per-type
  // defaults the renderer uses for sections that carry no style of their own.
  const style = styleForType(section.type, section.style);
  const set = (partial: Partial<BlockStyle>) =>
    update(section.id, { style: { ...style, ...partial } } as Partial<Section>);

  /** Apply a preset to this block, or to every block at once. */
  const applyPreset = (key: string, toAll: boolean) => {
    const preset = DESIGN_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    if (!toAll) {
      set(preset.style);
      return;
    }
    if (!current) return;
    setSections(
      current.sections.map((sec) => {
        // Full-bleed banners keep their own geometry; a preset would boxe them in.
        const secStyle = styleForType(sec.type, sec.style);
        if (secStyle.fullBleed) return sec;
        return { ...sec, style: { ...secStyle, ...preset.style } } as Section;
      })
    );
  };

  return (
    <>
      <PanelGroup title="Presets" defaultOpen>
        <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
          Sets spacing, radius, shadow, card treatment and theme in one click. Everything stays
          editable afterwards.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {DESIGN_PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key, false)}
              title={p.description}
              className="text-left px-2.5 py-2 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="text-[12px] font-semibold text-gray-800">{p.label}</div>
              <div className="text-[10px] text-gray-400 line-clamp-2 leading-snug">{p.description}</div>
            </button>
          ))}
        </div>
        <details className="mt-2">
          <summary className="text-[11px] font-semibold text-gray-500 cursor-pointer select-none">
            Apply a preset to every section
          </summary>
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {DESIGN_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key, true)}
                className="text-[11px] font-semibold px-2 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Full-width banners keep their own geometry and are skipped.
          </p>
        </details>
      </PanelGroup>

      <PanelGroup title="Layout" defaultOpen>
        <FieldGroup
          label="Full Width"
          hint="Runs the block edge to edge across the whole email, ignoring the page's side padding"
        >
          <ToggleField
            checked={style.fullBleed}
            onChange={(fullBleed) => set({ fullBleed, borderRadius: fullBleed ? 0 : style.borderRadius })}
            label="Edge to edge (no side padding)"
          />
        </FieldGroup>
        <FieldGroup label="Content Alignment">
          <SelectField value={style.align} onChange={(align) => set({ align })} options={ALIGNS} />
        </FieldGroup>
        <FieldGroup label="Section Width" hint="Narrower than 100% centres the block in the column">
          <SliderField value={style.maxWidth} onChange={(maxWidth) => set({ maxWidth })} min={40} max={100} unit="%" />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Colours">
        <FieldGroup label="Theme" hint="Recolours the background, headings, body, borders, icons, badges, boxes and buttons together">
          <SelectField value={style.theme} onChange={(theme) => set({ theme })} options={THEMES} />
        </FieldGroup>
        <FieldGroup label="Card Style">
          <SelectField value={style.variant} onChange={(variant) => set({ variant })} options={VARIANTS} />
        </FieldGroup>
        <div className="rounded-xl border border-gray-200 p-3">
          <p className="text-[11px] font-semibold text-gray-500 mb-2.5">
            Overrides — leave blank to inherit from the theme
          </p>
          <FieldGroup label="Background">
            <ColorField value={style.backgroundColor} onChange={(backgroundColor) => set({ backgroundColor })} allowEmpty />
          </FieldGroup>
          <FieldGroup label="Text">
            <ColorField value={style.textColor} onChange={(textColor) => set({ textColor })} allowEmpty />
          </FieldGroup>
          <FieldGroup label="Border">
            <ColorField value={style.borderColor} onChange={(borderColor) => set({ borderColor })} allowEmpty />
          </FieldGroup>
        </div>
      </PanelGroup>

      <PanelGroup title="Typography">
        <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
          These cascade to every text in the section. To restyle just one text (heading,
          subtitle, body…) without changing the rest, click that text on the canvas and use the
          floating toolbar — its overrides show up in <b>Per-field styles</b> below.
        </p>
        <FieldGroup label="Font family">
          <SelectField
            value={style.fontFamily ?? ''}
            onChange={(fontFamily) => set({ fontFamily })}
            options={FONTS}
          />
        </FieldGroup>
        <FieldGroup label="Font size">
          <SelectField
            value={String(style.fontScale ?? 1)}
            onChange={(v) => set({ fontScale: Number(v) })}
            options={FONT_SCALES}
          />
        </FieldGroup>
      </PanelGroup>

      <PerFieldStyles section={section} />

      <PanelGroup title="Spacing">
        <FieldGroup label="Inner Padding">
          <SliderField value={style.padding} onChange={(padding) => set({ padding })} min={0} max={56} unit="px" />
        </FieldGroup>
        <FieldGroup label="Space Above">
          <SliderField value={style.spacingTop} onChange={(spacingTop) => set({ spacingTop })} min={0} max={80} unit="px" />
        </FieldGroup>
        <FieldGroup label="Space Below">
          <SliderField value={style.spacingBottom} onChange={(spacingBottom) => set({ spacingBottom })} min={0} max={80} unit="px" />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Borders">
        <FieldGroup label="Border Width">
          <SliderField value={style.borderWidth} onChange={(borderWidth) => set({ borderWidth })} min={0} max={6} unit="px" />
        </FieldGroup>
        <FieldGroup label="Corner Radius">
          <SliderField value={style.borderRadius} onChange={(borderRadius) => set({ borderRadius })} min={0} max={36} unit="px" />
        </FieldGroup>
        <FieldGroup label="Separator Line">
          <SelectField value={style.divider} onChange={(divider) => set({ divider })} options={DIVIDERS} />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Effects">
        <FieldGroup label="Shadow">
          <SelectField value={style.shadow} onChange={(shadow) => set({ shadow })} options={SHADOWS} />
        </FieldGroup>
      </PanelGroup>
    </>
  );
}

/**
 * Per-field style overrides — what the floating format toolbar writes for a
 * single element (title, subtitle, items.2 …). Lists every override the
 * section has, lets you tweak font/colour/size from the sidebar, and clears
 * a field's override so it falls back to the section-wide defaults above.
 */
function PerFieldStyles({ section }: { section: Section }) {
  const updateFieldStyle = useNewsletterStore((s) => s.updateFieldStyle);
  const update = useNewsletterStore((s) => s.updateSection);
  const entries = Object.entries(section.fieldStyles ?? {});

  if (entries.length === 0) {
    return (
      <PanelGroup title="Per-field styles">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Nothing overridden. Click any text in the preview and pick a font / colour / size in
          the floating toolbar — the override will show up here so you can tweak or clear it
          later without re-selecting the text.
        </p>
      </PanelGroup>
    );
  }

  const clearAll = () => update(section.id, { fieldStyles: {} } as Partial<Section>);

  return (
    <PanelGroup title={`Per-field styles (${entries.length})`}>
      <div className="flex justify-end mb-2">
        <button
          onClick={clearAll}
          className="text-[10.5px] font-semibold text-gray-500 hover:text-gray-800 px-2 py-0.5 rounded"
        >
          Clear all
        </button>
      </div>
      <div className="space-y-3">
        {entries.map(([path, spec]) => (
          <div key={path} className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-baseline justify-between mb-2">
              <code className="text-[11px] font-mono text-gray-700 truncate">{path}</code>
              <button
                onClick={() => updateFieldStyle(section.id, path, { fontFamily: undefined, textColor: undefined, fontScale: undefined, align: undefined })}
                className="text-[10px] font-semibold text-gray-400 hover:text-gray-700"
              >
                Reset
              </button>
            </div>
            <FieldGroup label="Font">
              <SelectField
                value={spec.fontFamily ?? ''}
                onChange={(fontFamily) => updateFieldStyle(section.id, path, { fontFamily })}
                options={FONTS}
              />
            </FieldGroup>
            <FieldGroup label="Size">
              <SelectField
                value={String(spec.fontScale ?? 1)}
                onChange={(v) => updateFieldStyle(section.id, path, { fontScale: Number(v) })}
                options={FONT_SCALES}
              />
            </FieldGroup>
            <FieldGroup label="Colour">
              <ColorField
                value={spec.textColor ?? ''}
                onChange={(textColor) => updateFieldStyle(section.id, path, { textColor })}
                allowEmpty
              />
            </FieldGroup>
            <FieldGroup label="Alignment">
              <SelectField
                value={spec.align ?? ''}
                onChange={(v) => updateFieldStyle(section.id, path, { align: (v || undefined) as 'left' | 'center' | 'right' | undefined })}
                options={[{ value: '', label: 'Default (inherit)' }, ...ALIGNS]}
              />
            </FieldGroup>
          </div>
        ))}
      </div>
    </PanelGroup>
  );
}
