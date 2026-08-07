import type { CtaBannerSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField } from '../../../shared/FormFields';
import { ImagePicker } from '../../../shared/ImagePicker';

export function CtaBannerFields({ section }: { section: CtaBannerSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<CtaBannerSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Layout">
        <SelectField
          value={section.layout}
          onChange={(layout) => set({ layout })}
          options={[
            { value: 'centered', label: 'Centred' },
            { value: 'split', label: 'Text + image side by side' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="Eyebrow">
        <TextField value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Description">
        <TextAreaField value={section.description} onChange={(description) => set({ description })} rows={3} />
      </FieldGroup>
      {section.layout === 'split' && (
        <FieldGroup label="Image">
          <ImagePicker value={section.imageId} onChange={(imageId) => set({ imageId })} />
        </FieldGroup>
      )}
      <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed">
        The buttons for this banner are configured in the <b>Buttons</b> tab above.
      </p>
    </>
  );
}
