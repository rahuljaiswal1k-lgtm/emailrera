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

export type BlockTheme =
  | 'light'
  | 'gray'
  | 'dark'
  | 'yellow'
  | 'navy'
  | 'emerald'
  | 'slate'
  | 'ivory'
  | 'midnight'
  | 'terracotta';
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
  /** Email-safe font stack. Empty inherits the default Arial stack. */
  fontFamily?: string;
  /** Multiplier applied to body/heading sizes in this block. 1 = default. */
  fontScale?: number;
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
  fontFamily: '',
  fontScale: 1,
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
  // ------- new professional palettes -------
  navy: {
    // Deep corporate navy with a warm peach accent.
    bg: '#0F1E3D', surface: '#182D57', surfaceAlt: '#122447',
    heading: '#FFFFFF', text: '#D4DAE7', muted: '#8A94AA',
    border: '#26386A', divider: '#1E2E5C',
    accent: '#FF9A6C', accentText: '#0F1E3D',
    // Soft peach tile + deep navy icon fill + peach cutouts — high contrast.
    iconTileBg: '#FFE1CE', iconTileBorder: '#F5C6A8',
    iconFg: '#0F1E3D', iconBg: '#FFE1CE',
    badgeBg: '#FF9A6C', badgeText: '#0F1E3D',
    boxBg: '#182D57', boxBorder: '#26386A', boxText: '#D4DAE7',
    buttonBg: '#FF9A6C', buttonText: '#0F1E3D', buttonBorder: '#FF9A6C', cardBg: '#182D57',
  },
  emerald: {
    // Deep emerald green with a soft gold accent — legal/compliance authority.
    bg: '#0B3D2E', surface: '#155040', surfaceAlt: '#0F4638',
    heading: '#FFFFFF', text: '#CFDCD5', muted: '#8FA69C',
    border: '#1E5F4D', divider: '#164739',
    accent: '#D4A85A', accentText: '#0B3D2E',
    iconTileBg: '#F3E5B7', iconTileBorder: '#D9C078',
    iconFg: '#0B3D2E', iconBg: '#F3E5B7',
    badgeBg: '#D4A85A', badgeText: '#0B3D2E',
    boxBg: '#155040', boxBorder: '#1E5F4D', boxText: '#CFDCD5',
    buttonBg: '#D4A85A', buttonText: '#0B3D2E', buttonBorder: '#D4A85A', cardBg: '#155040',
  },
  slate: {
    // Cool slate gray with a teal accent — modern minimal.
    bg: '#F1F4F8', surface: '#FFFFFF', surfaceAlt: '#E7EBF1',
    heading: '#1E2A3A', text: '#3D4A5F', muted: '#7A8699',
    border: '#D5DBE4', divider: '#DEE3EB',
    accent: '#0F9E9A', accentText: '#FFFFFF',
    iconTileBg: '#E0F4F3', iconTileBorder: '#B7DFDD',
    iconFg: '#0F5B58', iconBg: '#E0F4F3',
    badgeBg: '#1E2A3A', badgeText: '#FFFFFF',
    boxBg: '#FFFFFF', boxBorder: '#D5DBE4', boxText: '#3D4A5F',
    buttonBg: '#0F9E9A', buttonText: '#FFFFFF', buttonBorder: '#0F9E9A', cardBg: '#FFFFFF',
  },
  ivory: {
    // Warm off-white with a deep red accent — editorial warmth.
    bg: '#FAF5EB', surface: '#FFFFFF', surfaceAlt: '#F1E9D5',
    heading: '#26170F', text: '#4C3A24', muted: '#8A755A',
    border: '#E4D6B7', divider: '#EEE1C4',
    accent: '#8C2E2B', accentText: '#FFFFFF',
    // Soft pink tile + near-black icon fill + pink cutouts — the user asked
    // for black icons in this theme specifically.
    iconTileBg: '#F5E3E1', iconTileBorder: '#D9AAA7',
    iconFg: '#26170F', iconBg: '#F5E3E1',
    badgeBg: '#8C2E2B', badgeText: '#FFFFFF',
    boxBg: '#FFFFFF', boxBorder: '#E4D6B7', boxText: '#4C3A24',
    buttonBg: '#8C2E2B', buttonText: '#FFFFFF', buttonBorder: '#8C2E2B', cardBg: '#FFFFFF',
  },
  midnight: {
    // Very dark blue-black with an electric-blue accent — tech-forward.
    bg: '#0A0F1C', surface: '#141C2C', surfaceAlt: '#0F1524',
    heading: '#FFFFFF', text: '#C7D0DE', muted: '#7A8598',
    border: '#22304A', divider: '#1A2338',
    accent: '#4CC2FF', accentText: '#0A0F1C',
    iconTileBg: '#D8EEFB', iconTileBorder: '#9CCFEA',
    iconFg: '#0A2A55', iconBg: '#D8EEFB',
    badgeBg: '#4CC2FF', badgeText: '#0A0F1C',
    boxBg: '#141C2C', boxBorder: '#22304A', boxText: '#C7D0DE',
    buttonBg: '#4CC2FF', buttonText: '#0A0F1C', buttonBorder: '#4CC2FF', cardBg: '#141C2C',
  },
  terracotta: {
    // Warm rust with a cream accent — editorial and inviting.
    bg: '#C25A3B', surface: '#B04F32', surfaceAlt: '#A94B2F',
    heading: '#FFF9F0', text: '#FFE8D6', muted: '#F5C9AC',
    border: '#8A3D25', divider: '#994528',
    accent: '#FFF1D6', accentText: '#7A2E19',
    iconTileBg: '#FFF1D6', iconTileBorder: '#E9D0A6',
    iconFg: '#7A2E19', iconBg: '#FFF1D6',
    badgeBg: '#FFF1D6', badgeText: '#7A2E19',
    boxBg: '#B04F32', boxBorder: '#8A3D25', boxText: '#FFE8D6',
    buttonBg: '#FFF1D6', buttonText: '#7A2E19', buttonBorder: '#FFF1D6', cardBg: '#B04F32',
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

  // Font family / align cascade to every descendant of the block. The
  // `!important` matters because most per-element renderers ship with their
  // own inline `font-family:Arial…;text-align:left;` — without it, changing
  // the block font or alignment from the format toolbar would have no
  // visible effect. Inline `!important` is safe for email clients.
  const fontCss = style.fontFamily ? `font-family:${style.fontFamily} !important;` : '';
  const alignCss = `text-align:${style.align} !important;`;
  const scale = style.fontScale && style.fontScale !== 1 ? `font-size:${Math.round(style.fontScale * 100)}%;` : '';

  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${t.bgCss}${t.borderCss}${radiusCss}${shadowCss}${fontCss}">
    <tr><td style="${paddingCss}color:${t.text};${alignCss}${fontCss}${scale}">${inner}</td></tr>
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
