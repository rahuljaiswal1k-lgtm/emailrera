import type { ComparisonSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, ColorField, ListEditorField } from '../../../shared/FormFields';

export function ComparisonFields({ section }: { section: ComparisonSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<ComparisonSection>) => update(section.id, partial);

  return (
    <>
      <FieldGroup label="Heading">
        <TextField value={section.heading} onChange={(heading) => set({ heading })} placeholder="Optional" />
      </FieldGroup>

      <div className="rounded-xl border border-gray-200 p-3 mb-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Left column</p>
        <FieldGroup label="Title">
          <TextField value={section.leftTitle} onChange={(leftTitle) => set({ leftTitle })} />
        </FieldGroup>
        <FieldGroup label="Accent Colour">
          <ColorField value={section.leftAccent} onChange={(leftAccent) => set({ leftAccent })} />
        </FieldGroup>
        <FieldGroup label="Points">
          <ListEditorField items={section.leftItems} onChange={(leftItems) => set({ leftItems })} itemLabel="Point" multiline />
        </FieldGroup>
      </div>

      <div className="rounded-xl border border-gray-200 p-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Right column</p>
        <FieldGroup label="Title">
          <TextField value={section.rightTitle} onChange={(rightTitle) => set({ rightTitle })} />
        </FieldGroup>
        <FieldGroup label="Accent Colour">
          <ColorField value={section.rightAccent} onChange={(rightAccent) => set({ rightAccent })} />
        </FieldGroup>
        <FieldGroup label="Points">
          <ListEditorField items={section.rightItems} onChange={(rightItems) => set({ rightItems })} itemLabel="Point" multiline />
        </FieldGroup>
      </div>
    </>
  );
}
