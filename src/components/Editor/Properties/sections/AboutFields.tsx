import type { AboutSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, ToggleField, SliderField } from '../../../shared/FormFields';
import { PanelGroup } from '../shared/PanelGroup';

export function AboutFields({ section }: { section: AboutSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<AboutSection>) => update(section.id, partial);

  // Undefined means "show" so blocks saved before these toggles existed keep
  // rendering every element.
  const on = (v: boolean | undefined) => v !== false;

  return (
    <>
      <PanelGroup title="Content" defaultOpen>
        <FieldGroup label="Label" hint='The small "ABOUT" tag. Leave blank to hide it.'>
          <TextField value={section.heading} onChange={(heading) => set({ heading })} />
        </FieldGroup>
        <FieldGroup label="Description">
          <TextAreaField value={section.description} onChange={(description) => set({ description })} rows={6} />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Logo" defaultOpen>
        <FieldGroup label="Show Logo">
          <ToggleField checked={on(section.showLogo)} onChange={(showLogo) => set({ showLogo })} label="Show the logo beside the label" />
        </FieldGroup>
        {on(section.showLogo) && (
          <FieldGroup label="Logo Width">
            <SliderField value={section.logoWidth ?? 96} onChange={(logoWidth) => set({ logoWidth })} min={50} max={200} unit="px" />
          </FieldGroup>
        )}
        <p className="text-[11px] text-gray-400 leading-relaxed">
          The logo comes from <b>Global Settings → Brand Assets</b>.
        </p>
      </PanelGroup>

      <PanelGroup title="Divider">
        <FieldGroup label="Divider">
          <ToggleField checked={on(section.showDivider)} onChange={(showDivider) => set({ showDivider })} label="Rule between description and contact" />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Contact" defaultOpen>
        <FieldGroup label="Show Contact Area">
          <ToggleField checked={on(section.showContact)} onChange={(showContact) => set({ showContact })} label="Show the contact block" />
        </FieldGroup>
        {on(section.showContact) && (
          <>
            <FieldGroup label="Contact Label" hint="Leave blank to hide the heading">
              <TextField value={section.contactLabel ?? 'CONTACT'} onChange={(contactLabel) => set({ contactLabel })} />
            </FieldGroup>
            <FieldGroup label="Phone Numbers">
              <ToggleField checked={on(section.showPhones)} onChange={(showPhones) => set({ showPhones })} label="Show phone numbers" />
            </FieldGroup>
            <FieldGroup label="Email">
              <ToggleField checked={on(section.showEmail)} onChange={(showEmail) => set({ showEmail })} label="Show email address" />
            </FieldGroup>
          </>
        )}
      </PanelGroup>

      <PanelGroup title="Call to Action">
        <FieldGroup label="Show CTA Button">
          <ToggleField checked={section.showCta ?? false} onChange={(showCta) => set({ showCta })} label="Show a button in the contact area" />
        </FieldGroup>
        {section.showCta && (
          <>
            <FieldGroup label="Button Text">
              <TextField value={section.ctaText ?? ''} onChange={(ctaText) => set({ ctaText })} placeholder="Call Now On +91 …" />
            </FieldGroup>
            <FieldGroup label="Button URL" hint="Use tel: for a phone number">
              <TextField value={section.ctaUrl ?? ''} onChange={(ctaUrl) => set({ ctaUrl })} placeholder="tel:+919136490809" />
            </FieldGroup>
          </>
        )}
      </PanelGroup>

      <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed mt-3">
        Phone numbers and the email address come from <b>Global Settings</b> so they stay consistent
        across every newsletter. Background, theme, padding, radius, shadow and full-width live in
        the <b>Design</b> tab.
      </p>
    </>
  );
}
