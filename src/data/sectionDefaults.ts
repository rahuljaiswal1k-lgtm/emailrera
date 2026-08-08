import { nanoid } from '../lib/id';
import type {
  Section,
  SectionType,
  HeroSection,
  ContentSection,
  InfoCardSection,
  MythFactSection,
  ImageSection,
  QuoteSection,
  CTASection,
  StatsSection,
  AboutSection,
  Metric,
  TextBlockSection,
  BoxGroupSection,
  ListBlockSection,
  ColumnsSection,
  FaqSection,
  ComparisonSection,
  TestimonialSection,
  LogoStripSection,
  GallerySection,
  DividerSection,
  CtaBannerSection,
  ImageBannerSection,
  FooterSection,
  HeaderSection,
} from '../types/newsletter';
import { DEFAULT_BLOCK_STYLE, CARD_BLOCK_STYLE, FULL_BLEED_BLOCK_STYLE } from '../lib/blockStyle';
import { RADIUS } from '../lib/designTokens';
import { createButton } from '../lib/blockButtons';
import { createBox } from '../lib/blockBoxes';

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Hero Section',
  content: 'Content Section',
  infoCard: 'Information Card',
  mythFact: 'Myth vs Fact',
  image: 'Image Block',
  quote: 'Quote / Insight',
  cta: 'Call to Action',
  stats: 'Statistics',
  about: 'About RERA Easy',
  textBlock: 'Text / Section Header',
  boxGroup: 'Callout Boxes',
  listBlock: 'List / Steps / Timeline',
  columns: 'Columns & Cards',
  faq: 'FAQ',
  comparison: 'Comparison',
  testimonial: 'Testimonial',
  logoStrip: 'Logo Strip',
  gallery: 'Image Gallery',
  divider: 'Divider / Spacer',
  ctaBanner: 'CTA Banner',
  imageBanner: 'Image Banner',
  footer: 'Footer',
  header: 'Header',
};

export type BlockCategory = 'Basics' | 'Content' | 'Callouts' | 'Media' | 'Data' | 'Conversion' | 'Layout';

export const BLOCK_CATEGORY_ORDER: BlockCategory[] = [
  'Basics',
  'Content',
  'Callouts',
  'Media',
  'Data',
  'Conversion',
  'Layout',
];

export interface BlockCatalogEntry {
  type: SectionType;
  category: BlockCategory;
  description: string;
  /** Extra words matched by the sidebar search box. */
  keywords: string[];
}

/**
 * The single catalogue the Add-Section menu renders from. Several entries
 * intentionally cover multiple named components via their variants — e.g.
 * `listBlock` is Checklist + Timeline + Numbered Steps + Key Takeaways +
 * Feature List, selectable from one dropdown once the block is added.
 */
