// ============================================================================
// Core data model for the RERA Easy Newsletter Builder
// Mirrors the "Data Structure" section of the requirements doc, extended
// with every field each section type needs.
// ============================================================================

export type SectionType =
  | 'hero'
  | 'content'
  | 'infoCard'
  | 'mythFact'
  | 'image'
  | 'quote'
  | 'cta'
  | 'stats'
  | 'about';

export interface BaseSection {
  id: string;
  type: SectionType;
  visible: boolean;
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

export type Section =
  | HeroSection
  | ContentSection
  | InfoCardSection
  | MythFactSection
  | ImageSection
  | QuoteSection
  | CTASection
  | StatsSection
  | AboutSection;

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
}

// ============================================================================
// Icon library
// ============================================================================

export interface IconDef {
  key: string;
  label: string;
  svg: string; // inner <svg>...</svg> markup, 24x24 viewBox, uses currentColor-free fixed fills
}
