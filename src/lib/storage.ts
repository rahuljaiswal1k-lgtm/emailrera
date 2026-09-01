import { get, set, del, keys } from 'idb-keyval';
import type { GlobalSettings, Newsletter, StoredImage } from '../types/newsletter';
import { defaultBrandAssets } from './brandAssets';
import { createSection } from '../data/sectionDefaults';

const NEWSLETTERS_KEY = 'reraeasy_newsletters_v1';
const GLOBAL_SETTINGS_KEY = 'reraeasy_global_settings_v1';
const IMAGE_PREFIX = 'reraeasy_img_v1_';

// ---------------------------------------------------------------------------
// Newsletters list (metadata + full content) — kept in localStorage since it
// is plain JSON text with no large binary payloads.
// ---------------------------------------------------------------------------

export function loadNewsletters(): Newsletter[] {
  try {
    const raw = localStorage.getItem(NEWSLETTERS_KEY);
    const list = raw ? (JSON.parse(raw) as Newsletter[]) : [];
    return list.map(migrateNewsletter);
  } catch {
    return [];
  }
}

/**
 * Forward-migrate a stored newsletter.
 *
 * 1. Older newsletters have no header / footer section (they used to be
 *    hardcoded); add them so they're editable blocks.
 * 2. An older version of the sanitiser stored some canvas-typed text
 *    already HTML-entity-encoded (`&amp;`, `&nbsp;`, …). Over multiple
 *    edit cycles the encoding could compound (`&amp;amp;`, `&amp;amp;amp;`)
 *    and eventually render as visible entity text in the newsletter.
 *    On load we walk every string in the newsletter and decode those
 *    entities *once and for all* so the stored data becomes clean — no
 *    matter how many layers of encoding piled up.
 */
export function migrateNewsletter(n: Newsletter): Newsletter {
  let sections = n.sections;
  if (!sections.some((s) => s.type === 'header')) {
    sections = [createSection('header'), ...sections];
  }
  if (!sections.some((s) => s.type === 'footer')) {
    sections = [...sections, createSection('footer')];
  }
  const cleaned = { ...n, sections: sections.map(decodeStoredStrings) };
  if (n.title) cleaned.title = collapseEntities(n.title);
  if (n.subtitle) cleaned.subtitle = collapseEntities(n.subtitle);
  return cleaned;
}

/** Recursively walk a section's own string fields and decode piled-up
 *  HTML entities. Non-string values (numbers, booleans, image ids,
 *  arrays of items) pass through unchanged. */
function decodeStoredStrings<T>(node: T): T {
  if (node == null) return node;
  if (typeof node === 'string') return collapseEntities(node) as unknown as T;
  if (Array.isArray(node)) return node.map(decodeStoredStrings) as unknown as T;
  if (typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      // Never touch the htmlOverride blob — it's real HTML that must keep
      // its entities intact.
      out[k] = k === 'htmlOverride' ? v : decodeStoredStrings(v);
    }
    return out as T;
  }
  return node;
}

/** Same collapse loop as rich() uses at render time — kept here so the
 *  migration and the renderer agree on what counts as "already decoded". */
function collapseEntities(s: string): string {
  if (!s || s.indexOf('&') === -1) return s;
  let prev: string;
  let out = s;
  for (let i = 0; i < 5; i++) {
    prev = out;
    out = prev
      .replace(/&nbsp;/g, ' ')
      .replace(/&#160;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
    if (out === prev) break;
  }
  return out;
}

/**
 * Returns false instead of throwing when the browser refuses the write
 * (quota exceeded, storage disabled in private mode, …) so a failed save
 * surfaces in the UI rather than crashing the editor mid-keystroke.
 */
export function saveNewsletters(newsletters: Newsletter[]): boolean {
  try {
    localStorage.setItem(NEWSLETTERS_KEY, JSON.stringify(newsletters));
    return true;
  } catch (err) {
    console.error('Failed to save newsletters to localStorage', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Global company settings
// ---------------------------------------------------------------------------

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  companyName: 'RERA Easy',
  logoImageId: null,
  phones: [
    { label: 'Pune', number: '+91 91364 90809' },
    { label: 'Mumbai', number: '+91 99879 57851' },
  ],
  email: 'info@reraeasy.com',
  offices: [
    {
      label: 'Mumbai Office',
      address: 'Unit 1302/1303/1304, Plutonium Business Park, C Zone, Plot 7 & 7A, Thane-Belapur Rd, MIDC, Turbhe, Navi Mumbai 400703',
    },
    {
      label: 'Pune Office',
      address: 'Office no. B-1001, Yashada Business Zone, Baner Rd, Lalit Estate, Baner, Pune, Maharashtra 411045',
    },
  ],
  social: [
    { platform: 'whatsapp', url: 'https://wa.me/919136490809' },
    { platform: 'instagram', url: 'https://www.instagram.com/reraeasy/' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/company/rera-easy/' },
  ],
  aboutText:
    'RERA Easy is a specialized MahaRERA compliance and regulatory execution partner that helps developers manage project registrations, quarterly compliances, legal documentation, certifications, audits, and ongoing regulatory obligations under one roof. It combines legal and financial expertise to simplify compliance, reduce risk, and ensure smooth project execution for real estate developers across Maharashtra.',
  websiteUrl: 'https://www.reraeasy.com/',
  legalText: '© RERAEasy · For informational purposes only. Not legal advice.',
  brandAssets: defaultBrandAssets(),
};

export function loadGlobalSettings(): GlobalSettings {
  try {
    const raw = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    return raw ? { ...DEFAULT_GLOBAL_SETTINGS, ...(JSON.parse(raw) as GlobalSettings) } : DEFAULT_GLOBAL_SETTINGS;
  } catch {
    return DEFAULT_GLOBAL_SETTINGS;
  }
}

export function saveGlobalSettings(settings: GlobalSettings): boolean {
  try {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Failed to save global settings to localStorage', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Images — stored in IndexedDB (keyed by id) so large data URLs don't blow
// the localStorage quota. Each newsletter/section only stores the image id.
// ---------------------------------------------------------------------------

export async function putImage(image: StoredImage): Promise<void> {
  await set(IMAGE_PREFIX + image.id, image);
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  return get(IMAGE_PREFIX + id);
}

export async function deleteImage(id: string): Promise<void> {
  await del(IMAGE_PREFIX + id);
}

export async function loadAllImages(): Promise<StoredImage[]> {
  const allKeys = await keys();
  const imageKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(IMAGE_PREFIX));
  const images = await Promise.all(imageKeys.map((k) => get(k as string)));
  return images.filter(Boolean) as StoredImage[];
}