export const BLOCK_CATALOG: BlockCatalogEntry[] = [
  { type: 'hero', category: 'Basics', description: 'Big title banner at the top', keywords: ['title', 'headline', 'banner'] },
  { type: 'textBlock', category: 'Basics', description: 'Heading, subheading, badge and body copy', keywords: ['section header', 'paragraph', 'title', 'eyebrow', 'badge'] },
  { type: 'divider', category: 'Layout', description: 'Line, dots, labelled rule or plain spacing', keywords: ['separator', 'spacer', 'rule', 'gap'] },

  { type: 'content', category: 'Content', description: 'Icon + heading + paragraph or list', keywords: ['body', 'bullets', 'numbered'] },
  { type: 'listBlock', category: 'Content', description: 'Checklist, timeline, numbered steps, key takeaways or features', keywords: ['checklist', 'timeline', 'steps', 'takeaways', 'features', 'tick'] },
  { type: 'faq', category: 'Content', description: 'Question and answer pairs', keywords: ['question', 'answer', 'q&a'] },
  { type: 'comparison', category: 'Content', description: 'Two columns compared side by side', keywords: ['versus', 'vs', 'before after', 'pros cons'] },
  { type: 'mythFact', category: 'Content', description: 'Common myths vs. correct facts', keywords: ['myth', 'fact', 'misconception'] },

  { type: 'boxGroup', category: 'Callouts', description: 'Information, warning, highlight, callout and insight cards', keywords: ['alert', 'warning', 'info', 'highlight', 'insight', 'note', 'box'] },
  { type: 'infoCard', category: 'Callouts', description: 'Highlighted callout box', keywords: ['note', 'callout'] },
  { type: 'quote', category: 'Callouts', description: 'Dark "insight" callout', keywords: ['insight', 'pull quote'] },
  { type: 'testimonial', category: 'Callouts', description: 'Customer quote with author and photo', keywords: ['review', 'client', 'quote'] },

  { type: 'image', category: 'Media', description: 'Photo, graphic, or image layout', keywords: ['picture', 'photo', 'side by side'] },
  { type: 'imageBanner', category: 'Media', description: 'Wide image with a headline strip', keywords: ['hero image', 'cover', 'banner'] },
  { type: 'gallery', category: 'Media', description: 'Grid of images with an optional caption', keywords: ['grid', 'photos', 'collage'] },
  { type: 'logoStrip', category: 'Media', description: 'Row of partner or client logos', keywords: ['partners', 'clients', 'brands'] },

  { type: 'stats', category: 'Data', description: 'Row of company numbers', keywords: ['metrics', 'numbers', 'kpi'] },
  { type: 'columns', category: 'Data', description: 'Two or three columns — plain, cards, icons, metrics or images', keywords: ['grid', 'icon grid', 'metric cards', 'features', 'three column'] },

  { type: 'cta', category: 'Conversion', description: 'Button that drives an action', keywords: ['call to action', 'button'] },
  { type: 'ctaBanner', category: 'Conversion', description: 'Full-width conversion banner with buttons', keywords: ['call to action', 'banner', 'promo'] },

  { type: 'about', category: 'Layout', description: 'About RERA Easy + contact box', keywords: ['contact', 'company', 'brand'] },
  { type: 'header', category: 'Layout', description: 'Top logo bar with optional brand text and tagline', keywords: ['header', 'logo', 'brand', 'top', 'masthead'] },
  { type: 'footer', category: 'Layout', description: 'Offices, social row, legal line and unsubscribe', keywords: ['footer', 'address', 'office', 'social', 'legal', 'unsubscribe', 'copyright'] },
];

/** Kept for backwards compatibility with anything importing the flat order. */
export const SECTION_ORDER: SectionType[] = BLOCK_CATALOG.map((b) => b.type);

function makeMetric(number: string, label: string): Metric {
  return { id: nanoid(), number, label, show: true };
}

