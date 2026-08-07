import type { FaqSection, FaqItem } from '../../../../types/newsletter';
import { nanoid } from '../../../../lib/id';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField } from '../../../shared/FormFields';
import { IconPicker } from '../../../shared/IconPicker';
import { RepeatableList } from '../shared/RepeatableList';

export function FaqFields({ section }: { section: FaqSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<FaqSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Icon">
        <IconPicker value={section.icon} onChange={(icon) => set({ icon })} />
      </FieldGroup>
      <FieldGroup label="Questions">
        <RepeatableList<FaqItem>
          items={section.items}
          onChange={(items) => set({ items })}
          create={() => ({ id: nanoid(), question: '', answer: '' })}
          itemLabel="Question"
          renderItem={(item, updateItem) => (
            <>
              <FieldGroup label="Question">
                <TextField value={item.question} onChange={(question) => updateItem({ question })} />
              </FieldGroup>
              <FieldGroup label="Answer">
                <TextAreaField value={item.answer} onChange={(answer) => updateItem({ answer })} rows={3} />
              </FieldGroup>
            </>
          )}
        />
      </FieldGroup>
    </>
  );
}
