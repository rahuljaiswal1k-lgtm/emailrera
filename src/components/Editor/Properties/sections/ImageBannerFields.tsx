import type { ImageBannerSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField, ColorField, SliderField, ToggleField } from '../../../shared/FormFields';
import { ImagePicker } from '../../../shared/ImagePicker';

export function ImageBannerFields({ section }: { section: ImageBannerSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<ImageBannerSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Image">
        <ImagePicker value={section.imageId} onChange={(imageId) => set({ imageId })} />
      </FieldGroup>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Subheading">
        <TextAreaField value={section.subheading} onChange={(subheading) => set({ subheading })} rows={2} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup
        label="Text Position"
        hint="Email clients can't reliably layer text over an image, so the caption sits in a solid strip"
      >
        <SelectField
          value={section.textPosition}
          onChange={(textPosition) => set({ textPosition })}
          options={[
            { value: 'bottom', label: 'Below the image' },
            { value: 'top', label: 'Above the image' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="Caption Strip">
        <ToggleField checked={section.overlay} onChange={(overlay) => set({ overlay })} label="Show coloured strip behind the text" />
      </FieldGroup>
      {section.overlay && (
        <FieldGroup label="Strip Colour">
          <ColorField value={section.overlayColor} onChange={(overlayColor) => set({ overlayColor })} />
        </FieldGroup>
      )}
      <FieldGroup label="Text Colour">
        <ColorField value={section.textColor} onChange={(textColor) => set({ textColor })} />
      </FieldGroup>
      <FieldGroup label="Corner Radius">
        <SliderField value={section.borderRadius} onChange={(borderRadius) => set({ borderRadius })} min={0} max={30} unit="px" />
      </FieldGroup>
    </>
  );
}
