// Ships the "Sales Catalyst" newsletter as a Code-mode template.
//
// The source HTML is a hand-authored, table-based email (the file lives next
// to this module as index.html). Its <img> tags reference images/*.png with
// paths relative to the exported zip. To make the same HTML render inside the
// app's preview iframe AND survive a re-export, the src attributes are
// rewritten at load time to absolute URLs served by the app itself
// (public/templates/sales-catalyst/*). Absolute URLs work in both places
// because the recipient's mail client fetches them from the deployed site.
//
// The header logo (images/image1.png in the source) is special-cased: it is
// resolved from the current Global Settings brand assets so the template
// picks up whatever logo the user has already configured, instead of showing
// a generic placeholder.

// eslint-disable-next-line import/no-unresolved
import raw from './index.html?raw';
import { useNewsletterStore } from '../../store/useNewsletterStore';
import { getBinding } from '../../lib/brandAssets';

const BANNER_REWRITES: Record<string, string> = {
  'images/banner.png': 'templates/sales-catalyst/banner.png',
  'images/banner2.png': 'templates/sales-catalyst/banner2.png',
};

function resolveLogoSrc(base: string): string {
  const { images, globalSettings } = useNewsletterStore.getState();
  const binding = getBinding(globalSettings.brandAssets, 'logo');
  if (binding.imageId && images[binding.imageId]?.dataUrl) return images[binding.imageId].dataUrl;
  if (binding.url) return binding.url;
  if (globalSettings.logoImageId && images[globalSettings.logoImageId]?.dataUrl) {
    return images[globalSettings.logoImageId].dataUrl;
  }
  // Fallback to the bundled placeholder that ships with this template.
  return `${base}templates/sales-catalyst/image1.svg`;
}

export function salesCatalystHtml(): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const logoSrc = resolveLogoSrc(base);

  let html = raw;
  // Rewrite every image1 reference (header + anywhere else the source used it)
  // to the resolved global-settings logo.
  html = html.split('src="images/image1.png"').join(`src="${logoSrc}"`);
  // Rewrite the banner images to their app-hosted URLs.
  for (const [from, path] of Object.entries(BANNER_REWRITES)) {
    html = html.split(`src="${from}"`).join(`src="${base}${path}"`);
  }
  return html;
}
