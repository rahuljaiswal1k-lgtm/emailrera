import type { DividerSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, SelectField, ColorField, SliderField } from '../../../shared/FormFields';

export function DividerFields({ section }: { section: DividerSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<DividerSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Style">
        <SelectField
          value={section.dividerStyle}
          onChange={(dividerStyle) => set({ dividerStyle })}
          options={[
            { value: 'line', label: 'Line' },
            { value: 'dots', label: 'Dots' },
            { value: 'label', label: 'Line with label' },
            { value: 'space', label: 'Empty space' },
          ]}
        />
      </FieldGroup>

      {section.dividerStyle === 'label' && (
        <FieldGroup label="Label">
          <TextField value={section.label} onChange={(label) => set({ label })} placeholder="e.g. IN THIS ISSUE" />
        </FieldGroup>
      )}

      {section.dividerStyle === 'space' ? (
        <FieldGroup label="Height">
          <SliderField value={section.height} onChange={(height) => set({ height })} min={4} max={100} unit="px" />
        </FieldGroup>
      ) : (
        <>
          <FieldGroup label="Colour">
            <ColorField value={section.color} onChange={(color) => set({ color })} />
          </FieldGroup>
          {section.dividerStyle !== 'dots' && (
            <FieldGroup label="Thickness">
              <SliderField value={section.thickness} onChange={(thickness) => set({ thickness })} min={1} max={6} unit="px" />
            </FieldGroup>
          )}
        </>
      )}
    </>
  );
}
