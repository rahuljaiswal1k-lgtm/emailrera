import type { Section } from '../../../../types/newsletter';
import type { BlockStyle, BlockTheme, BlockVariant, ShadowSize, BlockAlign, DividerPosition } from '../../../../lib/blockStyle';
import { styleForType } from '../../../../lib/blockStyle';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, SelectField, ColorField, SliderField, ToggleField } from '../../../shared/FormFields';

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

/**
 * The Design tab. Edits the shared BlockStyle, so it works for every block
 * type without any per-type code.
 */
export function StyleFields({ section }: { section: Section }) {
  const update = useNewsletterStore((s) => s.updateSection);
  // styleForType (not resolveStyle) so the panel shows the same per-type
  // defaults the renderer uses for sections that carry no style of their own.
  const style = styleForType(section.type, section.style);
  const set = (partial: Partial<BlockStyle>) =>
    update(section.id, { style: { ...style, ...partial } } as Partial<Section>);

  return (
    <>
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

      <FieldGroup label="Theme" hint="Sets the base background, text and border colours">
        <SelectField value={style.theme} onChange={(theme) => set({ theme })} options={THEMES} />
      </FieldGroup>

      <FieldGroup label="Card Style">
        <SelectField value={style.variant} onChange={(variant) => set({ variant })} options={VARIANTS} />
      </FieldGroup>

      <div className="rounded-xl border border-gray-200 p-3 mb-4">
        <p className="text-[11px] font-semibold text-gray-500 mb-2.5">Colour overrides</p>
        <FieldGroup label="Background" hint="Leave blank to use the theme colour">
          <ColorField value={style.backgroundColor} onChange={(backgroundColor) => set({ backgroundColor })} allowEmpty />
        </FieldGroup>
        <FieldGroup label="Text">
          <ColorField value={style.textColor} onChange={(textColor) => set({ textColor })} allowEmpty />
        </FieldGroup>
        <FieldGroup label="Border">
          <ColorField value={style.borderColor} onChange={(borderColor) => set({ borderColor })} allowEmpty />
        </FieldGroup>
      </div>

      <FieldGroup label="Border Width">
        <SliderField value={style.borderWidth} onChange={(borderWidth) => set({ borderWidth })} min={0} max={6} unit="px" />
      </FieldGroup>

      <FieldGroup label="Corner Radius">
        <SliderField value={style.borderRadius} onChange={(borderRadius) => set({ borderRadius })} min={0} max={36} unit="px" />
      </FieldGroup>

      <FieldGroup label="Shadow">
        <SelectField value={style.shadow} onChange={(shadow) => set({ shadow })} options={SHADOWS} />
      </FieldGroup>

      <FieldGroup label="Inner Padding">
        <SliderField value={style.padding} onChange={(padding) => set({ padding })} min={0} max={56} unit="px" />
      </FieldGroup>

      <FieldGroup label="Space Above">
        <SliderField value={style.spacingTop} onChange={(spacingTop) => set({ spacingTop })} min={0} max={80} unit="px" />
      </FieldGroup>

      <FieldGroup label="Space Below">
        <SliderField value={style.spacingBottom} onChange={(spacingBottom) => set({ spacingBottom })} min={0} max={80} unit="px" />
      </FieldGroup>

      <FieldGroup label="Content Alignment">
        <SelectField value={style.align} onChange={(align) => set({ align })} options={ALIGNS} />
      </FieldGroup>

      <FieldGroup label="Section Width" hint="Narrower than 100% centres the block in the column">
        <SliderField value={style.maxWidth} onChange={(maxWidth) => set({ maxWidth })} min={40} max={100} unit="%" />
      </FieldGroup>

      <FieldGroup label="Separator Line">
        <SelectField value={style.divider} onChange={(divider) => set({ divider })} options={DIVIDERS} />
      </FieldGroup>
    </>
  );
}
