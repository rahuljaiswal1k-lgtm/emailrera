import type { TestimonialSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField } from '../../../shared/FormFields';
import { ImagePicker } from '../../../shared/ImagePicker';

export function TestimonialFields({ section }: { section: TestimonialSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<TestimonialSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Layout">
        <SelectField
          value={section.layout}
          onChange={(layout) => set({ layout })}
          options={[
            { value: 'centered', label: 'Centred' },
            { value: 'side', label: 'Photo beside quote' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="Quote">
        <TextAreaField value={section.quote} onChange={(quote) => set({ quote })} rows={4} />
      </FieldGroup>
      <FieldGroup label="Author Name">
        <TextField value={section.authorName} onChange={(authorName) => set({ authorName })} />
      </FieldGroup>
      <FieldGroup label="Author Role">
        <TextField value={section.authorRole} onChange={(authorRole) => set({ authorRole })} placeholder="Designation, Company" />
      </FieldGroup>
      <FieldGroup label="Photo" hint="Optional — shown as a circular avatar">
        <ImagePicker value={section.imageId} onChange={(imageId) => set({ imageId })} />
      </FieldGroup>
    </>
  );
}
