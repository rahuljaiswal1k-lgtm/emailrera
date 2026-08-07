// ============================================================================
// Brand Asset Manager
// ----------------------------------------------------------------------------
// Named slots for the logo and social icons. Each slot resolves in this order:
//
//   1. An image uploaded through the Asset Manager  (goes into the export ZIP)
//   2. An absolute https:// URL                     (best for email clients)
//   3. The bundled inline-SVG fallback              (last resort)
//
// That ordering is what lets someone swap the real RERA Easy logo or official
// social icons in later WITHOUT touching any code — they upload a file or
// paste a URL in Global Settings and every template picks it up.
//
// Why the URL option matters: Gmail and Outlook strip inline <svg> from email
// bodies, so a slot still on its SVG fallback renders as blank space in those
// clients. Uploading a PNG (or pointing at a hosted one) fixes that.
// ============================================================================

export type BrandSlotKey =
  | 'logo'
  | 'whatsapp'
  | 'instagram'
  | 'linkedin'
  | 'facebook'
  | 'twitter'
  | 'youtube';

export interface BrandSlotDef {
  key: BrandSlotKey;
  label: string;
  hint: string;
  kind: 'logo' | 'social';
  /** Rendered width in the email, in px. */
  width: number;
}

export const BRAND_SLOTS: BrandSlotDef[] = [
  { key: 'logo', label: 'Company Logo', hint: 'Shown in the dark header bar and the About block. PNG with transparency works best.', kind: 'logo', width: 120 },
  { key: 'whatsapp', label: 'WhatsApp Icon', hint: 'Footer social row', kind: 'social', width: 22 },
  { key: 'instagram', label: 'Instagram Icon', hint: 'Footer social row', kind: 'social', width: 22 },
  { key: 'linkedin', label: 'LinkedIn Icon', hint: 'Footer social row', kind: 'social', width: 22 },
  { key: 'facebook', label: 'Facebook Icon', hint: 'Footer social row', kind: 'social', width: 22 },
  { key: 'twitter', label: 'Twitter / X Icon', hint: 'Footer social row', kind: 'social', width: 22 },
  { key: 'youtube', label: 'YouTube Icon', hint: 'Footer social row', kind: 'social', width: 22 },
];

export interface BrandAssetBinding {
  /** Id of an image uploaded through the Asset Manager. */
  imageId: string | null;
  /** Absolute https URL. Used when no image is uploaded. */
  url: string;
}

export type BrandAssets = Record<string, BrandAssetBinding>;

export function emptyBinding(): BrandAssetBinding {
  return { imageId: null, url: '' };
}

export function defaultBrandAssets(): BrandAssets {
  const out: BrandAssets = {};
  BRAND_SLOTS.forEach((s) => (out[s.key] = emptyBinding()));
  return out;
}

export function getBinding(assets: BrandAssets | undefined, key: BrandSlotKey): BrandAssetBinding {
  return assets?.[key] ?? emptyBinding();
}

// ---------------------------------------------------------------------------
// Bundled inline-SVG fallbacks (moved here from htmlGenerator so the Asset
// Manager owns every brand mark in one place).
// ---------------------------------------------------------------------------

export const SOCIAL_SVG_FALLBACK: Record<string, string> = {
  whatsapp: `<path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z" fill="#111"/><path d="M8.6 7.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.4.2.5.7 1.7.7 1.8.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.2.4-.2.6-.1.2.1 1.6.7 1.8.9.2.1.4.2.4.3 0 .2 0 .9-.3 1.4-.3.6-1.5 1.1-2.1 1.1-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1 0-1.5.8-2.2 1-2.5z" fill="#fff"/>`,
  instagram: `<rect x="2" y="2" width="20" height="20" rx="5" fill="#111"/><circle cx="12" cy="12" r="4.2" stroke="#fff" stroke-width="1.6" fill="none"/><circle cx="17.3" cy="6.7" r="1.1" fill="#fff"/>`,
  linkedin: `<rect x="2" y="2" width="20" height="20" rx="3" fill="#111"/><rect x="5.5" y="9.5" width="2.6" height="9" fill="#fff"/><circle cx="6.8" cy="6.3" r="1.5" fill="#fff"/><path d="M10.7 9.5h2.5v1.3c.5-.8 1.4-1.5 2.9-1.5 2.1 0 3.4 1.4 3.4 4v5.2h-2.6v-4.7c0-1.2-.5-2-1.6-2-.9 0-1.4.6-1.6 1.2-.1.2-.1.5-.1.8v4.7h-2.6c0-.1 0-8 0-8.9z" fill="#fff"/>`,
  facebook: `<circle cx="12" cy="12" r="10" fill="#111"/><path d="M13.5 21.9v-7.6h2.5l.4-3h-2.9V9.4c0-.9.2-1.5 1.5-1.5h1.6V5.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.5v7.6h2.8z" fill="#fff"/>`,
  twitter: `<circle cx="12" cy="12" r="10" fill="#111"/><path d="M18 8.2c-.4.2-.9.3-1.4.4a2.4 2.4 0 0 0 1.1-1.3 4.8 4.8 0 0 1-1.5.6 2.4 2.4 0 0 0-4.1 2.2 6.8 6.8 0 0 1-5-2.5 2.4 2.4 0 0 0 .8 3.2c-.4 0-.7-.1-1-.3v.1c0 1.2.8 2.1 1.9 2.4-.3.1-.7.1-1 0 .3 1 1.2 1.7 2.3 1.7A4.8 4.8 0 0 1 6 16.1a6.8 6.8 0 0 0 3.7 1.1c4.4 0 6.9-3.7 6.9-6.9v-.3c.5-.3.9-.7 1.2-1.2z" fill="#fff"/>`,
  youtube: `<rect x="2" y="5" width="20" height="14" rx="4" fill="#111"/><path d="M10 9.5l5 2.5-5 2.5z" fill="#fff"/>`,
};

/** True when a slot would fall back to inline SVG (i.e. invisible in Gmail). */
export function isUsingFallback(assets: BrandAssets | undefined, key: BrandSlotKey): boolean {
  const b = getBinding(assets, key);
  return !b.imageId && !b.url;
}
