import type { HeaderSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, ToggleField, SliderField, ColorField } from '../../../shared/FormFields';
import { PanelGroup } from '../shared/PanelGroup';

/**
 * The Header block is now a real, editable section. Colours, font, padding and
 * radius come from the shared Design tab (Colours panel → Theme / Text override
 * / Background override); this Content tab holds the header-specific text.
 */
export function HeaderFields({ section }: { section: HeaderSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<HeaderSection>) => update(section.id, partial);
  const on = (v: boolean | undefined) => v !== false;

  return (
    <>
      <PanelGroup title="Logo" defaultOpen>
        <FieldGroup label="Show Logo" hint="Uses the logo from Global Settings → Brand Assets">
          <ToggleField checked={on(section.showLogo)} onChange={(showLogo) => set({ showLogo })} label="Show the company logo" />
        </FieldGroup>
        {on(section.showLogo) && (
          <FieldGroup label="Logo Width">
            <SliderField
              value={section.logoWidth ?? 120}
              onChange={(logoWidth) => set({ logoWidth })}
              min={60}
              max={260}
              unit="px"
            />
          </FieldGroup>
        )}
      </PanelGroup>

      <PanelGroup title="Brand Text" defaultOpen>
        <FieldGroup label="Show Brand Text">
          <ToggleField
            checked={on(section.showBrandText)}
            onChange={(showBrandText) => set({ showBrandText })}
            label="Show a text lockup"
          />
        </FieldGroup>
        {on(section.showBrandText) && (
          <FieldGroup label="Brand / Company Name" hint="Click it on the canvas to edit in place too">
            <TextField
              value={section.brandText ?? ''}
              onChange={(brandText) => set({ brandText })}
              placeholder="RERA Easy"
            />
          </FieldGroup>
        )}
      </PanelGroup>

      <PanelGroup title="Tagline">
        <FieldGroup label="Show Tagline">
          <ToggleField
            checked={section.showTagline ?? false}
            onChange={(showTagline) => set({ showTagline })}
            label="Show a small tagline under the logo"
          />
        </FieldGroup>
        {section.showTagline && (
          <FieldGroup label="Tagline Text">
            <TextField
              value={section.tagline ?? ''}
              onChange={(tagline) => set({ tagline })}
              placeholder="MahaRERA compliance made simple"
            />
          </FieldGroup>
        )}
      </PanelGroup>

      <PanelGroup title="Background">
        <FieldGroup label="Background Colour" hint="Overrides the block theme. Leave blank to inherit.">
          <ColorField
            value={section.backgroundColor ?? ''}
            onChange={(backgroundColor) => set({ backgroundColor })}
            allowEmpty
          />
        </FieldGroup>
      </PanelGroup>

      <p className="text-[11px] text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed mt-3">
        Font, size, alignment and text colour live in the <b>Design</b> tab (Colours → Theme /
        Text override, and the format toolbar when you click the brand text on the canvas).
      </p>
    </>
  );
}
