import type {
  Newsletter,
  GlobalSettings,
  Section,
  StoredImage,
  HeroSection,
  ContentSection,
  InfoCardSection,
  MythFactSection,
  ImageSection,
  QuoteSection,
  CTASection,
  StatsSection,
  AboutSection,
} from '../types/newsletter';
import { getIcon } from '../data/icons';

const FONT = 'Arial,Helvetica,sans-serif';

/** Resolves an image id to a usable <img src>, or null when there is nothing to show. */
export type ImageResolver = (imageId: string | null) => string | null; // returns a usable <img src>

function esc(str: string): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nl2br(str: string): string {
  return esc(str).replace(/\n/g, '<br>');
}

function isDark(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55;
}

function spacer(height: number): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${height}" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function cardOpen(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #D9DDE3;border-radius:22px;background:#FFFFFF;"><tr><td style="padding:28px;">`;
}
function cardClose(): string {
  return `</td></tr></table>`;
}

function iconBadge(iconKey: string): string {
  const icon = getIcon(iconKey);
  return `<div style="width:44px;height:44px;border-radius:50%;background:#1D1F1F;text-align:center;line-height:44px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">${icon.svg}</svg></div>`;
}

function sectionHeading(iconKey: string, heading: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle" width="56">${iconBadge(
    iconKey
  )}</td><td valign="middle"><div style="font-family:${FONT};font-size:16px;font-weight:700;letter-spacing:1px;color:#111111;">${esc(
    heading.toUpperCase()
  )}</div></td></tr></table>`;
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderHero(s: HeroSection): string {
  const textColor = isDark(s.backgroundColor) ? '#FFFFFF' : '#111111';
  const subtitle = s.showSubtitle && s.subtitle
    ? `<p style="margin:10px 0 0;font-family:${FONT};font-size:15px;line-height:22px;color:${textColor};opacity:0.85;">${nl2br(s.subtitle)}</p>`
    : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${s.backgroundColor};border-radius:18px;"><tr><td style="padding:32px 32px;text-align:${s.textAlign};">
    <h1 class="title" style="margin:0;font-family:${FONT};font-size:28px;line-height:36px;font-weight:bold;color:${textColor};">${esc(s.title)}</h1>
    ${subtitle}
  </td></tr></table>`;
}

function renderContentBody(s: ContentSection): string {
  if (s.bodyType === 'paragraph') {
    return `<p style="margin:18px 0 0;font-family:${FONT};font-size:15px;line-height:26px;color:#1A1A1A;text-align:justify;">${nl2br(s.paragraph)}</p>`;
  }
  const rows = s.items
    .map((item, i) => {
      const marker = s.bodyType === 'numbered' ? `${i + 1}.` : '&bull;';
      return `<tr><td valign="top" width="22" style="font-family:${FONT};font-size:15px;line-height:28px;color:#111111;">${marker}</td><td style="font-family:${FONT};font-size:15px;line-height:28px;color:#1A1A1A;text-align:justify;">${nl2br(
        item
      )}</td></tr>`;
    })
    .join('');
  const list = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">${rows}</table>`;
  if (s.bodyType === 'mixed') {
    const para = s.paragraph
      ? `<p style="margin:18px 0 0;font-family:${FONT};font-size:15px;line-height:26px;color:#1A1A1A;text-align:justify;">${nl2br(s.paragraph)}</p>`
      : '';
    return para + list;
  }
  return list;
}

function renderContent(s: ContentSection): string {
  const sub = s.subheading
    ? `<p style="margin:18px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:#555555;">${nl2br(s.subheading)}</p>`
    : '';
  return `${cardOpen()}${sectionHeading(s.icon, s.heading)}${sub}${renderContentBody(s)}${cardClose()}`;
}

function renderInfoCard(s: InfoCardSection): string {
  return `${cardOpen()}
    <div style="font-family:${FONT};font-size:16px;font-weight:700;letter-spacing:.5px;color:#111111;margin-bottom:14px;">${esc(s.heading.toUpperCase())}</div>
    <div style="background:${s.backgroundColor};border-radius:14px;padding:20px;border-left:4px solid ${s.borderColor};text-align:left;">
      <p style="margin:0;font-family:${FONT};font-size:15px;line-height:26px;color:#444444;text-align:justify;">${nl2br(s.text)}</p>
    </div>
  ${cardClose()}`;
}

