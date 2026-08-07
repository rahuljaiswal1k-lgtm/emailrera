import { get, set, del, keys } from 'idb-keyval';
import type { GlobalSettings, Newsletter, StoredImage } from '../types/newsletter';
import { defaultBrandAssets } from './brandAssets';

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
    return raw ? (JSON.parse(raw) as Newsletter[]) : [];
  } catch {
    return [];
  }
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
