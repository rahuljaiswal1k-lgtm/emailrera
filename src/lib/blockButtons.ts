// ============================================================================
// Buttons — available on EVERY block, not just the CTA section.
//
// A block carries an optional ButtonGroup. When `enabled` is false (or the key
// is absent entirely, as on newsletters saved before this existed) nothing is
// rendered, so existing sections are untouched.
// ============================================================================

import { nanoid } from './id';
import { esc, EMAIL_FONT, isDark } from './htmlEscape';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'dark' | 'yellow' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'rounded' | 'pill' | 'square';
export type ButtonAlign = 'left' | 'center' | 'right';
export type ButtonLayout = 'inline' | 'stacked';

export interface ButtonConfig {
  id: string;
  text: string;
  url: string;
  variant: ButtonVariant;
  size: ButtonSize;
  shape: ButtonShape;
  fullWidth: boolean;
}

export interface ButtonGroup {
  enabled: boolean;
  align: ButtonAlign;
  layout: ButtonLayout;
  buttons: ButtonConfig[];
}

export const DEFAULT_BUTTON_GROUP: ButtonGroup = {
  enabled: false,
  align: 'center',
  layout: 'inline',
  buttons: [],
};

export function createButton(partial: Partial<ButtonConfig> = {}): ButtonConfig {
  return {
    id: nanoid(),
    text: 'Contact Us',
    url: 'https://www.reraeasy.com/#contact',
    variant: 'primary',
    size: 'md',
    shape: 'rounded',
    fullWidth: false,
    ...partial,
  };
}

interface VariantPaint {
  bg: string;
  fg: string;
  border: string;
}

const VARIANT_PAINT: Record<ButtonVariant, VariantPaint> = {
  primary: { bg: '#FFDA4B', fg: '#1D1F1F', border: '#FFDA4B' },
  secondary: { bg: '#F3F4F6', fg: '#1D1F1F', border: '#D9DDE3' },
  outline: { bg: 'transparent', fg: '#1D1F1F', border: '#1D1F1F' },
  dark: { bg: '#1D1F1F', fg: '#FFFFFF', border: '#1D1F1F' },
  yellow: { bg: '#FFDA4B', fg: '#1D1F1F', border: '#E9C43C' },
  ghost: { bg: 'transparent', fg: '#1D1F1F', border: 'transparent' },
};

const SIZE_METRICS: Record<ButtonSize, { padY: number; padX: number; font: number; height: number; width: number }> = {
  sm: { padY: 9, padX: 20, font: 13, height: 36, width: 150 },
  md: { padY: 13, padX: 32, font: 15, height: 44, width: 190 },
  lg: { padY: 16, padX: 40, font: 16, height: 52, width: 230 },
};

function radiusFor(shape: ButtonShape, height: number): number {
  if (shape === 'pill') return Math.round(height / 2);
  if (shape === 'square') return 0;
  return 10;
}

/**
 * A single button. Outlook gets a VML roundrect (it ignores padding and
 * border-radius on anchors); every other client gets the styled <a>.
 */
export function renderButton(btn: ButtonConfig): string {
  if (!btn.text) return '';
  const paint = VARIANT_PAINT[btn.variant] ?? VARIANT_PAINT.primary;
  const m = SIZE_METRICS[btn.size] ?? SIZE_METRICS.md;
  const radius = radiusFor(btn.shape, m.height);

  // A custom background still needs readable text.
  const fg = paint.bg !== 'transparent' && paint.bg !== '#FFDA4B' && paint.bg !== '#F3F4F6'
    ? (isDark(paint.bg) ? '#FFFFFF' : '#111111')
    : paint.fg;

  const borderCss = paint.border !== 'transparent' ? `border:1px solid ${paint.border};` : '';
  const bgCss = paint.bg !== 'transparent' ? `background:${paint.bg};` : '';
  const widthCss = btn.fullWidth ? 'display:block;width:100%;text-align:center;' : 'display:inline-block;';

  const vml = `<!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(
      btn.url
    )}" style="height:${m.height}px;v-text-anchor:middle;width:${m.width}px;" arcsize="${Math.round(
    (radius / m.height) * 100
  )}%" stroke="f" fillcolor="${paint.bg === 'transparent' ? '#FFFFFF' : paint.bg}">
      <w:anchorlock/><center style="color:${fg};font-family:Arial,sans-serif;font-size:${m.font}px;font-weight:bold;">${esc(
    btn.text
  )}</center>
    </v:roundrect>
    <![endif]-->`;

  const anchor = `<!--[if !mso]><!-- -->
    <a href="${esc(btn.url)}" target="_blank" style="${widthCss}${bgCss}${borderCss}color:${fg};font-family:${EMAIL_FONT};font-size:${m.font}px;font-weight:bold;text-decoration:none;padding:${m.padY}px ${m.padX}px;border-radius:${radius}px;">${esc(
    btn.text
  )}</a>
    <!--<![endif]-->`;

  return vml + anchor;
}

/** Renders a whole button group, honouring alignment and inline/stacked layout. */
export function renderButtonGroup(group: ButtonGroup | undefined): string {
  if (!group || !group.enabled) return '';
  const buttons = group.buttons.filter((b) => b.text);
  if (buttons.length === 0) return '';

  if (group.layout === 'stacked') {
    const rows = buttons
      .map(
        (b) =>
          `<tr><td align="${group.align}" style="padding-bottom:10px;">${renderButton(b)}</td></tr>`
      )
      .join('');
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">${rows}</table>`;
  }

  const cells = buttons
    .map((b) => `<td style="padding:0 6px 10px;">${renderButton(b)}</td>`)
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr><td align="${group.align}">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>
  </td></tr></table>`;
}
