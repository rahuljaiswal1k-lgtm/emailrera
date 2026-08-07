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

/**
 * The full token set a theme resolves to. Every renderer reads these instead of
 * hardcoding hex values — that is what makes switching a section's theme
 * actually recolour its heading, body, borders, icons, badges, boxes and
 * buttons rather than just its background.
 */
export interface ThemeTokens {
  /** Surface the block itself paints. */
  bg: string;
  /** Nested surface — cards inside the block. */
  surface: string;
  /** Secondary nested surface, for zebra rows and subtle panels. */
  surfaceAlt: string;
  heading: string;
  text: string;
  muted: string;
  border: string;
  divider: string;
  accent: string;
  /** Readable text on top of `accent`. */
  accentText: string;
  iconBg: string;
  iconFg: string;
  /** Soft tile behind section icons, as used in the reference newsletter. */
  iconTileBg: string;
  iconTileBorder: string;
  badgeBg: string;
  badgeText: string;
  boxBg: string;
  boxBorder: string;
  boxText: string;
  /**
   * A always-opaque surface for cards drawn *inside* a block. `bg` becomes
   * "transparent" for plain/minimal/outline variants, so nested cards must not
   * use it or they render white on a dark theme.
   */
  cardBg: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
}

export const THEME_TOKENS: Record<BlockTheme, ThemeTokens> = {
  light: {
    bg: '#FFFFFF', surface: '#F7F8FA', surfaceAlt: '#F3F4F6',
    heading: '#111111', text: '#333333', muted: '#6B7280',
    border: '#E3E6EC', divider: '#EDEFF3',
    accent: '#FFDA4B', accentText: '#1D1F1F',
    iconBg: '#1D1F1F', iconFg: '#FFDA4B', iconTileBg: '#FFF6D9', iconTileBorder: '#F3E3AE',
    badgeBg: '#1D1F1F', badgeText: '#FFFFFF',
    boxBg: '#FFFBEC', boxBorder: '#F2E0A8', boxText: '#4A421F',
    buttonBg: '#FFDA4B', buttonText: '#1D1F1F', buttonBorder: '#FFDA4B', cardBg: '#FFFFFF',
  },
  gray: {
    bg: '#F3F4F6', surface: '#FFFFFF', surfaceAlt: '#EDEFF3',
    heading: '#111111', text: '#333333', muted: '#5F6672',
    border: '#DDE1E8', divider: '#E3E6EC',
    accent: '#1D1F1F', accentText: '#FFFFFF',
    iconBg: '#1D1F1F', iconFg: '#FFDA4B', iconTileBg: '#FFFFFF', iconTileBorder: '#DDE1E8',
    badgeBg: '#1D1F1F', badgeText: '#FFFFFF',
    boxBg: '#FFFFFF', boxBorder: '#DDE1E8', boxText: '#333333',
    buttonBg: '#1D1F1F', buttonText: '#FFFFFF', buttonBorder: '#1D1F1F', cardBg: '#FFFFFF',
  },
  dark: {
    bg: '#1D1F1F', surface: '#2A2C2C', surfaceAlt: '#242626',
    heading: '#FFFFFF', text: '#E6E8E8', muted: '#A8ADAD',
    border: '#3A3D3D', divider: '#333636',
    accent: '#FFDA4B', accentText: '#1D1F1F',
    iconBg: '#FFDA4B', iconFg: '#1D1F1F', iconTileBg: '#2A2C2C', iconTileBorder: '#3A3D3D',
    badgeBg: '#FFDA4B', badgeText: '#1D1F1F',
    boxBg: '#2A2C2C', boxBorder: '#3A3D3D', boxText: '#E6E8E8',
    buttonBg: '#FFDA4B', buttonText: '#1D1F1F', buttonBorder: '#FFDA4B', cardBg: '#1D1F1F',
  },
  yellow: {
    bg: '#FFDA4B', surface: '#FFE787', surfaceAlt: '#FFF2C2',
    heading: '#1D1F1F', text: '#3A3520', muted: '#6B6234',
    border: '#E9C43C', divider: '#EDCE55',
    accent: '#1D1F1F', accentText: '#FFDA4B',
    iconBg: '#1D1F1F', iconFg: '#FFDA4B', iconTileBg: '#FFF2C2', iconTileBorder: '#E9C43C',
    badgeBg: '#1D1F1F', badgeText: '#FFFFFF',
    boxBg: '#FFF2C2', boxBorder: '#E9C43C', boxText: '#3A3520',
    buttonBg: '#1D1F1F', buttonText: '#FFFFFF', buttonBorder: '#1D1F1F', cardBg: '#FFF2C2',
  },
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
 * Turn theme + variant + explicit overrides into the concrete token set used
 * for rendering.
 *
 * Inheritance rules:
 *  - the theme supplies every token;
 *  - the variant adjusts the surface and border treatment;
 *  - explicit `backgroundColor` / `textColor` / `borderColor` overrides win,
 *    and a custom background re-derives the readable foreground so headings,
 *    body, icons and badges stay legible instead of going invisible.
 *
 * Only explicit overrides break inheritance — everything else cascades.
 */
export function computeTokens(style: BlockStyle): ThemeTokens & { bgCss: string; borderCss: string } {
  const base = THEME_TOKENS[style.theme] ?? THEME_TOKENS.light;
  const t: ThemeTokens = { ...base };

  let borderWidth = style.borderWidth;

  switch (style.variant) {
    case 'plain':
      t.bg = 'transparent';
      break;
    case 'card':
      borderWidth = style.borderWidth || 1;
      break;
    case 'outline':
      t.bg = 'transparent';
      borderWidth = style.borderWidth || 1;
      t.border = base.accent;
      break;
    case 'filled':
    case 'elevated':
      borderWidth = 0;
      break;
    case 'minimal':
      t.bg = 'transparent';
      borderWidth = 0;
      break;
  }

  // A custom background must recolour everything that sits on it, otherwise
  // switching to a dark custom colour leaves black text on black.
  if (style.backgroundColor) {
    t.bg = style.backgroundColor;
    const onDark = isDarkHex(style.backgroundColor);
    t.heading = onDark ? '#FFFFFF' : '#111111';
    t.text = onDark ? '#E6E8E8' : '#333333';
    t.muted = onDark ? '#A8ADAD' : '#6B7280';
    t.border = onDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.10)';
    t.divider = t.border;
    t.surface = onDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    t.surfaceAlt = t.surface;
    t.boxBg = t.surface;
    t.boxBorder = t.border;
    t.boxText = t.text;
    t.iconBg = onDark ? '#FFDA4B' : '#1D1F1F';
    t.iconFg = onDark ? '#1D1F1F' : '#FFDA4B';
    t.iconTileBg = t.surface;
    t.iconTileBorder = t.border;
    t.badgeBg = onDark ? '#FFDA4B' : '#1D1F1F';
    t.badgeText = onDark ? '#1D1F1F' : '#FFFFFF';
    t.cardBg = style.backgroundColor;
  }

  if (style.borderColor) {
    t.border = style.borderColor;
    t.divider = style.borderColor;
  }

  // An explicit text colour cascades to headings and muted text too, so the
  // whole block stays coherent rather than half-recoloured.
  if (style.textColor) {
    t.text = style.textColor;
    t.heading = style.textColor;
    t.muted = style.textColor;
    t.boxText = style.textColor;
  }

  return {
    ...t,
    bgCss: t.bg === 'transparent' ? '' : `background:${t.bg};`,
    borderCss: borderWidth > 0 ? `border:${borderWidth}px solid ${t.border};` : '',
  };
}

/** Local copy so blockStyle stays dependency-free. */
function isDarkHex(hex: string): boolean {
  const h = (hex || '').replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
}

/** Convenience: resolve a section's tokens in one call. */
export function tokensFor(type: string, style?: Partial<BlockStyle>): ThemeTokens {
  return computeTokens(styleForType(type, style));
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
