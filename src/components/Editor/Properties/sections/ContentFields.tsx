import type { ContentSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField, ListEditorField } from '../../../shared/FormFields';
import { IconPicker } from '../../../shared/IconPicker';

export function ContentFields({ section }: { section: ContentSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<ContentSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Icon">
        <IconPicker value={section.icon} onChange={(icon) => set({ icon })} />
      </FieldGroup>

      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} placeholder="SECTION HEADING" />
      </FieldGroup>

      <FieldGroup label="Subheading" hint="Optional line shown under the heading">
        <TextField value={section.subheading} onChange={(subheading) => set({ subheading })} placeholder="Optional" />
      </FieldGroup>

      <FieldGroup label="Body Type">
        <SelectField
          value={section.bodyType}
          onChange={(bodyType) => set({ bodyType })}
          options={[
            { value: 'paragraph', label: 'Paragraph' },
            { value: 'bullets', label: 'Bullet Points' },
            { value: 'numbered', label: 'Numbered List' },
            { value: 'mixed', label: 'Mixed (Paragraph + List)' },
          ]}
        />
      </FieldGroup>

      {(section.bodyType === 'paragraph' || section.bodyType === 'mixed') && (
        <FieldGroup label="Paragraph">
          <TextAreaField value={section.paragraph} onChange={(paragraph) => set({ paragraph })} rows={4} />
        </FieldGroup>
      )}

      {(section.bodyType === 'bullets' || section.bodyType === 'numbered' || section.bodyType === 'mixed') && (
        <FieldGroup label={section.bodyType === 'numbered' ? 'Numbered Items' : 'Bullet Points'}>
          <ListEditorField items={section.items} onChange={(items) => set({ items })} itemLabel="Point" multiline />
        </FieldGroup>
      )}
    </>
  );
}