function mythFactRow(text: string, isMyth: boolean): string {
  const bg = isMyth ? '#E14B4B' : '#2E9E4E';
  const symbol = isMyth ? '&#10005;' : '&#10003;';
  const color = isMyth ? '#7A2323' : '#1F5C31';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr>
    <td valign="top" width="30" style="padding-top:1px;"><div style="width:22px;height:22px;border-radius:50%;background:${bg};text-align:center;line-height:22px;"><span style="font-family:${FONT};font-size:13px;font-weight:bold;color:#ffffff;">${symbol}</span></div></td>
    <td valign="top" style="font-family:${FONT};font-size:14.5px;line-height:22px;color:${color};text-align:justify;">${nl2br(text)}</td>
  </tr></table>`;
}

function renderMythFact(s: MythFactSection): string {
  const mythRows = s.myths.map((m) => mythFactRow(m, true)).join('');
  const factRows = s.facts.map((f) => mythFactRow(f, false)).join('');
  return `${cardOpen()}
    ${sectionHeading('warning', s.heading)}
    <p style="margin:18px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:#555555;">${esc(s.mythsIntro)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;background:#FDECEC;border:1px solid #F4C6C6;border-radius:14px;"><tr><td style="padding:18px 20px 4px;">${mythRows}</td></tr></table>
    ${spacer(16)}
    <p style="margin:0;font-family:${FONT};font-size:14px;line-height:22px;color:#555555;">${esc(s.factsIntro)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;background:#EAF7ED;border:1px solid #BFE4C8;border-radius:14px;"><tr><td style="padding:18px 20px 4px;">${factRows}</td></tr></table>
  ${cardClose()}`;
}

/**
 * Placeholder shown wherever an image slot is still empty. Rendered as a plain
 * table cell rather than an <img> so neither the preview nor the exported ZIP
 * ever points at a file that does not exist.
 */
function imgPlaceholder(width: string, radius: number): string {
  return `<table role="presentation" width="${width}" cellpadding="0" cellspacing="0" border="0" style="width:${width};max-width:100%;"><tr><td height="150" align="center" valign="middle" style="background:#F3F4F6;border:1px dashed #C9CDD4;border-radius:${radius}px;font-family:${FONT};font-size:13px;color:#8A9099;">No image selected</td></tr></table>`;
}

function img(src: string | null, alt: string, width: string, radius: number): string {
  if (!src) return imgPlaceholder(width, radius);
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="${width}" style="display:block;width:${width};max-width:100%;height:auto;border-radius:${radius}px;margin:0 auto;">`;
}

function renderImage(s: ImageSection, resolve: ImageResolver): string {
  if (s.layout === 'none') return '';
  const caption = s.caption
    ? `<p style="margin:10px 0 0;font-family:${FONT};font-size:12.5px;line-height:18px;color:#777777;text-align:center;">${esc(s.caption)}</p>`
    : '';
  const text = s.text ? `<p style="margin:0;font-family:${FONT};font-size:14.5px;line-height:23px;color:#333333;text-align:justify;">${nl2br(s.text)}</p>` : '';

  if (s.layout === 'full') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:0;">${img(
      resolve(s.imageId),
      s.altText,
      `${s.widthPercent}%`,
      s.borderRadius
    )}${caption}</td></tr></table>`;
  }

  if (s.layout === 'leftImageRightText' || s.layout === 'rightImageLeftText') {
    const imageCell = `<td class="stack" width="46%" valign="top" style="padding:${s.layout === 'leftImageRightText' ? '0 14px 0 0' : '0 0 0 14px'};">${img(
      resolve(s.imageId),
      s.altText,
      '100%',
      s.borderRadius
    )}${caption}</td>`;
    const textCell = `<td class="stack" width="54%" valign="middle" style="padding-top:10px;">${text}</td>`;
    const cells = s.layout === 'leftImageRightText' ? imageCell + textCell : textCell + imageCell;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`;
  }

  if (s.layout === 'twoImages') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="stack" width="48%" valign="top" style="padding-right:8px;">${img(resolve(s.imageId), s.altText, '100%', s.borderRadius)}</td>
      <td class="stack" width="48%" valign="top" style="padding-left:8px;">${img(resolve(s.imageId2), s.altText, '100%', s.borderRadius)}</td>
    </tr></table>${caption}`;
  }

  if (s.layout === 'grid') {
    const ids = s.gridImageIds.length ? s.gridImageIds : [null, null, null, null];
    const rows: string[] = [];
    for (let i = 0; i < ids.length; i += 2) {
      const pair = ids.slice(i, i + 2);
      const cells = pair
        .map(
          (id) =>
            `<td class="stack" width="${pair.length === 2 ? '48%' : '100%'}" valign="top" style="padding:6px;">${img(
              resolve(id),
              s.altText,
              '100%',
              s.borderRadius
            )}</td>`
        )
        .join('');
      rows.push(`<tr>${cells}</tr>`);
    }
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join('')}</table>${caption}`;
  }

  return '';
}

