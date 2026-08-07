import type { AboutSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField } from '../../../shared/FormFields';

export function AboutFields({ section }: { section: AboutSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<AboutSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Description">
        <TextAreaField value={section.description} onChange={(description) => set({ description })} rows={6} />
      </FieldGroup>
      <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg p-3 leading-relaxed">
        The logo, phone numbers, and email shown in this box come from <b>Global Settings</b> so they stay
        consistent across every newsletter.
      </p>
    </>
  );
}
