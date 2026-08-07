import type { FooterSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, ToggleField } from '../../../shared/FormFields';
import { PanelGroup } from '../shared/PanelGroup';

/**
 * The footer is a real block now, so every part of it is toggleable and it
 * inherits the shared Design / Buttons / Boxes tabs like any other section.
 */
export function FooterFields({ section }: { section: FooterSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<FooterSection>) => update(section.id, partial);
  const on = (v: boolean | undefined) => v !== false;

  return (
    <>
      <PanelGroup title="Offices" defaultOpen>
        <FieldGroup label="Office Addresses">
          <ToggleField checked={on(section.showOffices)} onChange={(showOffices) => set({ showOffices })} label="Show office addresses" />
        </FieldGroup>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Offices come from <b>Global Settings → Office Addresses</b>. Add as many as you need there
          and they all appear here.
        </p>
      </PanelGroup>

      <PanelGroup title="Social" defaultOpen>
        <FieldGroup label="Social Icons">
          <ToggleField checked={on(section.showSocial)} onChange={(showSocial) => set({ showSocial })} label="Show the social icon row" />
        </FieldGroup>
        {on(section.showSocial) && (
          <FieldGroup label="Social Heading">
            <TextField value={section.socialLabel ?? 'FIND US ON'} onChange={(socialLabel) => set({ socialLabel })} />
          </FieldGroup>
        )}
      </PanelGroup>

      <PanelGroup title="Contact Line">
        <FieldGroup label="Website">
          <ToggleField checked={section.showWebsite ?? false} onChange={(showWebsite) => set({ showWebsite })} label="Show website URL" />
        </FieldGroup>
        <FieldGroup label="Email">
          <ToggleField checked={section.showEmail ?? false} onChange={(showEmail) => set({ showEmail })} label="Show email address" />
        </FieldGroup>
        <FieldGroup label="Phone">
          <ToggleField checked={section.showPhone ?? false} onChange={(showPhone) => set({ showPhone })} label="Show first phone number" />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Legal" defaultOpen>
        <FieldGroup label="Copyright / Legal Line">
          <ToggleField checked={on(section.showLegal)} onChange={(showLegal) => set({ showLegal })} label="Show the legal line from Global Settings" />
        </FieldGroup>
        <FieldGroup label="Extra Disclaimer" hint="Shown in smaller text below the legal line">
          <TextAreaField value={section.disclaimer ?? ''} onChange={(disclaimer) => set({ disclaimer })} rows={3} placeholder="Optional" />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Unsubscribe">
        <FieldGroup label="Unsubscribe Link">
          <ToggleField checked={on(section.showUnsubscribe)} onChange={(showUnsubscribe) => set({ showUnsubscribe })} label="Show an unsubscribe link" />
        </FieldGroup>
        {on(section.showUnsubscribe) && (
          <>
            <FieldGroup label="Link Text">
              <TextField value={section.unsubscribeText ?? 'Unsubscribe'} onChange={(unsubscribeText) => set({ unsubscribeText })} />
            </FieldGroup>
            <FieldGroup label="Link URL">
              <TextField value={section.unsubscribeUrl ?? '#'} onChange={(unsubscribeUrl) => set({ unsubscribeUrl })} placeholder="https://" />
            </FieldGroup>
          </>
        )}
      </PanelGroup>

      <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed mt-3">
        Adding this block replaces the built-in page footer. Background, theme, padding, corner
        radius and spacing are in the <b>Design</b> tab.
      </p>
    </>
  );
}
