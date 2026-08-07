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
} from '../types/newsletter';

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
};

export const SECTION_ORDER: SectionType[] = [
  'hero',
  'content',
  'infoCard',
  'mythFact',
  'image',
  'quote',
  'cta',
  'stats',
  'about',
];

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
        title: 'Your Newsletter Headline Goes Here',
        subtitle: '',
        showSubtitle: false,
        backgroundColor: '#FFDA4B',
        textAlign: 'center',
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
        heading: 'ABOUT',
        description:
          'RERA Easy is a specialized MahaRERA compliance and regulatory execution partner that helps developers manage project registrations, quarterly compliances, legal documentation, certifications, audits, and ongoing regulatory obligations under one roof.',
      } satisfies AboutSection;
  }
}
