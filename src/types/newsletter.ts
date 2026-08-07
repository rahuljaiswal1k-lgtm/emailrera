// ============================================================================
// Core data model for the RERA Easy Newsletter Builder
// Mirrors the "Data Structure" section of the requirements doc, extended
// with every field each section type needs.
// ============================================================================

import type { BlockStyle, HeadingSize } from '../lib/blockStyle';
import type { ButtonGroup } from '../lib/blockButtons';
import type { ContainerBox } from '../lib/blockBoxes';
import type { BrandAssets } from '../lib/brandAssets';

export type SectionType =
  // --- original nine (unchanged) ---
  | 'hero'
  | 'content'
  | 'infoCard'
  | 'mythFact'
  | 'image'
  | 'quote'
  | 'cta'
  | 'stats'
  | 'about'
  // --- extended block library ---
  | 'textBlock'
  | 'boxGroup'
  | 'listBlock'
  | 'columns'
  | 'faq'
  | 'comparison'
  | 'testimonial'
  | 'logoStrip'
  | 'gallery'
  | 'divider'
  | 'ctaBanner'
  | 'imageBanner';

export interface BaseSection {
  id: string;
  type: SectionType;
  visible: boolean;

  // --- shared block capabilities -------------------------------------------
  // All optional. A newsletter saved before these existed simply has no such
  // keys, and the resolve helpers fall back to neutral defaults, so old
  // sections render byte-for-byte as they did before.

  /** Background / border / radius / shadow / padding / spacing / alignment. */
  style?: BlockStyle;
  /** Optional buttons — available on every block, not just CTA. */
  buttons?: ButtonGroup;
  /** Optional styled sub-containers rendered after the block's own content. */
  boxes?: ContainerBox[];
  /** Colour label shown in the sidebar, for visual grouping. */
  colorLabel?: string;
  /** Sidebar-only: collapsed in the section list. */
  collapsed?: boolean;
}

/** Section Type 1 — Hero Section */
export interface HeroSection extends BaseSection {
  type: 'hero';
  title: string;
  subtitle: string;
  showSubtitle: boolean;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
}

/** Section Type 2 — Standard Content Section */
export type BodyType = 'paragraph' | 'bullets' | 'numbered' | 'mixed';

export interface ContentSection extends BaseSection {
  type: 'content';
  icon: string; // icon library key
  heading: string;
  subheading: string;
  bodyType: BodyType;
  paragraph: string;
  items: string[]; // used for bullets / numbered / mixed items
}

/** Section Type 3 — Information Card */
export interface InfoCardSection extends BaseSection {
  type: 'infoCard';
  heading: string;
  text: string;
  borderColor: string;
  backgroundColor: string;
}

/** Section Type 4 — Myth vs Fact Section */
export interface MythFactSection extends BaseSection {
  type: 'mythFact';
  heading: string;
  mythsIntro: string;
  factsIntro: string;
  myths: string[];
  facts: string[];
}

/** Section Type 6 — Image Section */
export type ImageLayout =
  | 'full'
  | 'leftImageRightText'
  | 'rightImageLeftText'
  | 'twoImages'
  | 'grid'
  | 'none';

export interface ImageSection extends BaseSection {
  type: 'image';
  layout: ImageLayout;
  imageId: string | null;
  imageId2: string | null; // for twoImages layout
  gridImageIds: string[]; // for grid layout
  caption: string;
  altText: string;
  borderRadius: number;
  widthPercent: number; // 0-100
  text: string; // accompanying text for left/right layouts
}

/** Section Type 7 — Quote / Insight Section */
export interface QuoteSection extends BaseSection {
  type: 'quote';
  eyebrow: string;
  heading: string;
  description: string;
  backgroundColor: string;
  textColor: string;
}

/** Section Type 8 — CTA Section */
export interface CTASection extends BaseSection {
  type: 'cta';
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  buttonColor: string;
}

/** Section Type 9 — Statistics Section */
export interface Metric {
  id: string;
  number: string;
  label: string;
  show: boolean;
}

export interface StatsSection extends BaseSection {
  type: 'stats';
  heading: string;
  metrics: Metric[]; // only up to 4 with show=true will render
}

/** Section Type 10 — About RERA Easy Section */
export interface AboutSection extends BaseSection {
  type: 'about';
  heading: string;
  description: string;
}

// ============================================================================
// Extended block library
// ----------------------------------------------------------------------------
// These twelve types deliberately cover a much larger set of named components
// through *variants* rather than one type per component. e.g. `listBlock`
// renders Checklist, Timeline, Numbered Steps, Key Takeaways and Feature List;
// `boxGroup` renders Information / Warning / Highlight / Insight / Callout
// cards via ContainerBox kinds. Fewer types, far fewer switch statements, and
// every one of them inherits style + buttons + boxes from BaseSection.
// ============================================================================

