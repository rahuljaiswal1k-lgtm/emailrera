// ============================================================================
// Shared block design system
// ----------------------------------------------------------------------------
// Every section ("block") can carry a BlockStyle. It is the single place that
// decides background / text / border / radius / shadow / padding / spacing /
// alignment / width, so a new block type never has to reinvent any of it.
//
// Backward compatibility: `style` is OPTIONAL on a section. Newsletters saved
// before this system existed have no `style` key at all, so resolveStyle()
// falls back to DEFAULT_BLOCK_STYLE — a transparent, zero-padding pass-through
// that renders those sections exactly as they rendered before.
// ============================================================================

export type BlockTheme = 'light' | 'gray' | 'dark' | 'yellow';
export type BlockVariant = 'plain' | 'card' | 'outline' | 'filled' | 'elevated' | 'minimal';
export type ShadowSize = 'none' | 'sm' | 'md' | 'lg';
export type BlockAlign = 'left' | 'center' | 'right';
export type DividerPosition = 'none' | 'top' | 'bottom' | 'both';

export interface BlockStyle {
  theme: BlockTheme;
  variant: BlockVariant;
  /** Empty string means "derive from theme/variant". */
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  shadow: ShadowSize;
  padding: number;
  spacingTop: number;
  spacingBottom: number;
  align: BlockAlign;
  /** Percentage of the 640px column. 100 = full width. */
  maxWidth: number;
  divider: DividerPosition;
  /**
   * Escape the padded content column and run edge to edge across the whole
   * 640px email body — the full-bleed yellow hero band, image banners, etc.
   * generateHTML() emits these in their own unpadded table row.
   */
  fullBleed: boolean;
}

/**
 * The neutral default. A block with this style adds no visual chrome at all,
 * which is what keeps every pre-existing section rendering unchanged.
 */
export const DEFAULT_BLOCK_STYLE: BlockStyle = {
  theme: 'light',
  variant: 'plain',
  backgroundColor: '',
  textColor: '',
  borderColor: '',
  borderWidth: 0,
  borderRadius: 0,
  shadow: 'none',
  padding: 0,
  spacingTop: 0,
  spacingBottom: 18,
  align: 'left',
  maxWidth: 100,
  divider: 'none',
  fullBleed: false,
};

/** Sensible starting point for the newer, card-style blocks. */
export const CARD_BLOCK_STYLE: BlockStyle = {
  ...DEFAULT_BLOCK_STYLE,
  variant: 'card',
  borderRadius: 22,
  padding: 28,
};

/** Edge-to-edge band with square corners — the hero / banner treatment. */
export const FULL_BLEED_BLOCK_STYLE: BlockStyle = {
  ...DEFAULT_BLOCK_STYLE,
  fullBleed: true,
  borderRadius: 0,
  spacingBottom: 0,
};

/**
 * Per-type fallback used when a section carries no `style` of its own —
 * i.e. newsletters saved before the design system existed. Anything not
 * listed keeps the neutral DEFAULT_BLOCK_STYLE, so those sections render
 * exactly as they always did.
 */
export const DEFAULT_STYLE_BY_TYPE: Record<string, BlockStyle> = {
  hero: FULL_BLEED_BLOCK_STYLE,
};

/** Resolve a section's style, falling back to its type default. */
export function styleForType(type: string, style?: Partial<BlockStyle>): BlockStyle {
  if (style) return resolveStyle(style);
  return DEFAULT_STYLE_BY_TYPE[type] ?? DEFAULT_BLOCK_STYLE;
}

export interface ThemeTokens {
  bg: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
}

export const THEME_TOKENS: Record<BlockTheme, ThemeTokens> = {
  light: { bg: '#FFFFFF', text: '#1A1A1A', muted: '#666666', border: '#D9DDE3', accent: '#FFDA4B' },
  gray: { bg: '#F3F4F6', text: '#1A1A1A', muted: '#555555', border: '#E3E6EC', accent: '#1D1F1F' },
  dark: { bg: '#1D1F1F', text: '#FFFFFF', muted: '#BFC3C3', border: '#333333', accent: '#FFDA4B' },
  yellow: { bg: '#FFDA4B', text: '#1D1F1F', muted: '#5A5230', border: '#E9C43C', accent: '#1D1F1F' },
};

