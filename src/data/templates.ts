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
  ImageSection,
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
        createSection('header'),
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
        createSection('footer'),
      ]),
  },
  {
    key: 'mythsVsFacts',
    name: 'Myths vs Facts',
    description: 'Correct common misconceptions on a compliance topic.',
    category: 'Education & Insights',
    build: () =>
      base('Myths vs Facts: What You Need To Know', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },
  {
    key: 'complianceAlert',
    name: 'Compliance Alert',
    description: 'Urgent notice about a new compliance requirement or deadline.',
    category: 'Alerts & Compliance',
    build: () =>
      base('Compliance Alert: Action Required', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },
  {
    key: 'developerAdvisory',
    name: 'Developer Advisory',
    description: 'Practical guidance for developers on a regulatory change.',
    category: 'Alerts & Compliance',
    build: () =>
      base('Developer Advisory', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },
  {
    key: 'educational',
    name: 'Educational Newsletter',
    description: 'Explain a RERA concept end to end for a general audience.',
    category: 'Education & Insights',
    build: () =>
      base('Understanding RERA: A Quick Guide', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },
  {
    key: 'newsUpdate',
    name: 'News Update',
    description: 'Short-form update on recent RERA / industry news.',
    category: 'News & Updates',
    build: () =>
      base('This Week In RERA', '', [
        createSection('header'),
        withOverrides(createSection('hero') as HeroSection, { title: 'This Week In RERA' }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'marketing',
          heading: "WHAT'S NEW",
          bodyType: 'bullets',
        }),
        createSection('image'),
        createSection('cta'),
        createSection('about'),
        createSection('footer'),
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
        createSection('header'),
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
        createSection('footer'),
      ]),
  },

  {
    key: 'monthlyNewsletter',
    name: 'Monthly Newsletter',
    description: 'Full monthly round-up: banner, sections, metrics and highlights.',
    category: 'News & Updates',
    build: () =>
      base('Monthly Round-Up', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },

  {
    key: 'caseStudy',
    name: 'Case Study',
    description: 'Client story with before/after comparison and a testimonial.',
    category: 'Marketing',
    build: () =>
      base('Case Study: How We Helped', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },

  {
    key: 'governmentCircular',
    name: 'Government Circular',
    description: 'Formal circular summary with FAQ and source references.',
    category: 'Legal & Judgments',
    build: () =>
      base('Government Circular Summary', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },

  {
    key: 'projectUpdate',
    name: 'Project Update',
    description: 'Progress update with a timeline and an image gallery.',
    category: 'News & Updates',
    build: () =>
      base('Project Update', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },

  {
    key: 'industryInsights',
    name: 'Industry Insights',
    description: 'Analysis piece with insight callouts and supporting metrics.',
    category: 'Education & Insights',
    build: () =>
      base('Industry Insights', '', [
        createSection('header'),
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
        createSection('footer'),
      ]),
  },

  {
    key: 'qprReminder',
    name: 'QPR Filing Reminder',
    description: 'Deadline nudge for the Quarterly Progress Report — checklist, deadline callout and CTA.',
    category: 'Alerts & Compliance',
    build: () =>
      base('QPR Filing Reminder — Deadline Approaching', '', [
        createSection('header'),
        withOverrides(createSection('hero') as HeroSection, {
          title: 'Your QPR Filing Deadline Is Approaching',
          subtitle: 'A quarterly reminder so your MahaRERA compliance stays on record.',
          showSubtitle: true,
          backgroundColor: '#FFDA4B',
          badge: 'QUARTERLY REMINDER',
        }),
        withOverrides(createSection('paragraph'), {
          body: 'Every registered project must file a Quarterly Progress Report (QPR) on the MahaRERA portal within 15 days of the quarter ending. Missing a filing can attract penalties and, more importantly, dents buyer confidence when they check your project profile.',
        }),
        withOverrides(createSection('boxGroup') as BoxGroupSection, {
          heading: 'THIS QUARTER',
          icon: 'warning',
          boxes: [
            { ...createBox('warning'), title: 'Deadline', text: 'Add the exact date here — e.g. 15 January.' },
            { ...createBox('info'), title: 'Applies to', text: 'All projects registered with MahaRERA whose quarter falls in this window.' },
          ],
        }),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'YOUR FILING CHECKLIST',
          icon: 'legal',
          listStyle: 'checklist',
          items: [
            { id: nanoid(), title: 'Site progress photos + captions', text: 'Latest images that reflect on-ground status.' },
            { id: nanoid(), title: 'Booking, receivables & withdrawal update', text: 'Numbers reconciled with the escrow account.' },
            { id: nanoid(), title: 'Timeline & completion status', text: 'Any change vs. the previously declared date.' },
            { id: nanoid(), title: 'Approvals, permissions & CC/OC', text: 'Fresh copies uploaded to the portal.' },
          ],
        }),
        withOverrides(createSection('cta') as CTASection, {
          heading: 'Need help filing on time?',
          description: 'Our team files QPRs for 6,000+ projects — book a 20-minute call and we will handle the paperwork.',
          buttonText: 'Book a QPR call',
          buttonUrl: 'https://www.reraeasy.com/#contact',
        }),
        createSection('stats'),
        createSection('about'),
        createSection('footer'),
      ]),
  },

  {
    key: 'amendmentAlert',
    name: 'Amendment / Rule Update',
    description: 'Explain a MahaRERA circular or amendment: what changed, who it affects, what to do.',
    category: 'Legal & Judgments',
    build: () =>
      base('MahaRERA Amendment — What You Need To Know', '', [
        createSection('header'),
        withOverrides(createSection('hero') as HeroSection, {
          title: 'MahaRERA Amendment — What You Need To Know',
          subtitle: 'The change, who it affects and the next steps.',
          showSubtitle: true,
          badge: 'AMENDMENT ALERT',
        }),
        withOverrides(createSection('textBlock') as TextBlockSection, {
          badge: 'Circular',
          eyebrow: 'Issued by MahaRERA',
          heading: 'Circular reference · effective date',
          headingSize: 'md',
        }),
        withOverrides(createSection('paragraph'), {
          body: 'Summarise the amendment in one paragraph — what section of the RERA Act it modifies, and the plain-language change. Two or three sentences is ideal; use bullets below if the change has multiple parts.',
        }),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'WHAT CHANGED',
          icon: 'legal',
          listStyle: 'numbered',
          items: [
            { id: nanoid(), title: 'First change', text: 'Before → after, in one line.' },
            { id: nanoid(), title: 'Second change', text: 'Before → after, in one line.' },
            { id: nanoid(), title: 'Third change', text: 'Before → after, in one line.' },
          ],
        }),
        withOverrides(createSection('comparison'), {
          heading: 'BEFORE VS AFTER',
          leftTitle: 'Old rule',
          rightTitle: 'New rule',
        }),
        withOverrides(createSection('boxGroup') as BoxGroupSection, {
          heading: 'WHO THIS AFFECTS',
          icon: 'insight',
          boxes: [
            { ...createBox('info'), title: 'Registered promoters', text: 'What you must do differently now.' },
            { ...createBox('info'), title: 'Real-estate agents', text: 'Any impact on your registrations or renewals.' },
          ],
        }),
        withOverrides(createSection('faq'), {
          heading: 'QUESTIONS WE ARE HEARING',
        }),
        withOverrides(createSection('cta') as CTASection, {
          heading: 'Not sure if this applies to your project?',
          description: 'A short conversation is usually enough to know exactly what needs to change on your side.',
          buttonText: 'Talk to a RERA expert',
        }),
        createSection('about'),
        createSection('footer'),
      ]),
  },

  {
    key: 'buyerGuide',
    name: 'Homebuyer Guide',
    description: 'Consumer-facing MahaRERA explainer — clean prose, myths, checklist and contact.',
    category: 'Education & Insights',
    build: () =>
      base('Buying a Home in Maharashtra — Your MahaRERA Guide', '', [
        createSection('header'),
        withOverrides(createSection('hero') as HeroSection, {
          title: 'Your MahaRERA Guide to Buying a Home',
          subtitle: 'Verify before you sign — a short read for every homebuyer.',
          showSubtitle: true,
          backgroundColor: '#FFDA4B',
        }),
        withOverrides(createSection('paragraph'), {
          body: 'MahaRERA is Maharashtra\'s regulator for real estate. Every project of 500 sqm or above (or with 8+ apartments) must register on the portal, disclose timelines, and file quarterly updates. That means before you pay a token amount, you can look up the project yourself in a few minutes.',
        }),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'BEFORE YOU BOOK — 5 THINGS TO CHECK',
          icon: 'legal',
          listStyle: 'checklist',
          items: [
            { id: nanoid(), title: 'MahaRERA registration number', text: 'Look it up on maharera.mahaonline.gov.in — the project card should open.' },
            { id: nanoid(), title: 'Declared completion date', text: 'Filed by the promoter — this is legally binding.' },
            { id: nanoid(), title: 'Approved plans & permissions', text: 'Copies live in the "Documents" tab of the project.' },
            { id: nanoid(), title: 'Quarterly progress updates', text: 'A consistently updated project shows an active promoter.' },
            { id: nanoid(), title: 'Complaint history', text: 'The portal also lists open complaints against the project.' },
          ],
        }),
        createSection('mythFact'),
        withOverrides(createSection('columns') as ColumnsSection, {
          heading: 'WHY THIS MATTERS',
          count: 3,
          columnStyle: 'metric',
          columns: [
            { id: nanoid(), icon: '', title: '90%', text: 'Of buyers verify RERA before booking', imageId: null },
            { id: nanoid(), icon: '', title: '15 days', text: 'Cooling-off window after allotment', imageId: null },
            { id: nanoid(), icon: '', title: '10%', text: 'Interest promoter must pay for delay', imageId: null },
          ],
        }),
        withOverrides(createSection('cta') as CTASection, {
          heading: 'Need a second opinion on a project?',
          description: 'We look up MahaRERA records, filings and complaint history for you — usually in under 24 hours.',
          buttonText: 'Ask us to check',
          buttonUrl: 'https://www.reraeasy.com/#contact',
        }),
        createSection('about'),
        createSection('footer'),
      ]),
  },

  // -------------------------------------------------------------------------
  // "Sales Catalyst" — the uploaded MahaRERA compliance newsletter, rebuilt
  // as native editable sections so every part is click-to-edit on the canvas
  // (no htmlOverride). Not pixel-identical to the hand-authored HTML, but
  // fully editable and it renders cleanly in Gmail / Outlook / Apple Mail.
  // -------------------------------------------------------------------------
  {
    key: 'salesCatalyst',
    name: 'Sales Catalyst',
    description: 'MahaRERA compliance as your first sales pitch — three pillars, checklist CTA and trust panel.',
    category: 'Marketing',
    build: () =>
      base('The First Sales Pitch Happens On MahaRERA', '', [
        createSection('header'),
        withOverrides(createSection('hero') as HeroSection, {
          title: 'The First Sales Pitch Happens On MahaRERA',
          subtitle: 'Before buyers trust your sales team, they trust your MahaRERA profile.',
          showSubtitle: true,
          backgroundColor: '#FFDA4B',
          badge: 'COMPLIANCE & SALES',
          description:
            'Nearly 90% of buyers check the MahaRERA portal before making a purchase decision. Compliance is your first sales pitch.',
        }),
        withOverrides(createSection('image') as ImageSection, {
          layout: 'full',
          altText: 'A homebuyer verifying project details on the MahaRERA portal before a site visit',
          caption: '',
          borderRadius: 8,
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'document',
          heading: 'PROJECT REGISTRATION & COMPLIANCE',
          bodyType: 'paragraph',
          paragraph:
            'Registering your project on MahaRERA is more than a legal formality — it is the first credibility signal buyers look for.',
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'growth',
          heading: 'CONSISTENT COMPLIANCE UPDATES',
          bodyType: 'paragraph',
          paragraph:
            'Keeping your MahaRERA project updated by submitting mandatory filings, disclosures and project information within the prescribed timelines, so buyers can verify accurate information at any stage of their purchase journey.',
        }),
        withOverrides(createSection('content') as ContentSection, {
          icon: 'legal',
          heading: 'COMPREHENSIVE COMPLIANCE SUPPORT',
          bodyType: 'paragraph',
          paragraph:
            'From project registration to quarterly compliance updates and legal documentation — every filing handled correctly, on time, under one roof.',
        }),
        withOverrides(createSection('boxGroup') as BoxGroupSection, {
          heading: 'THE NUMBERS',
          icon: 'statistics',
          boxes: [
            {
              ...createBox('highlight'),
              title: '90% of buyers',
              text: 'visit the MahaRERA website to verify project details before making a purchase decision.',
            },
          ],
        }),
        withOverrides(createSection('listBlock') as ListBlockSection, {
          heading: 'HOW RERA EASY HELPS',
          icon: 'legal',
          listStyle: 'checklist',
          items: [
            { id: nanoid(), title: 'Project Registration on MahaRERA', text: 'End-to-end filing, corrections and approval tracking.' },
            { id: nanoid(), title: 'Quarterly Compliance Updates', text: 'On-time QPR filings so your project profile stays accurate.' },
            { id: nanoid(), title: 'Ongoing MahaRERA Compliance Management', text: 'A single team for every mandatory disclosure.' },
            { id: nanoid(), title: 'Legal & Documentation Support', text: 'Agreements, notices, orders — reviewed by domain experts.' },
          ],
        }),
        withOverrides(createSection('cta') as CTASection, {
          heading: 'Talk to a RERA Expert',
          description: 'A short conversation is often enough to close the gap between where you are and full compliance.',
          buttonText: 'Talk to a RERA Expert',
          buttonUrl: 'https://www.reraeasy.com/#contact',
          buttonColor: '#FFDA4B',
        }),
        withOverrides(createSection('quote') as QuoteSection, {
          eyebrow: 'RERA EASY INSIGHT',
          heading: '',
          description:
            'Compliance is more than a legal obligation — it is a catalyst for trust and sales. A consistently compliant MahaRERA profile inspires buyer confidence, strengthens credibility, and helps convert interest into bookings.',
          backgroundColor: '#1C1C1C',
          textColor: '#F2F2F2',
        }),
        createSection('stats'),
        createSection('about'),
        createSection('footer'),
      ]),
  },
];

export function blankNewsletter(): Newsletter {
  return base('Untitled Newsletter', '', [
    createSection('header'),
    createSection('hero'),
    createSection('content'),
    createSection('cta'),
    createSection('about'),
    createSection('footer'),
  ]);
}
