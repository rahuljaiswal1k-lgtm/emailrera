import { AlertTriangle } from 'lucide-react';
import { useNewsletterStore } from '../../store/useNewsletterStore';
import { BRAND_SLOTS, defaultBrandAssets, isUsingFallback, type BrandSlotKey, type BrandAssetBinding } from '../../lib/brandAssets';
import { FieldGroup, TextField } from '../shared/FormFields';
import { ImagePicker } from '../shared/ImagePicker';

/**
 * Brand Asset Manager.
 *
 * Named slots for the logo and each social icon. Uploading a file or pasting a
 * URL here replaces the bundled placeholder everywhere — in the live preview,
 * in the exported HTML, and in every template — with no code change.
 */
export function AssetManager() {
  const settings = useNewsletterStore((s) => s.globalSettings);
  const update = useNewsletterStore((s) => s.updateGlobalSettings);

  const assets = settings.brandAssets ?? defaultBrandAssets();

  const setBinding = (key: BrandSlotKey, partial: Partial<BrandAssetBinding>) =>
    update({
      brandAssets: {
        ...assets,
        [key]: { ...(assets[key] ?? { imageId: null, url: '' }), ...partial },
      },
    });

  const fallbackCount = BRAND_SLOTS.filter((s) => isUsingFallback(assets, s.key)).length;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-sm font-bold text-gray-900 mb-1">Brand Assets</h2>
      <p className="text-xs text-gray-400 mb-4">
        The logo and social icons used across every newsletter. Upload a file, or point at a hosted
        image URL. Uploaded images are bundled into the exported ZIP automatically.
      </p>

      {fallbackCount > 0 && (
        <div className="flex gap-2 items-start rounded-xl border border-amber-200 bg-amber-50 p-3 mb-5">
          <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-amber-800 leading-relaxed">
            <b>{fallbackCount} slot{fallbackCount === 1 ? '' : 's'} still using built-in placeholders.</b> Those
            fall back to inline SVG, which Gmail and Outlook strip from emails — they will show as blank
            space. Upload a PNG or paste a hosted URL to fix it.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {BRAND_SLOTS.map((slot) => {
          const binding = assets[slot.key] ?? { imageId: null, url: '' };
          const fallback = isUsingFallback(assets, slot.key);
          return (
            <div key={slot.key} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[13px] font-semibold text-gray-900">{slot.label}</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    fallback ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {fallback ? 'Placeholder' : binding.imageId ? 'Uploaded' : 'Hosted URL'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">{slot.hint}</p>

              <FieldGroup label="Upload">
                <ImagePicker
                  value={binding.imageId}
                  onChange={(imageId) => setBinding(slot.key, { imageId })}
                  compact
                />
              </FieldGroup>

              <FieldGroup
                label="Or image URL"
                hint="Used when nothing is uploaded. Must be a public https:// address."
              >
                <TextField
                  value={binding.url}
                  onChange={(url) => setBinding(slot.key, { url })}
                  placeholder="https://example.com/logo.png"
                />
              </FieldGroup>
            </div>
          );
        })}
      </div>
    </section>
  );
}