/** Text Block + Section Header. */
export interface TextBlockSection extends BaseSection {
  type: 'textBlock';
  eyebrow: string;
  badge: string;
  heading: string;
  headingSize: HeadingSize;
  headingWeight: 'normal' | 'bold';
  subheading: string;
  body: string;
  showDivider: boolean;
}

/** Information / Warning / Highlight / Insight / Callout cards — content in `boxes`. */
export interface BoxGroupSection extends BaseSection {
  type: 'boxGroup';
  heading: string;
  icon: string;
}

export interface ListItem {
  id: string;
  title: string;
  text: string;
}

export type ListStyle = 'checklist' | 'numbered' | 'bullets' | 'timeline' | 'steps' | 'takeaways' | 'features';

/** Checklist / Timeline / Numbered Steps / Key Takeaways / Feature List. */
export interface ListBlockSection extends BaseSection {
  type: 'listBlock';
  heading: string;
  icon: string;
  intro: string;
  listStyle: ListStyle;
  items: ListItem[];
}

export interface ColumnItem {
  id: string;
  icon: string;
  title: string;
  text: string;
  imageId: string | null;
}

/** Two/Three Column Content, Icon Grid, Metric Cards. */
export interface ColumnsSection extends BaseSection {
  type: 'columns';
  heading: string;
  count: 2 | 3;
  columnStyle: 'plain' | 'card' | 'icon' | 'metric' | 'image';
  columns: ColumnItem[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSection extends BaseSection {
  type: 'faq';
  heading: string;
  icon: string;
  items: FaqItem[];
}

export interface ComparisonSection extends BaseSection {
  type: 'comparison';
  heading: string;
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
  leftAccent: string;
  rightAccent: string;
}

export interface TestimonialSection extends BaseSection {
  type: 'testimonial';
  quote: string;
  authorName: string;
  authorRole: string;
  imageId: string | null;
  layout: 'centered' | 'side';
}

export interface LogoStripSection extends BaseSection {
  type: 'logoStrip';
  heading: string;
  imageIds: string[];
  perRow: number;
}

export interface GallerySection extends BaseSection {
  type: 'gallery';
  heading: string;
  imageIds: string[];
  columns: 2 | 3;
  gap: number;
  caption: string;
  borderRadius: number;
}

export interface DividerSection extends BaseSection {
  type: 'divider';
  dividerStyle: 'line' | 'space' | 'dots' | 'label';
  label: string;
  thickness: number;
  color: string;
  height: number;
}

/** Full-width CTA banner — buttons come from the shared ButtonGroup. */
export interface CtaBannerSection extends BaseSection {
  type: 'ctaBanner';
  eyebrow: string;
  heading: string;
  description: string;
  imageId: string | null;
  layout: 'centered' | 'split';
}

export interface ImageBannerSection extends BaseSection {
  type: 'imageBanner';
  imageId: string | null;
  heading: string;
  subheading: string;
  overlay: boolean;
  overlayColor: string;
  textColor: string;
  borderRadius: number;
  textPosition: 'top' | 'center' | 'bottom';
}

export type Section =
  | HeroSection
  | ContentSection
  | InfoCardSection
  | MythFactSection
  | ImageSection
  | QuoteSection
  | CTASection
  | StatsSection
  | AboutSection
  | TextBlockSection
  | BoxGroupSection
  | ListBlockSection
  | ColumnsSection
  | FaqSection
  | ComparisonSection
  | TestimonialSection
  | LogoStripSection
  | GallerySection
  | DividerSection
  | CtaBannerSection
  | ImageBannerSection;

// ============================================================================
// Newsletter (a saved project)
// ============================================================================

export interface Newsletter {
  id: string;
  title: string;
  subtitle: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Images — stored as data URLs so they survive localStorage save/reload
// and can be dropped straight into the exported ZIP.
// ============================================================================

export interface StoredImage {
  id: string;
  originalName: string;
  dataUrl: string;
  extension: string; // "jpg" | "png" | "svg" ...
}

// ============================================================================
// Global company settings — populate header logo + footer across newsletters
// ============================================================================

export interface GlobalSettings {
  companyName: string;
  logoImageId: string | null;
  phones: { label: string; number: string }[];
  email: string;
  offices: { label: string; address: string }[];
  social: { platform: 'whatsapp' | 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'youtube'; url: string }[];
  aboutText: string;
  websiteUrl: string;
  legalText: string;
  /**
   * Brand Asset Manager bindings, keyed by BrandSlotKey. Optional so settings
   * saved before the Asset Manager existed still load; defaultBrandAssets()
   * fills the gap.
   */
  brandAssets?: BrandAssets;
}

// ============================================================================
// Icon library
// ============================================================================

export interface IconDef {
  key: string;
  label: string;
  svg: string; // inner <svg>...</svg> markup, 24x24 viewBox, uses currentColor-free fixed fills
}
