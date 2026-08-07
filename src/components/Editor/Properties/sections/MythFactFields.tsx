import type { MythFactSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, ListEditorField } from '../../../shared/FormFields';

export function MythFactFields({ section }: { section: MythFactSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<MythFactSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} />
      </FieldGroup>
      <FieldGroup label="Myths Intro Line">
        <TextField value={section.mythsIntro} onChange={(mythsIntro) => set({ mythsIntro })} />
      </FieldGroup>
      <FieldGroup label="Myths">
        <ListEditorField items={section.myths} onChange={(myths) => set({ myths })} itemLabel="Myth" multiline />
      </FieldGroup>
      <FieldGroup label="Facts Intro Line">
        <TextField value={section.factsIntro} onChange={(factsIntro) => set({ factsIntro })} />
      </FieldGroup>
      <FieldGroup label="Facts">
        <ListEditorField items={section.facts} onChange={(facts) => set({ facts })} itemLabel="Fact" multiline />
      </FieldGroup>
    </>
  );
}
