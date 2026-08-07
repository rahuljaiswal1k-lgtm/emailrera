import { nanoid } from '../lib/id';
import { createSection } from './sectionDefaults';
import type { Newsletter, Section, ContentSection, HeroSection, MythFactSection, CTASection, QuoteSection } from '../types/newsletter';

export interface NewsletterTemplate {
  key: string;
  name: string;
  description: string;
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
];

export function blankNewsletter(): Newsletter {
  return base('Untitled Newsletter', '', [
    createSection('hero'),
    createSection('content'),
    createSection('cta'),
    createSection('about'),
  ]);
}