export const SHADOW_CSS: Record<ShadowSize, string> = {
  none: '',
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 6px 18px rgba(0,0,0,0.10)',
  lg: '0 14px 34px rgba(0,0,0,0.14)',
};

export function resolveStyle(style?: Partial<BlockStyle>): BlockStyle {
  return { ...DEFAULT_BLOCK_STYLE, ...(style ?? {}) };
}

/**
 * Turn theme + variant + explicit overrides into the concrete colors used for
 * rendering. Explicit values always win over the variant/theme derivation.
 */
export function computeTokens(style: BlockStyle): ThemeTokens & { bgCss: string; borderCss: string } {
  const base = THEME_TOKENS[style.theme] ?? THEME_TOKENS.light;

  let bg = base.bg;
  let border = base.border;
  let borderWidth = style.borderWidth;

  switch (style.variant) {
    case 'plain':
      bg = 'transparent';
      borderWidth = style.borderWidth;
      break;
    case 'card':
      borderWidth = style.borderWidth || 1;
      break;
    case 'outline':
      bg = 'transparent';
      borderWidth = style.borderWidth || 1;
      border = style.borderColor || base.accent;
      break;
    case 'filled':
      borderWidth = 0;
      break;
    case 'elevated':
      borderWidth = 0;
      break;
    case 'minimal':
      bg = 'transparent';
      borderWidth = 0;
      break;
  }

  if (style.backgroundColor) bg = style.backgroundColor;
  if (style.borderColor) border = style.borderColor;

  const text = style.textColor || base.text;

  return {
    bg,
    text,
    muted: base.muted,
    border,
    accent: base.accent,
    bgCss: bg === 'transparent' ? '' : `background:${bg};`,
    borderCss: borderWidth > 0 ? `border:${borderWidth}px solid ${border};` : '',
  };
}

/** Vertical spacer used between blocks and around dividers. */
export function spacerRow(height: number): string {
  if (height <= 0) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${height}" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function dividerRow(color: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${color};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

/**
 * Wrap a block's inner HTML in its style chrome. Table-based throughout so it
 * survives Outlook; `box-shadow` is the one progressive-enhancement property
 * and simply degrades to a flat card where unsupported.
 */
export function wrapBlock(inner: string, style: BlockStyle): string {
  if (!inner) return '';
  const t = computeTokens(style);

  const shadowCss =
    style.variant === 'elevated' || style.shadow !== 'none'
      ? `box-shadow:${SHADOW_CSS[style.shadow === 'none' ? 'md' : style.shadow]};`
      : '';
  const radiusCss = style.borderRadius > 0 ? `border-radius:${style.borderRadius}px;` : '';
  const paddingCss = style.padding > 0 ? `padding:${style.padding}px;` : '';

  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${t.bgCss}${t.borderCss}${radiusCss}${shadowCss}">
    <tr><td style="${paddingCss}color:${t.text};text-align:${style.align};">${inner}</td></tr>
  </table>`;

  // maxWidth < 100 centers a narrower column inside the 640px content area.
  const body =
    style.maxWidth >= 100
      ? card
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><table role="presentation" width="${style.maxWidth}%" cellpadding="0" cellspacing="0" border="0" style="width:${style.maxWidth}%;"><tr><td>${card}</td></tr></table></td></tr></table>`;

  const dividerColor = t.border || '#E3E6EC';
  const top = style.divider === 'top' || style.divider === 'both' ? dividerRow(dividerColor) + spacerRow(14) : '';
  const bottom = style.divider === 'bottom' || style.divider === 'both' ? spacerRow(14) + dividerRow(dividerColor) : '';

  return spacerRow(style.spacingTop) + top + body + bottom + spacerRow(style.spacingBottom);
}

// ---------------------------------------------------------------------------
// Typography helpers shared by every block renderer
// ---------------------------------------------------------------------------

export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const HEADING_SIZES: Record<HeadingSize, { size: number; lineHeight: number }> = {
  xs: { size: 13, lineHeight: 20 },
  sm: { size: 15, lineHeight: 22 },
  md: { size: 18, lineHeight: 26 },
  lg: { size: 22, lineHeight: 30 },
  xl: { size: 28, lineHeight: 36 },
};
