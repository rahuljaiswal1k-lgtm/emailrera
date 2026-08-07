import type { HeroSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, ColorField, SelectField, ToggleField } from '../../../shared/FormFields';

export function HeroFields({ section }: { section: HeroSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<HeroSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Headline" hint="The big title inside the email. The name at the top of this screen is only how the draft is listed on your dashboard.">
        <TextField value={section.title} onChange={(title) => set({ title })} placeholder="Your headline" />
      </FieldGroup>

      <FieldGroup label="Show Subtitle">
        <ToggleField checked={section.showSubtitle} onChange={(showSubtitle) => set({ showSubtitle })} label="Display a subtitle under the headline" />
      </FieldGroup>

      {section.showSubtitle && (
        <FieldGroup label="Subtitle">
          <TextAreaField value={section.subtitle} onChange={(subtitle) => set({ subtitle })} rows={2} placeholder="Optional supporting line" />
        </FieldGroup>
      )}

      <FieldGroup label="Background Color">
        <ColorField value={section.backgroundColor} onChange={(backgroundColor) => set({ backgroundColor })} />
      </FieldGroup>

      <FieldGroup label="Text Alignment">
        <SelectField
          value={section.textAlign}
          onChange={(textAlign) => set({ textAlign })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </FieldGroup>
    </>
  );
}
