// Ships the "Sales Catalyst" newsletter as a Code-mode template.
//
// The source HTML is a hand-authored, table-based email (the file lives next
// to this module as index.html). Its <img> tags reference images/*.png with
// paths relative to the exported zip. To make the same HTML render inside the
// app's preview iframe AND survive a re-export, the src attributes are
// rewritten at load time to absolute URLs served by the app itself
// (public/templates/sales-catalyst/*). Absolute URLs work in both places
// because the recipient's mail client fetches them from the deployed site.

// The Vite `?raw` import inlines the HTML into the bundle at build time.
// eslint-disable-next-line import/no-unresolved
import raw from './index.html?raw';

const ORIG = ['images/image1.png', 'images/banner.png', 'images/banner2.png'] as const;
const REWRITES: Record<string, string> = {
  'images/image1.png': 'templates/sales-catalyst/image1.svg',
  'images/banner.png': 'templates/sales-catalyst/banner.png',
  'images/banner2.png': 'templates/sales-catalyst/banner2.png',
};

export function salesCatalystHtml(): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  let html = raw;
  for (const from of ORIG) {
    const to = base + REWRITES[from];
    html = html.split(`src="${from}"`).join(`src="${to}"`);
  }
  return html;
}