export function createSection(type: SectionType): Section {
  const id = nanoid();
  switch (type) {
    case 'hero':
      return {
        id,
        type,
        visible: true,
        style: { ...FULL_BLEED_BLOCK_STYLE },
        title: 'Your Newsletter Headline Goes Here',
        subtitle: '',
        showSubtitle: false,
        backgroundColor: '#FFDA4B',
        textAlign: 'center',
        badge: '',
        noticeText: '',
        heroLayout: 'classic',
        description: '',
        headingColor: '',
        textColorOverride: '',
        stripColor: '',
        stripTextColor: '',
        showTopStrip: false,
        topStripText: '',
        topStripColor: '#101010',
        topStripTextColor: '#FFFFFF',
        showBottomStrip: false,
        bottomStripText: '',
        bottomStripColor: '#101010',
        bottomStripTextColor: '#FFFFFF',
        showLogo: false,
        logoWidth: 120,
        imageId: null,
        showDivider: false,
        ctaText: '',
        ctaUrl: '',
        secondaryCtaText: '',
        secondaryCtaUrl: '',
        heroPadding: 34,
        borderRadius: RADIUS.lg,
      } satisfies HeroSection;

    case 'content':
      return {
        id,
        type,
        visible: true,
        icon: 'document',
        heading: 'SECTION HEADING',
        subheading: '',
        bodyType: 'bullets',
        paragraph: 'Write your paragraph content here.',
        items: ['First point goes here.', 'Second point goes here.'],
      } satisfies ContentSection;

    case 'infoCard':
      return {
        id,
        type,
        visible: true,
        heading: 'Why This Matters',
        text: 'Explain the important detail readers should know.',
        borderColor: '#FFDA4B',
        backgroundColor: '#F3F4F6',
      } satisfies InfoCardSection;

    case 'mythFact':
      return {
        id,
        type,
        visible: true,
        heading: 'COMMON MISUNDERSTANDINGS',
        mythsIntro: 'Many still believe that:',
        factsIntro: 'However, the facts are:',
        myths: ['A common misconception goes here.'],
        facts: ['The correct fact goes here.'],
      } satisfies MythFactSection;

    case 'image':
      return {
        id,
        type,
        visible: true,
        layout: 'full',
        imageId: null,
        imageId2: null,
        gridImageIds: [],
        caption: '',
        altText: '',
        borderRadius: 12,
        widthPercent: 100,
        text: '',
      } satisfies ImageSection;

    case 'quote':
      return {
        id,
        type,
        visible: true,
        eyebrow: 'RERA EASY INSIGHT',
        heading: '',
        description: 'Share a short insight or perspective here.',
        backgroundColor: '#1C1C1C',
        textColor: '#F2F2F2',
      } satisfies QuoteSection;

    case 'cta':
      return {
        id,
        type,
        visible: true,
        heading: 'Need Help With Compliance?',
        description: 'Our team can help ensure your project meets all requirements.',
        buttonText: 'Contact Us',
        buttonUrl: 'https://www.reraeasy.com/#contact',
        buttonColor: '#FFDA4B',
      } satisfies CTASection;

    case 'stats':
      return {
        id,
        type,
        visible: true,
        heading: 'WHY DEVELOPERS CHOOSE RERA EASY',
        metrics: [
          makeMetric('7,000+', 'Clients Served'),
          makeMetric('6,000+', 'Projects Registered'),
          makeMetric('12%~', 'Market Presence'),
          makeMetric('150+', 'Professionals'),
        ],
      } satisfies StatsSection;

    case 'about':
      return {
        id,
        type,
        visible: true,
        style: { ...CARD_BLOCK_STYLE, theme: 'dark', variant: 'filled', borderRadius: RADIUS.md },
        heading: 'ABOUT',
        description:
          'RERA Easy is a specialized MahaRERA compliance and regulatory execution partner that helps developers manage project registrations, quarterly compliances, legal documentation, certifications, audits, and ongoing regulatory obligations under one roof.',
        showLogo: true,
        logoWidth: 96,
        showDivider: true,
        showContact: true,
        contactLabel: 'CONTACT',
        showPhones: true,
        showEmail: true,
        showCta: false,
        ctaText: 'Call Now',
        ctaUrl: 'tel:+919136490809',
      } satisfies AboutSection;

    // ---------------------------------------------------------------------
    // Extended block library. These ship with a real BlockStyle so they look
    // designed out of the box, while the nine originals keep `style`
    // undefined and therefore render exactly as before.
    // ---------------------------------------------------------------------

    case 'textBlock':
      return {
        id,
        type,
        visible: true,
        style: { ...DEFAULT_BLOCK_STYLE },
        eyebrow: '',
        badge: '',
        heading: 'Section Heading',
        headingSize: 'lg',
        headingWeight: 'bold',
        subheading: '',
        body: 'Write the supporting paragraph for this section here.',
        showDivider: true,
      } satisfies TextBlockSection;

    case 'boxGroup':
      return {
        id,
        type,
        visible: true,
        style: { ...CARD_BLOCK_STYLE },
        heading: 'IMPORTANT TO NOTE',
        icon: 'warning',
        boxes: [createBox('info'), createBox('warning')],
      } satisfies BoxGroupSection;

    case 'listBlock':
      return {
        id,
        type,
        visible: true,
        style: { ...CARD_BLOCK_STYLE },
        heading: 'WHAT YOU NEED TO DO',
        icon: 'document',
        intro: '',
        listStyle: 'checklist',
        items: [
          { id: nanoid(), title: 'First action', text: 'Explain what needs to happen.' },
          { id: nanoid(), title: 'Second action', text: 'Explain what needs to happen.' },
        ],
      } satisfies ListBlockSection;

    case 'columns':
      return {
        id,
        type,
        visible: true,
        style: { ...DEFAULT_BLOCK_STYLE },
        heading: 'HOW WE HELP',
        count: 3,
        columnStyle: 'card',
        columns: [
          { id: nanoid(), icon: 'document', title: 'Registration', text: 'Short supporting line.', imageId: null },
          { id: nanoid(), icon: 'legal', title: 'Compliance', text: 'Short supporting line.', imageId: null },
          { id: nanoid(), icon: 'growth', title: 'Advisory', text: 'Short supporting line.', imageId: null },
        ],
      } satisfies ColumnsSection;

    case 'faq':
      return {
        id,
        type,
        visible: true,
        style: { ...CARD_BLOCK_STYLE },
        heading: 'FREQUENTLY ASKED',
        icon: 'insight',
        items: [
          { id: nanoid(), question: 'First common question?', answer: 'The answer goes here.' },
          { id: nanoid(), question: 'Second common question?', answer: 'The answer goes here.' },
        ],
      } satisfies FaqSection;

    case 'comparison':
      return {
        id,
        type,
        visible: true,
        style: { ...DEFAULT_BLOCK_STYLE },
        heading: 'BEFORE VS AFTER',
        leftTitle: 'Before',
        rightTitle: 'After',
        leftItems: ['What the old position was.'],
        rightItems: ['What the new position is.'],
        leftAccent: '#E14B4B',
        rightAccent: '#2E9E4E',
      } satisfies ComparisonSection;

    case 'testimonial':
      return {
        id,
        type,
        visible: true,
        style: { ...CARD_BLOCK_STYLE, theme: 'gray', variant: 'filled' },
        quote: 'Share what a client said about working with your team.',
        authorName: 'Client Name',
        authorRole: 'Designation, Company',
        imageId: null,
        layout: 'centered',
      } satisfies TestimonialSection;

    case 'logoStrip':
      return {
        id,
        type,
        visible: true,
        style: { ...DEFAULT_BLOCK_STYLE },
        heading: 'TRUSTED BY',
        imageIds: [],
        perRow: 4,
      } satisfies LogoStripSection;

    case 'gallery':
      return {
        id,
        type,
        visible: true,
        style: { ...DEFAULT_BLOCK_STYLE },
        heading: '',
        imageIds: [],
        columns: 2,
        gap: 6,
        caption: '',
        borderRadius: 12,
      } satisfies GallerySection;

    case 'divider':
      return {
        id,
        type,
        visible: true,
        style: { ...DEFAULT_BLOCK_STYLE, spacingBottom: 10 },
        dividerStyle: 'line',
        label: '',
        thickness: 1,
        color: '#E3E6EC',
        height: 24,
      } satisfies DividerSection;

    case 'ctaBanner':
      return {
        id,
        type,
        visible: true,
        style: { ...CARD_BLOCK_STYLE, theme: 'dark', variant: 'filled', borderRadius: 16 },
        buttons: {
          enabled: true,
          align: 'center',
          layout: 'inline',
          buttons: [createButton({ variant: 'primary', size: 'lg' })],
        },
        eyebrow: 'GET IN TOUCH',
        heading: 'Need help with compliance?',
        description: 'Our team can review how this applies to your project.',
        imageId: null,
        layout: 'centered',
      } satisfies CtaBannerSection;

    case 'imageBanner':
      return {
        id,
        type,
        visible: true,
        style: { ...DEFAULT_BLOCK_STYLE },
        imageId: null,
        heading: 'Banner headline',
        subheading: '',
        overlay: true,
        overlayColor: '#1D1F1F',
        textColor: '#FFFFFF',
        borderRadius: 14,
        textPosition: 'bottom',
      } satisfies ImageBannerSection;

    case 'footer':
      return {
        id,
        type,
        visible: true,
        style: {
          ...CARD_BLOCK_STYLE,
          theme: 'yellow',
          variant: 'filled',
          borderRadius: 0,
          padding: 28,
          spacingTop: 0,
          spacingBottom: 0,
          fullBleed: true,
        },
        showOffices: true,
        showSocial: true,
        socialLabel: 'FIND US ON',
        showLegal: true,
        disclaimer: '',
        showUnsubscribe: true,
        unsubscribeText: 'Unsubscribe',
        unsubscribeUrl: '#',
        showWebsite: false,
        showEmail: false,
        showPhone: false,
      } satisfies FooterSection;

    case 'header':
      return {
        id,
        type,
        visible: true,
        style: {
          ...CARD_BLOCK_STYLE,
          theme: 'dark',
          variant: 'filled',
          borderRadius: 0,
          padding: 18,
          spacingTop: 0,
          spacingBottom: 0,
          fullBleed: true,
          align: 'center',
        },
        showLogo: true,
        logoWidth: 120,
        showBrandText: true,
        brandText: 'RERA Easy',
        showTagline: false,
        tagline: '',
        backgroundColor: '',
      } satisfies HeaderSection;
  }
}
