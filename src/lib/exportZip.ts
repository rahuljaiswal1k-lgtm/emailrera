import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { GlobalSettings, Newsletter, StoredImage } from '../types/newsletter';
import { generateHTML, exportResolver, collectImageIds } from './htmlGenerator';

function slugify(str: string): string {
  return (
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'newsletter'
  );
}

function dataUrlToBase64(dataUrl: string): string | null {
  const comma = dataUrl.indexOf(',');
  if (comma === -1) return null;
  return dataUrl.slice(comma + 1) || null;
}

export async function exportNewsletterZip(
  newsletter: Newsletter,
  settings: GlobalSettings,
  images: Record<string, StoredImage>
): Promise<void> {
  const zip = new JSZip();

  // Build a stable id -> filename map (image1.jpg, image2.png, ...) — this also
  // covers the logo, which is exported as image1 if present. Ids that have no
  // stored image are skipped entirely: the generator then renders an inline
  // "No image selected" placeholder instead of pointing at a missing file.
  const orderedIds = collectImageIds(newsletter, settings);
  const filenameMap: Record<string, string> = {};
  const files: { name: string; base64: string }[] = [];
  orderedIds.forEach((id, i) => {
    const image = images[id];
    if (!image) return;
    const base64 = dataUrlToBase64(image.dataUrl);
    if (!base64) return;
    const filename = `image${i + 1}.${image.extension || 'jpg'}`;
    filenameMap[id] = filename;
    files.push({ name: filename, base64 });
  });

  if (files.length > 0) {
    const imagesFolder = zip.folder('images')!;
    files.forEach((f) => imagesFolder.file(f.name, f.base64, { base64: true }));
  }

  // Code-mode override ships verbatim; otherwise render from the sections.
  const html = newsletter.htmlOverride ?? generateHTML(newsletter, settings, exportResolver(filenameMap));
  zip.file('index.html', html);

  // Embed a hidden metadata file so this exact newsletter.zip can be re-imported
  // later with every field intact (Module 9 — Import Existing Newsletter).
  const perNewsletterImages = orderedIds
    .filter((id) => id !== settings.logoImageId)
    .map((id) => images[id])
    .filter(Boolean);

  const meta = {
    formatVersion: 1,
    newsletter,
    images: perNewsletterImages,
  };
  zip.file('data.json', JSON.stringify(meta));

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${slugify(newsletter.title)}.zip`);
}
