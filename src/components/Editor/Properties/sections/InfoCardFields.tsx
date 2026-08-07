import type { InfoCardSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, ColorField } from '../../../shared/FormFields';

export function InfoCardFields({ section }: { section: InfoCardSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<InfoCardSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Text">
        <TextAreaField value={section.text} onChange={(text) => set({ text })} rows={4} />
      </FieldGroup>
      <FieldGroup label="Border Color">
        <ColorField value={section.borderColor} onChange={(borderColor) => set({ borderColor })} />
      </FieldGroup>
      <FieldGroup label="Background Color">
        <ColorField value={section.backgroundColor} onChange={(backgroundColor) => set({ backgroundColor })} />
      </FieldGroup>
    </>
  );
}