function renderQuote(s: QuoteSection): string {
  const heading = s.heading
    ? `<tr><td align="center" style="padding:0 16px 4px;"><span style="font-family:${FONT};font-size:17px;font-weight:bold;color:${s.textColor};">${esc(
        s.heading
      )}</span></td></tr>`
    : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${s.backgroundColor};border-radius:14px;">
    <tr><td align="center" style="padding:18px 16px 4px;"><span style="font-family:${FONT};font-size:15px;font-weight:bold;letter-spacing:.6px;color:#FFDA4B;">${esc(
      s.eyebrow.toUpperCase()
    )}</span></td></tr>
    ${heading}
    <tr><td style="padding:6px 26px 24px;font-family:${FONT};font-size:15px;line-height:24px;color:${s.textColor};text-align:justify;">${nl2br(
    s.description
  )}</td></tr>
  </table>`;
}

function renderCTA(s: CTASection): string {
  const btnTextColor = isDark(s.buttonColor) ? '#FFFFFF' : '#111111';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E6EC;border-radius:14px;"><tr><td style="padding:20px;">
    <div style="font-family:${FONT};font-size:17px;font-weight:700;letter-spacing:1px;color:#111111;text-align:center;text-transform:uppercase;margin-bottom:6px;">${esc(
    s.heading
  )}</div>
    <p style="margin:0;font-family:${FONT};font-size:14px;line-height:22px;color:#555555;text-align:center;max-width:520px;margin-left:auto;margin-right:auto;">${nl2br(
    s.description
  )}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding-top:20px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(
        s.buttonUrl
      )}" style="height:44px;v-text-anchor:middle;width:190px;" arcsize="24%" stroke="f" fillcolor="${s.buttonColor}">
        <w:anchorlock/><center style="color:${btnTextColor};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${esc(s.buttonText)}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-- -->
      <a href="${esc(s.buttonUrl)}" target="_blank" style="display:inline-block;background:${s.buttonColor};color:${btnTextColor};font-family:${FONT};font-size:15px;font-weight:bold;text-decoration:none;padding:13px 32px;border-radius:10px;">${esc(
    s.buttonText
  )}</a>
      <!--<![endif]-->
    </td></tr></table>
  </td></tr></table>`;
}

