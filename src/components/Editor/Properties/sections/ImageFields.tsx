import type { ImageSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField, SliderField } from '../../../shared/FormFields';
import { ImagePicker } from '../../../shared/ImagePicker';

const LAYOUTS: { value: ImageSection['layout']; label: string }[] = [
  { value: 'full', label: 'Full Width' },
  { value: 'leftImageRightText', label: 'Left Image + Right Text' },
  { value: 'rightImageLeftText', label: 'Right Image + Left Text' },
  { value: 'twoImages', label: 'Two Images' },
  { value: 'grid', label: 'Image Grid' },
  { value: 'none', label: 'No Image' },
];

export function ImageFields({ section }: { section: ImageSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<ImageSection>) => update(section.id, partial);

  const addGridImage = (id: string | null) => {
    if (!id) return;
    set({ gridImageIds: [...section.gridImageIds, id] });
  };
  const removeGridImage = (idx: number) => {
    set({ gridImageIds: section.gridImageIds.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <FieldGroup label="Image Layout">
        <SelectField value={section.layout} onChange={(layout) => set({ layout })} options={LAYOUTS} />
      </FieldGroup>

      {section.layout === 'full' && (
        <FieldGroup label="Image">
          <ImagePicker value={section.imageId} onChange={(imageId) => set({ imageId })} />
        </FieldGroup>
      )}

      {(section.layout === 'leftImageRightText' || section.layout === 'rightImageLeftText') && (
        <>
          <FieldGroup label="Image">
            <ImagePicker value={section.imageId} onChange={(imageId) => set({ imageId })} />
          </FieldGroup>
          <FieldGroup label="Accompanying Text">
            <TextAreaField value={section.text} onChange={(text) => set({ text })} rows={4} />
          </FieldGroup>
        </>
      )}

      {section.layout === 'twoImages' && (
        <>
          <FieldGroup label="Image 1">
            <ImagePicker value={section.imageId} onChange={(imageId) => set({ imageId })} />
          </FieldGroup>
          <FieldGroup label="Image 2">
            <ImagePicker value={section.imageId2} onChange={(imageId2) => set({ imageId2 })} />
          </FieldGroup>
        </>
      )}

      {section.layout === 'grid' && (
        <FieldGroup label={`Grid Images (${section.gridImageIds.length})`}>
          <div className="space-y-2 mb-2">
            {section.gridImageIds.map((id, i) => (
              <div key={i} className="flex items-center gap-2">
                <ImagePicker
                  value={id}
                  onChange={(newId) => {
                    const next = [...section.gridImageIds];
                    if (newId) next[i] = newId;
                    set({ gridImageIds: next });
                  }}
                  compact
                />
                <button onClick={() => removeGridImage(i)} className="text-xs text-red-400 hover:text-red-600">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="pt-1 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 mb-1.5">Add another image to the grid:</p>
            <ImagePicker value={null} onChange={addGridImage} compact />
          </div>
        </FieldGroup>
      )}

      {section.layout !== 'none' && (
        <>
          <FieldGroup label="Caption" hint="Optional caption shown under the image(s)">
            <TextField value={section.caption} onChange={(caption) => set({ caption })} />
          </FieldGroup>
          <FieldGroup label="Alt Text" hint="Describes the image for accessibility and email clients that block images">
            <TextField value={section.altText} onChange={(altText) => set({ altText })} />
          </FieldGroup>
          <FieldGroup label="Border Radius">
            <SliderField value={section.borderRadius} onChange={(borderRadius) => set({ borderRadius })} min={0} max={32} unit="px" />
          </FieldGroup>
          {section.layout === 'full' && (
            <FieldGroup label="Image Width">
              <SliderField value={section.widthPercent} onChange={(widthPercent) => set({ widthPercent })} min={20} max={100} unit="%" />
            </FieldGroup>
          )}
        </>
      )}
    </>
  );
}
