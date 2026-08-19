import { useNewsletterStore } from '../../store/useNewsletterStore';
import { getBinding } from '../../lib/brandAssets';

/**
 * BrandMark — the app-chrome logo shown in the dashboard header, settings
 * header, etc. It reads from the same Brand Asset Manager slot the newsletter
 * uses (Global Settings → Brand Assets → Company Logo). Upload a file or paste
 * a hosted URL there and it shows up everywhere in one shot. When no logo is
 * configured, an inline-SVG "RERA Easy" placeholder renders instead — the
 * page never falls back to a blank square.
 */
export function BrandMark({ height = 32 }: { height?: number }) {
  const images = useNewsletterStore((s) => s.images);
  const settings = useNewsletterStore((s) => s.globalSettings);
  const binding = getBinding(settings.brandAssets, 'logo');

  const src = binding.imageId && images[binding.imageId]?.dataUrl
    ? images[binding.imageId].dataUrl
    : binding.url ||
      (settings.logoImageId && images[settings.logoImageId]?.dataUrl) ||
      '';

  if (src) {
    return (
      <img
        src={src}
        alt="RERA Easy"
        style={{ height, width: 'auto', display: 'block' }}
        className="object-contain"
      />
    );
  }

  // Fallback — a compact inline mark that reads as the RERA Easy brand
  // even before the user uploads a logo file.
  return <BrandMarkFallback height={height} />;
}

function BrandMarkFallback({ height }: { height: number }) {
  // Hand-drawn approximation of the real RERA Easy™ logo, so every browser
  // sees a proper brand mark even before a logo file is uploaded in Brand
  // Assets. The mark: layered yellow skyscraper (short left tower + tall
  // main tower with two window dots + a short right tower), a black ground
  // arc / swoosh underneath, "RERA" in bold yellow, "Easy" in bold black
  // italic, "TM" in a black circle at the top-right of the wordmark.
  const width = Math.round(height * 4.4);
  return (
    <svg
      viewBox="0 0 220 50"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-label="RERA Easy"
    >
      {/* --- Building group --- */}
      <g fill="#FFDA4B">
        {/* Short left tower */}
        <path d="M10 21 L10 40 L20 40 L20 15 Z" />
        {/* Small window on the left tower */}
        <rect x="12.5" y="24" width="2.4" height="2.4" fill="#FFFFFF" />
        {/* Chevron / arrow-shaped middle tower — three stacked chevrons */}
        <path d="M22 13 L30 17 L30 40 L22 40 Z" />
        <path d="M22 20 L30 24 L30 27 L22 23 Z" fill="#FFFFFF" opacity="0.85" />
        <path d="M22 27 L30 31 L30 34 L22 30 Z" fill="#FFFFFF" opacity="0.85" />
        {/* Tall right tower with a subtle right edge */}
        <path d="M31 6 L40 12 L40 40 L31 40 Z" />
        <path d="M40 12 L43 14 L43 40 L40 40 Z" fill="#E8C63F" />
      </g>
      {/* Two small windows on the low ground line under the building */}
      <g fill="#FFDA4B">
        <rect x="21" y="43" width="3" height="3" />
        <rect x="27" y="43" width="3" height="3" />
      </g>
      {/* Black ground arc / swoosh */}
      <path
        d="M4 47 Q 26 51 52 46"
        stroke="#1D1F1F"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8 49 Q 28 52 48 49"
        stroke="#1D1F1F"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* --- Wordmark --- */}
      <text
        x="60"
        y="36"
        fontFamily="'Segoe UI', Arial, Helvetica, sans-serif"
        fontSize="28"
        fontWeight="800"
        fill="#FFDA4B"
        letterSpacing="0.5"
      >
        RERA
      </text>
      <text
        x="138"
        y="36"
        fontFamily="'Segoe UI', Arial, Helvetica, sans-serif"
        fontSize="24"
        fontWeight="800"
        fontStyle="italic"
        fill="#1D1F1F"
      >
        Easy
      </text>
      {/* TM inside a black circle, sitting at the top-right corner */}
      <circle cx="199" cy="14" r="6" fill="none" stroke="#1D1F1F" strokeWidth="1.2" />
      <text
        x="199"
        y="17"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="7"
        fontWeight="700"
        fill="#1D1F1F"
      >
        TM
      </text>
    </svg>
  );
}
