import type { QuoteSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, ColorField } from '../../../shared/FormFields';

export function QuoteFields({ section }: { section: QuoteSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<QuoteSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Eyebrow Label" hint='Small label above the heading, e.g. "RERA EASY INSIGHT"'>
        <TextField value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} />
      </FieldGroup>
      <FieldGroup label="Heading" hint="Optional">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Description">
        <TextAreaField value={section.description} onChange={(description) => set({ description })} rows={4} />
      </FieldGroup>
      <FieldGroup label="Background Color">
        <ColorField value={section.backgroundColor} onChange={(backgroundColor) => set({ backgroundColor })} />
      </FieldGroup>
      <FieldGroup label="Text Color">
        <ColorField value={section.textColor} onChange={(textColor) => set({ textColor })} />
      </FieldGroup>
    </>
  );
}
