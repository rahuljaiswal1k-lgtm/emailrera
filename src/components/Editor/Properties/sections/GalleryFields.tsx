import type { GallerySection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, SelectField, SliderField } from '../../../shared/FormFields';
import { ImageListPicker } from '../../../shared/ImageListPicker';

export function GalleryFields({ section }: { section: GallerySection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<GallerySection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Columns">
        <SelectField
          value={String(section.columns)}
          onChange={(v) => set({ columns: Number(v) as 2 | 3 })}
          options={[
            { value: '2', label: 'Two' },
            { value: '3', label: 'Three' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label={`Images (${section.imageIds.length})`}>
        <ImageListPicker imageIds={section.imageIds} onChange={(imageIds) => set({ imageIds })} />
      </FieldGroup>
      <FieldGroup label="Gap Between Images">
        <SliderField value={section.gap} onChange={(gap) => set({ gap })} min={0} max={20} unit="px" />
      </FieldGroup>
      <FieldGroup label="Image Corner Radius">
        <SliderField value={section.borderRadius} onChange={(borderRadius) => set({ borderRadius })} min={0} max={28} unit="px" />
      </FieldGroup>
      <FieldGroup label="Caption">
        <TextField value={section.caption} onChange={(caption) => set({ caption })} placeholder="Optional" />
      </FieldGroup>
    </>
  );
}
