import type { ColumnsSection, ColumnItem } from '../../../../types/newsletter';
import { nanoid } from '../../../../lib/id';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField } from '../../../shared/FormFields';
import { IconPicker } from '../../../shared/IconPicker';
import { ImagePicker } from '../../../shared/ImagePicker';
import { RepeatableList } from '../shared/RepeatableList';

const STYLES: { value: ColumnsSection['columnStyle']; label: string }[] = [
  { value: 'plain', label: 'Plain text columns' },
  { value: 'card', label: 'Cards' },
  { value: 'icon', label: 'Icon grid' },
  { value: 'metric', label: 'Metric cards' },
  { value: 'image', label: 'Image cards' },
];

export function ColumnsFields({ section }: { section: ColumnsSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<ColumnsSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Column Style" hint="Covers two/three column text, icon grids, metric cards and image cards">
        <SelectField value={section.columnStyle} onChange={(columnStyle) => set({ columnStyle })} options={STYLES} />
      </FieldGroup>
      <FieldGroup label="Columns Per Row">
        <SelectField
          value={String(section.count)}
          onChange={(v) => set({ count: Number(v) as 2 | 3 })}
          options={[
            { value: '2', label: 'Two' },
            { value: '3', label: 'Three' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
      </FieldGroup>

      <FieldGroup label="Columns">
        <RepeatableList<ColumnItem>
          items={section.columns}
          onChange={(columns) => set({ columns })}
          create={() => ({ id: nanoid(), icon: 'document', title: '', text: '', imageId: null })}
          itemLabel="Column"
          renderItem={(col, updateCol) => (
            <>
              <FieldGroup label={section.columnStyle === 'metric' ? 'Number' : 'Title'}>
                <TextField
                  value={col.title}
                  onChange={(title) => updateCol({ title })}
                  placeholder={section.columnStyle === 'metric' ? '7,000+' : 'Title'}
                />
              </FieldGroup>
              <FieldGroup label={section.columnStyle === 'metric' ? 'Label' : 'Text'}>
                <TextAreaField value={col.text} onChange={(text) => updateCol({ text })} rows={2} />
              </FieldGroup>
              {section.columnStyle === 'icon' && (
                <FieldGroup label="Icon">
                  <IconPicker value={col.icon} onChange={(icon) => updateCol({ icon })} />
                </FieldGroup>
              )}
              {section.columnStyle === 'image' && (
                <FieldGroup label="Image">
                  <ImagePicker value={col.imageId} onChange={(imageId) => updateCol({ imageId })} compact />
                </FieldGroup>
              )}
            </>
          )}
        />
      </FieldGroup>
    </>
  );
}
