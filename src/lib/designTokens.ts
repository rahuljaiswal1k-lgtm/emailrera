// ============================================================================
// Design tokens + presets
// ----------------------------------------------------------------------------
// One place that decides the scales every block uses — radius, spacing, type,
// shadow, icon and button sizing. Renderers reference these instead of inventing
// their own numbers, which is what makes the whole newsletter read as a single
// design system rather than a pile of separate widgets.
// ============================================================================

/** Corner radius scale. */
export const RADIUS = {
  none: 0,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 100,
} as const;

/** Vertical rhythm scale, in px. */
export const SPACE = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  xxl: 48,
} as const;

/** Typography scale — size paired with its line height. */
export const TYPE = {
  micro: { size: 11, lh: 16, tracking: 1.2 },
  eyebrow: { size: 12, lh: 18, tracking: 1.2 },
  caption: { size: 12.5, lh: 19, tracking: 0 },
  small: { size: 13.5, lh: 21, tracking: 0 },
  body: { size: 14.5, lh: 24, tracking: 0 },
  bodyLg: { size: 15.5, lh: 27, tracking: 0 },
  h4: { size: 15, lh: 22, tracking: 0.3 },
  h3: { size: 17, lh: 25, tracking: 0.3 },
  h2: { size: 21, lh: 29, tracking: 0 },
  h1: { size: 27, lh: 35, tracking: -0.2 },
  display: { size: 32, lh: 40, tracking: -0.4 },
} as const;

export const ICON_SIZE = { sm: 30, md: 38, lg: 46 } as const;

/** Standard inner padding for a card, so every card breathes the same. */
export const CARD_PADDING = 26;

/** Gap between sibling blocks. */
export const BLOCK_GAP = 20;

// ---------------------------------------------------------------------------
// Design presets
// ---------------------------------------------------------------------------

import type { BlockStyle } from './blockStyle';

export interface DesignPreset {
  key: string;
  label: string;
  description: string;
  /** Partial BlockStyle merged over the block's current style. */
  style: Partial<BlockStyle>;
}

/**
 * Presets configure spacing, radius, shadow, card treatment and theme in one
 * click. They are plain BlockStyle patches, so everything stays editable
 * afterwards — a preset is a starting point, not a lock.
 */
