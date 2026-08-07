import type { TextBlockSection } from '../../../../types/newsletter';
import type { HeadingSize } from '../../../../lib/blockStyle';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField, ToggleField } from '../../../shared/FormFields';

const SIZES: { value: HeadingSize; label: string }[] = [
  { value: 'xs', label: 'Extra Small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

export function TextBlockFields({ section }: { section: TextBlockSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<TextBlockSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Badge" hint="Optional pill above the heading, e.g. NEW">
        <TextField value={section.badge} onChange={(badge) => set({ badge })} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Eyebrow" hint="Small uppercase label above the heading">
        <TextField value={section.eyebrow} onChange={(eyebrow) => set({ eyebrow })} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-2">
        <FieldGroup label="Heading Size">
          <SelectField value={section.headingSize} onChange={(headingSize) => set({ headingSize })} options={SIZES} />
        </FieldGroup>
        <FieldGroup label="Heading Weight">
          <SelectField
            value={section.headingWeight}
            onChange={(headingWeight) => set({ headingWeight })}
            options={[
              { value: 'bold', label: 'Bold' },
              { value: 'normal', label: 'Regular' },
            ]}
          />
        </FieldGroup>
      </div>
      <FieldGroup label="Subheading">
        <TextAreaField value={section.subheading} onChange={(subheading) => set({ subheading })} rows={2} placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Body">
        <TextAreaField value={section.body} onChange={(body) => set({ body })} rows={5} />
      </FieldGroup>
      <FieldGroup label="Accent Rule">
        <ToggleField
          checked={section.showDivider}
          onChange={(showDivider) => set({ showDivider })}
          label="Short accent line under the heading"
        />
      </FieldGroup>
    </>
  );
}
