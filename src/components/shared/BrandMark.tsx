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
  // Design: yellow stylised building on the left of a "RERA Easy" wordmark.
  const width = Math.round(height * 4.5); // aspect ratio ~4.5:1
  return (
    <svg
      viewBox="0 0 180 40"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-label="RERA Easy"
    >
      {/* Stylised building — nods at the real logo without copying it. */}
      <g fill="#FFDA4B">
        <rect x="6" y="14" width="8" height="20" rx="1" />
        <path d="M14 8 L26 14 L26 34 L14 34 Z" />
        <rect x="18" y="18" width="3" height="3" fill="#1D1F1F" />
        <rect x="18" y="24" width="3" height="3" fill="#1D1F1F" />
        <path d="M26 12 L34 18 L34 34 L26 34 Z" />
        <rect x="28.5" y="21" width="3" height="3" fill="#1D1F1F" />
        <rect x="28.5" y="27" width="3" height="3" fill="#1D1F1F" />
      </g>
      {/* Ground arc */}
      <path
        d="M4 36 Q 22 40 40 36"
        stroke="#1D1F1F"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Wordmark */}
      <text
        x="46"
        y="28"
        fontFamily="'Segoe UI', Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#FFDA4B"
        letterSpacing="0.5"
      >
        RERA
      </text>
      <text
        x="112"
        y="28"
        fontFamily="'Segoe UI', Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#1D1F1F"
        fontStyle="italic"
      >
        Easy
      </text>
      {/* TM mark */}
      <circle cx="163" cy="11" r="5" fill="none" stroke="#1D1F1F" strokeWidth="1" />
      <text
        x="163"
        y="14"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="6"
        fontWeight="700"
        fill="#1D1F1F"
      >
        TM
      </text>
    </svg>
  );
}
