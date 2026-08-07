import { nanoid } from '../lib/id';
import { createSection } from './sectionDefaults';
import { createBox } from '../lib/blockBoxes';
import type {
  Newsletter,
  Section,
  ContentSection,
  HeroSection,
  MythFactSection,
  CTASection,
  QuoteSection,
  TextBlockSection,
  BoxGroupSection,
  ListBlockSection,
  ColumnsSection,
  DividerSection,
} from '../types/newsletter';

export type TemplateCategory =
  | 'Alerts & Compliance'
  | 'Legal & Judgments'
  | 'Education & Insights'
  | 'News & Updates'
  | 'Marketing';

export const TEMPLATE_CATEGORY_ORDER: TemplateCategory[] = [
  'Alerts & Compliance',
  'Legal & Judgments',
  'Education & Insights',
  'News & Updates',
  'Marketing',
];

export interface NewsletterTemplate {
  key: string;
  name: string;
  description: string;
  category: TemplateCategory;
  build: () => Newsletter;
}

function withOverrides<T extends Section>(section: T, overrides: Partial<T>): T {
  return { ...section, ...overrides };
}

function base(title: string, subtitle: string, sections: Section[]): Newsletter {
  const now = Date.now();
  return { id: nanoid(), title, subtitle, sections, createdAt: now, updatedAt: now };
}

