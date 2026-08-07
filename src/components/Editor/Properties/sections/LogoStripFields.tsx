import type { LogoStripSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, SliderField } from '../../../shared/FormFields';
import { ImageListPicker } from '../../../shared/ImageListPicker';

export function LogoStripFields({ section }: { section: LogoStripSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<LogoStripSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Logos Per Row">
        <SliderField value={section.perRow} onChange={(perRow) => set({ perRow })} min={2} max={5} />
      </FieldGroup>
      <FieldGroup label={`Logos (${section.imageIds.length})`}>
        <ImageListPicker imageIds={section.imageIds} onChange={(imageIds) => set({ imageIds })} />
      </FieldGroup>
    </>
  );
}