export const DESIGN_PRESETS: DesignPreset[] = [
  {
    key: 'clean',
    label: 'Clean',
    description: 'White card, hairline border, generous padding',
    style: { theme: 'light', variant: 'card', borderRadius: RADIUS.xl, shadow: 'none', padding: CARD_PADDING, spacingTop: 0, spacingBottom: BLOCK_GAP, borderWidth: 1 },
  },
  {
    key: 'minimal',
    label: 'Minimal',
    description: 'No card, no border — just content and space',
    style: { theme: 'light', variant: 'minimal', borderRadius: RADIUS.none, shadow: 'none', padding: 0, spacingTop: 0, spacingBottom: SPACE.lg, borderWidth: 0 },
  },
  {
    key: 'modern',
    label: 'Modern',
    description: 'Rounded card with a soft lift',
    style: { theme: 'light', variant: 'card', borderRadius: RADIUS.xl, shadow: 'sm', padding: CARD_PADDING, spacingTop: 0, spacingBottom: BLOCK_GAP, borderWidth: 1 },
  },
  {
    key: 'corporate',
    label: 'Corporate',
    description: 'Tighter radius, firm border, businesslike',
    style: { theme: 'light', variant: 'card', borderRadius: RADIUS.sm, shadow: 'none', padding: 22, spacingTop: 0, spacingBottom: SPACE.md, borderWidth: 1 },
  },
  {
    key: 'premium',
    label: 'Premium',
    description: 'Deep padding, large radius, elevated',
    style: { theme: 'light', variant: 'elevated', borderRadius: RADIUS.xl, shadow: 'md', padding: 32, spacingTop: 0, spacingBottom: SPACE.lg, borderWidth: 0 },
  },
  {
    key: 'government',
    label: 'Government Circular',
    description: 'Formal, square, high contrast',
    style: { theme: 'light', variant: 'outline', borderRadius: RADIUS.none, shadow: 'none', padding: 22, spacingTop: 0, spacingBottom: SPACE.md, borderWidth: 1 },
  },
  {
    key: 'alert',
    label: 'Compliance Alert',
    description: 'Yellow band, bold and urgent',
    style: { theme: 'yellow', variant: 'filled', borderRadius: RADIUS.md, shadow: 'none', padding: 24, spacingTop: 0, spacingBottom: BLOCK_GAP, borderWidth: 0 },
  },
  {
    key: 'editorial',
    label: 'Editorial',
    description: 'Airy, borderless, long-form reading',
    style: { theme: 'light', variant: 'plain', borderRadius: RADIUS.none, shadow: 'none', padding: 0, spacingTop: SPACE.xs, spacingBottom: SPACE.xl, borderWidth: 0 },
  },
  {
    key: 'magazine',
    label: 'Magazine',
    description: 'Grey canvas panel with a wide gutter',
    style: { theme: 'gray', variant: 'filled', borderRadius: RADIUS.lg, shadow: 'none', padding: 28, spacingTop: 0, spacingBottom: SPACE.lg, borderWidth: 0 },
  },
  {
    key: 'insight',
    label: 'Insight',
    description: 'Dark panel for pull-quotes and analysis',
    style: { theme: 'dark', variant: 'filled', borderRadius: RADIUS.md, shadow: 'none', padding: 26, spacingTop: 0, spacingBottom: BLOCK_GAP, borderWidth: 0 },
  },
  {
    key: 'dark',
    label: 'Dark',
    description: 'Full dark treatment',
    style: { theme: 'dark', variant: 'filled', borderRadius: RADIUS.lg, shadow: 'none', padding: 28, spacingTop: 0, spacingBottom: BLOCK_GAP, borderWidth: 0 },
  },
  {
    key: 'luxury',
    label: 'Luxury',
    description: 'Dark, deeply padded, gold accent',
    style: { theme: 'dark', variant: 'elevated', borderRadius: RADIUS.xl, shadow: 'lg', padding: 34, spacingTop: SPACE.xs, spacingBottom: SPACE.lg, borderWidth: 0 },
  },
  {
    key: 'professional',
    label: 'Professional',
    description: 'Balanced default for most sections',
    style: { theme: 'light', variant: 'card', borderRadius: RADIUS.lg, shadow: 'none', padding: CARD_PADDING, spacingTop: 0, spacingBottom: BLOCK_GAP, borderWidth: 1 },
  },

  // -------------------------------------------------------------------------
  // Colour-forward professional presets. Each one commits to a distinct
  // palette (navy / emerald / slate / ivory / midnight / terracotta) so the
  // newsletter can move between "corporate", "legal", "tech-forward" or
  // "editorial" moods block-by-block instead of every block reading yellow.
  // -------------------------------------------------------------------------
  {
    key: 'corporateNavy',
    label: 'Corporate Navy',
    description: 'Deep navy card with a peach accent — boardroom-serious',
    style: { theme: 'navy', variant: 'filled', borderRadius: RADIUS.lg, shadow: 'md', padding: 30, spacingTop: 0, spacingBottom: SPACE.lg, borderWidth: 0 },
  },
  {
    key: 'legalEmerald',
    label: 'Legal Emerald',
    description: 'Deep emerald with a gold accent — compliance authority',
    style: { theme: 'emerald', variant: 'filled', borderRadius: RADIUS.md, shadow: 'md', padding: 30, spacingTop: 0, spacingBottom: SPACE.lg, borderWidth: 0 },
  },
  {
    key: 'modernSlate',
    label: 'Modern Slate',
    description: 'Cool slate canvas with a teal accent — clean & current',
    style: { theme: 'slate', variant: 'card', borderRadius: RADIUS.lg, shadow: 'sm', padding: CARD_PADDING, spacingTop: 0, spacingBottom: BLOCK_GAP, borderWidth: 1 },
  },
  {
    key: 'editorialIvory',
    label: 'Editorial Ivory',
    description: 'Warm ivory with a deep red accent — long-form feel',
    style: { theme: 'ivory', variant: 'card', borderRadius: RADIUS.md, shadow: 'none', padding: 30, spacingTop: SPACE.xs, spacingBottom: SPACE.xl, borderWidth: 1 },
  },
  {
    key: 'techMidnight',
    label: 'Tech Midnight',
    description: 'Near-black with an electric-blue accent — tech-forward',
    style: { theme: 'midnight', variant: 'filled', borderRadius: RADIUS.lg, shadow: 'lg', padding: 30, spacingTop: 0, spacingBottom: SPACE.lg, borderWidth: 0 },
  },
  {
    key: 'warmTerracotta',
    label: 'Warm Terracotta',
    description: 'Rust panel with a cream accent — hospitality warmth',
    style: { theme: 'terracotta', variant: 'filled', borderRadius: RADIUS.xl, shadow: 'md', padding: 32, spacingTop: 0, spacingBottom: SPACE.lg, borderWidth: 0 },
  },
];

export function getPreset(key: string): DesignPreset | undefined {
  return DESIGN_PRESETS.find((p) => p.key === key);
}
