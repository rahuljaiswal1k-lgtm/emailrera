import type { BoxGroupSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField } from '../../../shared/FormFields';
import { IconPicker } from '../../../shared/IconPicker';

export function BoxGroupFields({ section }: { section: BoxGroupSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<BoxGroupSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading" hint="Leave blank to show only the boxes">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Icon">
        <IconPicker value={section.icon} onChange={(icon) => set({ icon })} />
      </FieldGroup>
      <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed">
        The information, warning, highlight and callout cards for this section live in the{' '}
        <b>Boxes</b> tab above.
      </p>
    </>
  );
}