function renderStats(s: StatsSection): string {
  const shown = s.metrics.filter((m) => m.show).slice(0, 4);
  const width = shown.length > 0 ? Math.floor(100 / shown.length) : 25;
  const cells = shown
    .map(
      (m) =>
        `<td width="${width}%" align="center" class="stat-cell" style="padding-bottom:10px;"><div style="font-family:${FONT};font-size:26px;font-weight:bold;color:#111111;">${esc(
          m.number
        )}</div><div style="font-family:${FONT};font-size:12px;color:#666666;margin-top:4px;">${esc(m.label)}</div></td>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E6EC;border-radius:14px;"><tr><td style="padding:24px;">
    <div style="font-family:${FONT};font-size:13px;font-weight:bold;letter-spacing:.8px;color:#111111;text-align:center;margin-bottom:20px;">${esc(
    s.heading.toUpperCase()
  )}</div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>
  </td></tr></table>`;
}

function renderAbout(s: AboutSection, settings: GlobalSettings, resolve: ImageResolver): string {
  const logoSrc = resolve(settings.logoImageId);
  const logo = logoSrc
    ? `<img src="${esc(logoSrc)}" alt="${esc(settings.companyName)}" width="110" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">`
    : '';
  const phones = settings.phones
    .map(
      (p) =>
        `<div style="font-family:${FONT};font-size:14px;font-weight:bold;line-height:26px;"><span style="color:#fff;">${esc(
          p.label
        )} : ${esc(p.number)}</span></div>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #1d1f1f;border-radius:14px;background:#1d1f1f;"><tr><td style="padding:20px 22px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:${FONT};font-size:13px;font-weight:bold;letter-spacing:.8px;color:#fff;padding-right:10px;">${esc(
    s.heading.toUpperCase()
  )}</td>
      <td>${logo}</td>
    </tr></table>
    <p style="margin:10px 0 0;font-family:${FONT};font-size:13.5px;line-height:21px;color:#fff;text-align:justify;">${nl2br(s.description)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #333; font-size:0;line-height:0;padding-top:16px;">&nbsp;</td></tr></table>
    <div style="text-align:center;margin-top:14px;">
      <div style="font-family:${FONT};font-size:13px;font-weight:bold;letter-spacing:.6px;color:#fff;margin-bottom:8px;">CONTACT</div>
      ${phones}
      <div style="margin-top:8px;font-family:${FONT};font-size:13.5px;line-height:20px;color:#fff;"><b>EMAIL ID:</b> <a href="mailto:${esc(
    settings.email
  )}" style="color:#fff;font-weight:bold;text-decoration:none;">${esc(settings.email)}</a></div>
    </div>
  </td></tr></table>`;
}

function renderSection(section: Section, settings: GlobalSettings, resolve: ImageResolver): string {
  if (!section.visible) return '';
  switch (section.type) {
    case 'hero':
      return renderHero(section);
    case 'content':
      return renderContent(section);
    case 'infoCard':
      return renderInfoCard(section);
    case 'mythFact':
      return renderMythFact(section);
    case 'image':
      return renderImage(section, resolve);
    case 'quote':
      return renderQuote(section);
    case 'cta':
      return renderCTA(section);
    case 'stats':
      return renderStats(section);
    case 'about':
      return renderAbout(section, settings, resolve);
    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// Social icons — rendered as inline SVG badges (no binary assets to bundle)
// ---------------------------------------------------------------------------

const SOCIAL_SVG: Record<string, string> = {
  whatsapp: `<path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z" fill="#111"/><path d="M8.6 7.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.4.2.5.7 1.7.7 1.8.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.2.4-.2.6-.1.2.1 1.6.7 1.8.9.2.1.4.2.4.3 0 .2 0 .9-.3 1.4-.3.6-1.5 1.1-2.1 1.1-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1 0-1.5.8-2.2 1-2.5z" fill="#fff"/>`,
  instagram: `<rect x="2" y="2" width="20" height="20" rx="5" fill="#111"/><circle cx="12" cy="12" r="4.2" stroke="#fff" stroke-width="1.6" fill="none"/><circle cx="17.3" cy="6.7" r="1.1" fill="#fff"/>`,
  linkedin: `<rect x="2" y="2" width="20" height="20" rx="3" fill="#111"/><rect x="5.5" y="9.5" width="2.6" height="9" fill="#fff"/><circle cx="6.8" cy="6.3" r="1.5" fill="#fff"/><path d="M10.7 9.5h2.5v1.3c.5-.8 1.4-1.5 2.9-1.5 2.1 0 3.4 1.4 3.4 4v5.2h-2.6v-4.7c0-1.2-.5-2-1.6-2-.9 0-1.4.6-1.6 1.2-.1.2-.1.5-.1.8v4.7h-2.6c0-.1 0-8 0-8.9z" fill="#fff"/>`,
  facebook: `<circle cx="12" cy="12" r="10" fill="#111"/><path d="M13.5 21.9v-7.6h2.5l.4-3h-2.9V9.4c0-.9.2-1.5 1.5-1.5h1.6V5.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.5v7.6h2.8z" fill="#fff"/>`,
  twitter: `<circle cx="12" cy="12" r="10" fill="#111"/><path d="M18 8.2c-.4.2-.9.3-1.4.4a2.4 2.4 0 0 0 1.1-1.3 4.8 4.8 0 0 1-1.5.6 2.4 2.4 0 0 0-4.1 2.2 6.8 6.8 0 0 1-5-2.5 2.4 2.4 0 0 0 .8 3.2c-.4 0-.7-.1-1-.3v.1c0 1.2.8 2.1 1.9 2.4-.3.1-.7.1-1 0 .3 1 1.2 1.7 2.3 1.7A4.8 4.8 0 0 1 6 16.1a6.8 6.8 0 0 0 3.7 1.1c4.4 0 6.9-3.7 6.9-6.9v-.3c.5-.3.9-.7 1.2-1.2z" fill="#fff"/>`,
  youtube: `<rect x="2" y="5" width="20" height="14" rx="4" fill="#111"/><path d="M10 9.5l5 2.5-5 2.5z" fill="#fff"/>`,
};

function socialBadge(platform: string, url: string): string {
  const svg = SOCIAL_SVG[platform];
  if (!svg) return '';
  return `<a href="${esc(url)}" target="_blank" style="text-decoration:none;"><svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:block;">${svg}</svg></a>`;
}

// ---------------------------------------------------------------------------
// Full document assembly
// ---------------------------------------------------------------------------

export function generateHTML(newsletter: Newsletter, settings: GlobalSettings, resolve: ImageResolver): string {
  const sectionsHtml = newsletter.sections
    .map((s) => renderSection(s, settings, resolve))
    .filter(Boolean)
    .map((html, i, arr) => (i < arr.length - 1 ? html + spacer(18) : html))
    .join('');

  const headerLogoSrc = resolve(settings.logoImageId);
  const logo = headerLogoSrc
    ? `<img src="${esc(headerLogoSrc)}" alt="${esc(settings.companyName)}" width="120" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">`
    : `<div style="font-family:${FONT};font-weight:bold;color:#fff;font-size:18px;">${esc(settings.companyName)}</div>`;

  const offices = settings.offices
    .map(
      (o, i) =>
        `<td width="${Math.floor(100 / settings.offices.length)}%" valign="top" align="left" class="stack ${i === 0 ? 'addr-first' : 'addr-rest'}"><div style="font-family:${FONT};font-size:13px;font-weight:bold;color:#111111;margin-bottom:8px;text-align:left;">${esc(
          o.label.toUpperCase()
        )}</div><div style="font-family:${FONT};font-size:12px;line-height:19px;color:#111111;text-align:left;">${nl2br(o.address)}</div></td>`
    )
    .join('');

  const socialLinks = settings.social.map((s) => `<td style="padding-right:12px;">${socialBadge(s.platform, s.url)}</td>`).join('');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(newsletter.title)}</title>
  <style type="text/css">
    body,table,td,p,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img{ -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
    body{ margin:0; padding:0; width:100% !important; background:#EDEFF3; }
    a{ color:#1A1A1A; }
    .addr-rest{ padding-left:28px; }
    @media only screen and (max-width:640px){
      .container{ width:100% !important; }
      .px{ padding-left:18px !important; padding-right:18px !important; }
      .stack{ display:block !important; width:100% !important; }
      .title{ font-size:24px !important; line-height:31px !important; }
      .addr-rest{ padding-left:0 !important; padding-top:14px !important; }
      .stat-cell{ width:50% !important; display:inline-block !important; box-sizing:border-box; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#EDEFF3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EDEFF3;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);">

        <tr><td class="px" style="background:#101010;padding:16px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
          <a href="${esc(settings.websiteUrl)}" target="_blank" style="text-decoration:none;border:0;">${logo}</a>
        </td></tr></table></td></tr>

        ${sectionsHtml ? `<tr><td class="px" style="padding:28px 28px 8px;">${sectionsHtml}</td></tr>` : ''}

        <tr><td align="center" style="padding:22px 28px 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFDA4B;border-radius:12px;">
            <tr><td style="padding:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${offices}</tr></table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:15px;margin-bottom:16px;"><tr><td style="border-top:1px solid rgba(0,0,0,0.15);font-size:0;line-height:0;">&nbsp;</td></tr></table>
              <div style="font-family:${FONT};font-size:13px;font-weight:bold;color:#111111;margin-bottom:10px;text-align:center;">FIND US ON</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${socialLinks}</tr></table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr><td style="border-top:1px solid rgba(0,0,0,0.15);font-size:0;line-height:0;">&nbsp;</td></tr></table>
              <div style="margin-top:16px;font-family:${FONT};font-size:12px;line-height:18px;color:#111111;text-align:center;">${esc(settings.legalText)}</div>
              <div style="margin-top:12px;text-align:center;"><a href="#" style="font-family:${FONT};font-size:12px;color:#111111;text-decoration:underline;">Unsubscribe</a></div>
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function previewResolver(images: Record<string, StoredImage>): ImageResolver {
  return (id) => (id && images[id] ? images[id].dataUrl : null);
}

export function exportResolver(filenameMap: Record<string, string>): ImageResolver {
  return (id) => (id && filenameMap[id] ? `images/${filenameMap[id]}` : null);
}

/** Collect every image id referenced by a newsletter + global settings, in a stable order. */
export function collectImageIds(newsletter: Newsletter, settings: GlobalSettings): string[] {
  const ids: string[] = [];
  const add = (id: string | null | undefined) => {
    if (id && !ids.includes(id)) ids.push(id);
  };
  add(settings.logoImageId);
  newsletter.sections.forEach((s) => {
    if (s.type === 'image') {
      add(s.imageId);
      add(s.imageId2);
      s.gridImageIds.forEach(add);
    }
  });
  return ids;
}
