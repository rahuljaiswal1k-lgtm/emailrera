// jszip is dynamic-imported so it stays out of the initial bundle.
import { nanoid } from './id';
import type { Newsletter, StoredImage } from '../types/newsletter';

export interface ImportResult {
  newsletter: Newsletter;
  images: StoredImage[];
}

export async function importNewsletterZip(file: File): Promise<ImportResult> {
  const [{ default: JSZip }, buffer] = await Promise.all([
    import('jszip'),
    file.arrayBuffer(),
  ]);
  const zip = await JSZip.loadAsync(buffer);
  const dataFile = zip.file('data.json');
  if (!dataFile) {
    throw new Error(
      'This ZIP has no data.json, so it was not exported from this builder (or the metadata was removed). Only newsletters exported from this tool can be re-imported with full editability.'
    );
  }
  const raw = await dataFile.async('string');
  const meta = JSON.parse(raw) as { newsletter: Newsletter; images: StoredImage[] };

  // Re-mint every id so importing the same file twice never collides with
  // an already-open newsletter or its images.
  const idMap: Record<string, string> = {};
  const newImages: StoredImage[] = meta.images.map((img) => {
    const newId = nanoid();
    idMap[img.id] = newId;
    return { ...img, id: newId };
  });

  const remapImageId = (id: string | null) => (id && idMap[id] ? idMap[id] : id);

  const newNewsletter: Newsletter = {
    ...meta.newsletter,
    id: nanoid(),
    title: meta.newsletter.title,
    updatedAt: Date.now(),
    sections: meta.newsletter.sections.map((s) => {
      const section = { ...s, id: nanoid() };
      if (section.type === 'image') {
        section.imageId = remapImageId(section.imageId);
        section.imageId2 = remapImageId(section.imageId2);
        section.gridImageIds = section.gridImageIds.map((id) => idMap[id] ?? id);
      }
      return section;
    }),
  };

  return { newsletter: newNewsletter, images: newImages };
}
