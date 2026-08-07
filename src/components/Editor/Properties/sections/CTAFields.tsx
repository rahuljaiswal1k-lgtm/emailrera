import type { CTASection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, ColorField } from '../../../shared/FormFields';

const PRESETS = ['Contact Us', 'Book Consultation', 'Speak With Experts', 'Download Checklist', 'Read Full Article'];

export function CTAFields({ section }: { section: CTASection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<CTASection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Description">
        <TextAreaField value={section.description} onChange={(description) => set({ description })} rows={3} />
      </FieldGroup>
      <FieldGroup label="Button Text">
        <TextField value={section.buttonText} onChange={(buttonText) => set({ buttonText })} />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => set({ buttonText: p })}
              className="text-[11px] px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              {p}
            </button>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Button URL">
        <TextField value={section.buttonUrl} onChange={(buttonUrl) => set({ buttonUrl })} placeholder="https://" />
      </FieldGroup>
      <FieldGroup label="Button Color">
        <ColorField value={section.buttonColor} onChange={(buttonColor) => set({ buttonColor })} />
      </FieldGroup>
    </>
  );
}
