import type { ListBlockSection, ListStyle, ListItem } from '../../../../types/newsletter';
import { nanoid } from '../../../../lib/id';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField } from '../../../shared/FormFields';
import { IconPicker } from '../../../shared/IconPicker';
import { RepeatableList } from '../shared/RepeatableList';

const STYLES: { value: ListStyle; label: string }[] = [
  { value: 'checklist', label: 'Checklist (green ticks)' },
  { value: 'arrows', label: 'Arrows (thick →)' },
  { value: 'numbered', label: 'Numbered List' },
  { value: 'steps', label: 'Numbered Steps' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'takeaways', label: 'Key Takeaways' },
  { value: 'features', label: 'Feature List' },
  { value: 'bullets', label: 'Bullets' },
];

export function ListBlockFields({ section }: { section: ListBlockSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<ListBlockSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="List Style" hint="One block covers checklists, steps, timelines and takeaways">
        <SelectField value={section.listStyle} onChange={(listStyle) => set({ listStyle })} options={STYLES} />
      </FieldGroup>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Icon">
        <IconPicker value={section.icon} onChange={(icon) => set({ icon })} />
      </FieldGroup>
      <FieldGroup label="Intro Line" hint="Optional line between the heading and the list">
        <TextAreaField value={section.intro} onChange={(intro) => set({ intro })} rows={2} placeholder="Optional" />
      </FieldGroup>

      <FieldGroup label="Items">
        <RepeatableList<ListItem>
          items={section.items}
          onChange={(items) => set({ items })}
          create={() => ({ id: nanoid(), title: '', text: '' })}
          itemLabel="Item"
          renderItem={(item, updateItem) => (
            <>
              <FieldGroup label="Title">
                <TextField value={item.title} onChange={(title) => updateItem({ title })} placeholder="Optional" />
              </FieldGroup>
              <FieldGroup label="Text">
                <TextAreaField value={item.text} onChange={(text) => updateItem({ text })} rows={2} />
              </FieldGroup>
            </>
          )}
        />
      </FieldGroup>
    </>
  );
}