export const TEMPLATES: NewsletterTemplate[] = [
  {
    key: 'judgment',
    name: 'Judgment Newsletter',
    description: 'Break down a MahaRERA order or tribunal judgment for developers.',
    category: 'Legal & Judgments',
    build: () =>
      base('New MahaRERA Order: What Developers Need To Know', '', [
        withOverrides(createSection('hero') as HeroSection, {
          title: 'New MahaRERA Order: What Developers Need To Know',
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'document',
          heading: 'INTRODUCTION',
          bodyType: 'bullets',
          items: [
            'Summarize the order number, date, and the section of the RERA Act it was issued under.',
            'Explain what prompted the Authority to issue this order.',
          ],
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'legal',
          heading: 'KEY DIRECTIONS IN THE ORDER',
          bodyType: 'numbered',
          items: [
            'First direction issued by the Authority.',
            'Second direction issued by the Authority.',
          ],
        }),
        createSection('quote') as QuoteSection,
        withOverrides(createSection('cta') as CTASection, {
          heading: 'Need Help Interpreting This Order?',
          description: 'Our compliance team can review how this applies to your project.',
        }),
        createSection('stats'),
        createSection('about'),
      ]),
  },
  {
    key: 'mythsVsFacts',
    name: 'Myths vs Facts',
    description: 'Correct common misconceptions on a compliance topic.',
    category: 'Education & Insights',
    build: () =>
      base('Myths vs Facts: What You Need To Know', '', [
        withOverrides(createSection('hero') as HeroSection, {
          title: 'Myths vs Facts: What You Need To Know',
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'document',
          heading: 'INTRODUCTION',
          bodyType: 'paragraph',
          paragraph: 'Set up the topic and why the misconceptions below matter.',
        }),
        createSection('mythFact') as MythFactSection,
        createSection('cta'),
        createSection('about'),
      ]),
  },
  {
    key: 'complianceAlert',
    name: 'Compliance Alert',
    description: 'Urgent notice about a new compliance requirement or deadline.',
    category: 'Alerts & Compliance',
    build: () =>
      base('Compliance Alert: Action Required', '', [
        withOverrides(createSection('hero') as HeroSection, {
          title: 'Compliance Alert: Action Required',
          backgroundColor: '#FFDA4B',
        }),
        withOverrides(createSection('infoCard'), {
          heading: 'Deadline Approaching',
          text: 'State the deadline and what happens if it is missed.',
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'warning',
          heading: 'WHAT YOU NEED TO DO',
          bodyType: 'numbered',
          items: ['First required action.', 'Second required action.'],
        }),
        withOverrides(createSection('cta') as CTASection, {
          heading: 'Avoid Penalties — Talk To Us Today',
        }),
        createSection('about'),
      ]),
  },
  {
    key: 'developerAdvisory',
    name: 'Developer Advisory',
    description: 'Practical guidance for developers on a regulatory change.',
    category: 'Alerts & Compliance',
    build: () =>
      base('Developer Advisory', '', [
        createSection('hero'),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'construction',
          heading: 'WHAT HAS CHANGED',
          bodyType: 'bullets',
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'growth',
          heading: 'WHAT THIS MEANS FOR YOUR PROJECT',
          bodyType: 'paragraph',
        }),
        createSection('image'),
        createSection('cta'),
        createSection('stats'),
        createSection('about'),
      ]),
  },
  {
    key: 'educational',
    name: 'Educational Newsletter',
    description: 'Explain a RERA concept end to end for a general audience.',
    category: 'Education & Insights',
    build: () =>
      base('Understanding RERA: A Quick Guide', '', [
        createSection('hero'),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'document',
          heading: 'WHAT IS THIS ABOUT?',
          bodyType: 'paragraph',
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'insight',
          heading: 'KEY TAKEAWAYS',
          bodyType: 'bullets',
        }),
        createSection('quote'),
        createSection('cta'),
        createSection('about'),
      ]),
  },
  {
    key: 'newsUpdate',
    name: 'News Update',
    description: 'Short-form update on recent RERA / industry news.',
    category: 'News & Updates',
    build: () =>
      base('This Week In RERA', '', [
        withOverrides(createSection('hero') as HeroSection, { title: 'This Week In RERA' }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'marketing',
          heading: "WHAT'S NEW",
          bodyType: 'bullets',
        }),
        createSection('image'),
        createSection('cta'),
        createSection('about'),
      ]),
  },

  // -------------------------------------------------------------------------
  // Templates built on the extended block library. A template is nothing more
  // than a chosen combination of blocks plus overrides, so adding another is
  // a single entry in this array — no other file changes.
  // -------------------------------------------------------------------------

  {
    key: 'regulatoryAlert',
    name: 'Regulatory Alert',
    description: 'High-urgency alert with callout boxes and an action checklist.',
    category: 'Alerts & Compliance',
    build: () =>
      base('Regulatory Alert: Immediate Action Required', '', [
        withOverrides(createSection('hero') as HeroSection, {
          title: 'Regulatory Alert',
          subtitle: 'Immediate action required for affected projects',
          showSubtitle: true,
          backgroundColor: '#FFDA4B',
        }),
        withOverrides(createSection('boxGroup') as BoxGroupSection, {
          heading: 'WHAT HAS CHANGED',
          icon: 'warning',
          boxes: [
            { ...createBox('warning'), title: 'Deadline', text: 'State the date and the consequence of missing it.' },
            { ...createBox('info'), title: 'Who this affects', text: 'Describe which projects or registrations are covered.' },
          ],
        }),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'YOUR ACTION CHECKLIST',
          icon: 'legal',
          listStyle: 'checklist',
        }),
        createSection('ctaBanner'),
        createSection('about'),
      ]),
  },

  {
    key: 'monthlyNewsletter',
    name: 'Monthly Newsletter',
    description: 'Full monthly round-up: banner, sections, metrics and highlights.',
    category: 'News & Updates',
    build: () =>
      base('Monthly Round-Up', '', [
        createSection('imageBanner'),
        withOverrides(createSection('textBlock') as TextBlockSection, {
          eyebrow: 'In this issue',
          heading: "What's inside this month",
          headingSize: 'lg',
        }),
        withOverrides(createSection('divider') as DividerSection, { dividerStyle: 'label', label: 'HIGHLIGHTS' }),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'KEY UPDATES',
          listStyle: 'takeaways',
        }),
        withOverrides(createSection('columns') as ColumnsSection, {
          columnStyle: 'metric',
          count: 3,
          heading: 'BY THE NUMBERS',
          // For metric cards `title` is the big number and `text` is its label.
          columns: [
            { id: nanoid(), icon: '', title: '7,000+', text: 'Clients Served', imageId: null },
            { id: nanoid(), icon: '', title: '6,000+', text: 'Projects Registered', imageId: null },
            { id: nanoid(), icon: '', title: '150+', text: 'Professionals', imageId: null },
          ],
        }),
        createSection('quote'),
        createSection('ctaBanner'),
        createSection('about'),
      ]),
  },

  {
    key: 'caseStudy',
    name: 'Case Study',
    description: 'Client story with before/after comparison and a testimonial.',
    category: 'Marketing',
    build: () =>
      base('Case Study: How We Helped', '', [
        withOverrides(createSection('hero') as HeroSection, { title: 'Case Study: How We Helped' }),
        withOverrides(createSection('textBlock') as TextBlockSection, {
          eyebrow: 'The challenge',
          heading: 'What the client was facing',
        }),
        createSection('comparison'),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'WHAT WE DID',
          listStyle: 'steps',
        }),
        createSection('testimonial'),
        createSection('ctaBanner'),
        createSection('about'),
      ]),
  },

  {
    key: 'governmentCircular',
    name: 'Government Circular',
    description: 'Formal circular summary with FAQ and source references.',
    category: 'Legal & Judgments',
    build: () =>
      base('Government Circular Summary', '', [
        withOverrides(createSection('hero') as HeroSection, {
          title: 'Government Circular Summary',
          backgroundColor: '#1D1F1F',
        }),
        withOverrides(createSection('textBlock') as TextBlockSection, {
          badge: 'Circular',
          eyebrow: 'Issued by',
          heading: 'Circular reference and date',
          headingSize: 'md',
        }),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'KEY PROVISIONS',
          icon: 'legal',
          listStyle: 'numbered',
        }),
        createSection('faq'),
        createSection('cta'),
        createSection('about'),
      ]),
  },

  {
    key: 'projectUpdate',
    name: 'Project Update',
    description: 'Progress update with a timeline and an image gallery.',
    category: 'News & Updates',
    build: () =>
      base('Project Update', '', [
        withOverrides(createSection('hero') as HeroSection, { title: 'Project Update' }),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'PROGRESS TIMELINE',
          icon: 'construction',
          listStyle: 'timeline',
        }),
        createSection('gallery'),
        withOverrides(createSection('columns') as ColumnsSection, { columnStyle: 'card', count: 2, heading: 'WHAT COMES NEXT' }),
        createSection('ctaBanner'),
        createSection('about'),
      ]),
  },

  {
    key: 'industryInsights',
    name: 'Industry Insights',
    description: 'Analysis piece with insight callouts and supporting metrics.',
    category: 'Education & Insights',
    build: () =>
      base('Industry Insights', '', [
        withOverrides(createSection('hero') as HeroSection, { title: 'Industry Insights' }),
        withOverrides(createSection('textBlock') as TextBlockSection, {
          eyebrow: 'Analysis',
          heading: 'What the latest data tells us',
        }),
        withOverrides(createSection('boxGroup') as BoxGroupSection, {
          heading: 'KEY INSIGHT',
          icon: 'insight',
          boxes: [{ ...createBox('highlight'), title: 'The headline finding', text: 'Summarise the single most important point.' }],
        }),
        withOverrides(createSection('columns') as ColumnsSection, { columnStyle: 'icon', count: 3, heading: 'WHAT THIS MEANS' }),
        createSection('quote'),
        createSection('cta'),
        createSection('about'),
      ]),
  },
];

export function blankNewsletter(): Newsletter {
  return base('Untitled Newsletter', '', [
    createSection('hero'),
    createSection('content'),
    createSection('cta'),
    createSection('about'),
  ]);
}
