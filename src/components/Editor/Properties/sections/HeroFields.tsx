import type { HeroSection, HeroLayout } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, ColorField, SelectField, ToggleField, SliderField } from '../../../shared/FormFields';
import { ImagePicker } from '../../../shared/ImagePicker';
import { PanelGroup } from '../shared/PanelGroup';

const LAYOUTS: { value: HeroLayout; label: string }[] = [
  { value: 'classic', label: 'Classic — badge, heading, notice' },
  { value: 'stripBanner', label: 'Strip Banner — top/bottom strips' },
  { value: 'imageSide', label: 'Image beside text' },
  { value: 'imageAbove', label: 'Image above text' },
  { value: 'imageBelow', label: 'Image below text' },
  { value: 'minimal', label: 'Minimal — small heading' },
  { value: 'dark', label: 'Dark' },
  { value: 'editorial', label: 'Editorial — oversized heading' },
];

export function HeroFields({ section }: { section: HeroSection }) {
  const update = useNewsletterStore((s) => s.updateSection);
  const set = (partial: Partial<HeroSection>) => update(section.id, partial);

  const usesImage =
    section.heroLayout === 'imageSide' ||
    section.heroLayout === 'imageAbove' ||
    section.heroLayout === 'imageBelow';

  return (
    <>
      <PanelGroup title="Layout" defaultOpen>
        <FieldGroup label="Hero Layout">
          <SelectField
            value={section.heroLayout ?? 'classic'}
            onChange={(heroLayout) => set({ heroLayout })}
            options={LAYOUTS}
          />
        </FieldGroup>
        <FieldGroup label="Text Alignment">
          <SelectField
            value={section.textAlign}
            onChange={(textAlign) => set({ textAlign })}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </FieldGroup>
        <FieldGroup label="Hero Padding">
          <SliderField value={section.heroPadding ?? 34} onChange={(heroPadding) => set({ heroPadding })} min={12} max={80} unit="px" />
        </FieldGroup>
        <FieldGroup label="Corner Radius" hint="Ignored while Full Width is on (Design tab)">
          <SliderField value={section.borderRadius ?? 18} onChange={(borderRadius) => set({ borderRadius })} min={0} max={36} unit="px" />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Content" defaultOpen>
        <FieldGroup label="Badge" hint='Pill above the headline, e.g. "IMPORTANT UPDATE"'>
          <TextField value={section.badge ?? ''} onChange={(badge) => set({ badge })} placeholder="Optional" />
        </FieldGroup>
        <FieldGroup label="Headline" hint="The big title inside the email. The name at the top of this screen is only how the draft is listed on your dashboard.">
          <TextField value={section.title} onChange={(title) => set({ title })} placeholder="Your headline" />
        </FieldGroup>
        <FieldGroup label="Notice Strip" hint='Pill under the headline, e.g. "KEEP READING TO KNOW IF YOUR PROJECT MAY BENEFIT"'>
          <TextField value={section.noticeText ?? ''} onChange={(noticeText) => set({ noticeText })} placeholder="Optional" />
        </FieldGroup>
        <FieldGroup label="Show Subtitle">
          <ToggleField checked={section.showSubtitle} onChange={(showSubtitle) => set({ showSubtitle })} label="Display a subtitle under the headline" />
        </FieldGroup>
        {section.showSubtitle && (
          <FieldGroup label="Subtitle">
            <TextAreaField value={section.subtitle} onChange={(subtitle) => set({ subtitle })} rows={2} />
          </FieldGroup>
        )}
        <FieldGroup label="Description">
          <TextAreaField value={section.description ?? ''} onChange={(description) => set({ description })} rows={3} placeholder="Optional" />
        </FieldGroup>
        <FieldGroup label="Accent Divider">
          <ToggleField checked={section.showDivider ?? false} onChange={(showDivider) => set({ showDivider })} label="Short accent rule under the text" />
        </FieldGroup>
      </PanelGroup>

      <PanelGroup title="Logo">
        <FieldGroup label="Show Logo" hint="Uses the logo from Global Settings → Brand Assets">
          <ToggleField checked={section.showLogo ?? false} onChange={(showLogo) => set({ showLogo })} label="Show the logo inside the hero" />
        </FieldGroup>
        {section.showLogo && (
          <FieldGroup label="Logo Width">
            <SliderField value={section.logoWidth ?? 120} onChange={(logoWidth) => set({ logoWidth })} min={60} max={260} unit="px" />
          </FieldGroup>
        )}
      </PanelGroup>

      {usesImage && (
        <PanelGroup title="Image" defaultOpen>
          <FieldGroup label="Hero Image">
            <ImagePicker value={section.imageId ?? null} onChange={(imageId) => set({ imageId })} />
          </FieldGroup>
        </PanelGroup>
      )}

      <PanelGroup title="Strips">
        <FieldGroup label="Top Strip">
          <ToggleField checked={section.showTopStrip ?? false} onChange={(showTopStrip) => set({ showTopStrip })} label="Show a strip above the hero" />
        </FieldGroup>
        {section.showTopStrip && (
          <>
            <FieldGroup label="Top Strip Text">
              <TextField value={section.topStripText ?? ''} onChange={(topStripText) => set({ topStripText })} />
            </FieldGroup>
            <FieldGroup label="Top Strip Background">
              <ColorField value={section.topStripColor ?? '#101010'} onChange={(topStripColor) => set({ topStripColor })} />
            </FieldGroup>
            <FieldGroup label="Top Strip Text Colour">
              <ColorField value={section.topStripTextColor ?? '#FFFFFF'} onChange={(topStripTextColor) => set({ topStripTextColor })} />
            </FieldGroup>
          </>
        )}
        <FieldGroup label="Bottom Strip">
          <ToggleField checked={section.showBottomStrip ?? false} onChange={(showBottomStrip) => set({ showBottomStrip })} label="Show a strip below the hero" />
        </FieldGroup>
        {section.showBottomStrip && (
          <>
            <FieldGroup label="Bottom Strip Text">
              <TextField value={section.bottomStripText ?? ''} onChange={(bottomStripText) => set({ bottomStripText })} />
            </FieldGroup>
            <FieldGroup label="Bottom Strip Background">
              <ColorField value={section.bottomStripColor ?? '#101010'} onChange={(bottomStripColor) => set({ bottomStripColor })} />
            </FieldGroup>
            <FieldGroup label="Bottom Strip Text Colour">
              <ColorField value={section.bottomStripTextColor ?? '#FFFFFF'} onChange={(bottomStripTextColor) => set({ bottomStripTextColor })} />
            </FieldGroup>
          </>
        )}
      </PanelGroup>

      <PanelGroup title="Buttons">
        <FieldGroup label="Primary Button Text">
          <TextField value={section.ctaText ?? ''} onChange={(ctaText) => set({ ctaText })} placeholder="Optional" />
        </FieldGroup>
        {section.ctaText && (
          <FieldGroup label="Primary Button URL">
            <TextField value={section.ctaUrl ?? ''} onChange={(ctaUrl) => set({ ctaUrl })} placeholder="https://" />
          </FieldGroup>
        )}
        <FieldGroup label="Secondary Button Text">
          <TextField value={section.secondaryCtaText ?? ''} onChange={(secondaryCtaText) => set({ secondaryCtaText })} placeholder="Optional" />
        </FieldGroup>
        {section.secondaryCtaText && (
          <FieldGroup label="Secondary Button URL">
            <TextField value={section.secondaryCtaUrl ?? ''} onChange={(secondaryCtaUrl) => set({ secondaryCtaUrl })} placeholder="https://" />
          </FieldGroup>
        )}
      </PanelGroup>

      <PanelGroup title="Colours">
        <FieldGroup label="Hero Background">
          <ColorField value={section.backgroundColor} onChange={(backgroundColor) => set({ backgroundColor })} />
        </FieldGroup>
        <FieldGroup label="Heading Colour" hint="Blank picks white or black automatically">
          <ColorField value={section.headingColor ?? ''} onChange={(headingColor) => set({ headingColor })} allowEmpty />
        </FieldGroup>
        <FieldGroup label="Body Text Colour">
          <ColorField value={section.textColorOverride ?? ''} onChange={(textColorOverride) => set({ textColorOverride })} allowEmpty />
        </FieldGroup>
        <FieldGroup label="Badge / Notice Colour">
          <ColorField value={section.stripColor ?? ''} onChange={(stripColor) => set({ stripColor })} allowEmpty />
        </FieldGroup>
        <FieldGroup label="Badge / Notice Text Colour">
          <ColorField value={section.stripTextColor ?? ''} onChange={(stripTextColor) => set({ stripTextColor })} allowEmpty />
        </FieldGroup>
      </PanelGroup>
    </>
  );
}
