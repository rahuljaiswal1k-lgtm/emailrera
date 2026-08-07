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
  TextBlockSection,
  BoxGroupSection,
  ListBlockSection,
  ColumnsSection,
  FaqSection,
  ComparisonSection,
  TestimonialSection,
  LogoStripSection,
  GallerySection,
  DividerSection,
  CtaBannerSection,
  ImageBannerSection,
} from '../types/newsletter';
import { getIcon } from '../data/icons';
import { esc, nl2br, isDark, EMAIL_FONT } from './htmlEscape';
import { resolveStyle, styleForType, wrapBlock, spacerRow, HEADING_SIZES, computeTokens } from './blockStyle';
import { renderButtonGroup } from './blockButtons';
import { renderBoxes } from './blockBoxes';
import { SOCIAL_SVG_FALLBACK, getBinding, type BrandSlotKey } from './brandAssets';

const FONT = EMAIL_FONT;

/** Resolves an image id to a usable <img src>, or null when there is nothing to show. */
export type ImageResolver = (imageId: string | null) => string | null; // returns a usable <img src>

const spacer = spacerRow;

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
  const style = styleForType('hero', s.style);
  const textColor = isDark(s.backgroundColor) ? '#FFFFFF' : '#111111';
  const chipBg = isDark(s.backgroundColor) ? '#FFDA4B' : '#1D1F1F';
  const chipFg = isDark(s.backgroundColor) ? '#1D1F1F' : '#FFFFFF';

  // Edge-to-edge heroes need square corners and roomier padding; inset heroes
  // keep the original rounded card so existing newsletters are unchanged.
  const radiusCss = style.fullBleed ? '' : 'border-radius:18px;';
  const pad = style.fullBleed ? '34px 32px 30px' : '32px 32px';

  const badge = s.badge
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${
        s.textAlign === 'center' ? 'center' : 'left'
      }" style="margin-bottom:14px;"><tr><td style="background:${chipBg};border-radius:100px;padding:6px 16px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.2px;color:${chipFg};">${esc(
        s.badge.toUpperCase()
      )}</td></tr></table>`
    : '';

  const subtitle =
    s.showSubtitle && s.subtitle
      ? `<p style="margin:10px 0 0;font-family:${FONT};font-size:15px;line-height:22px;color:${textColor};opacity:0.85;">${nl2br(
          s.subtitle
        )}</p>`
      : '';

  const notice = s.noticeText
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${
        s.textAlign === 'center' ? 'center' : 'left'
      }" style="margin-top:18px;"><tr><td style="background:${chipBg};border-radius:8px;padding:10px 18px;font-family:${FONT};font-size:11.5px;font-weight:700;letter-spacing:.8px;color:${chipFg};text-align:center;">${esc(
        s.noticeText.toUpperCase()
      )}</td></tr></table>`
    : '';

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${s.backgroundColor};${radiusCss}"><tr><td style="padding:${pad};text-align:${s.textAlign};">
    ${badge}
    <h1 class="title" style="margin:0;font-family:${FONT};font-size:28px;line-height:36px;font-weight:bold;color:${textColor};">${esc(s.title)}</h1>
    ${subtitle}
    ${notice}
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
  const logoSrc = brandSrc(settings, 'logo', resolve) ?? resolve(settings.logoImageId);
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

// ===========================================================================
// Extended block library
// ---------------------------------------------------------------------------
// Each of these covers several of the named components through variants, and
// every one of them additionally inherits style / buttons / boxes from the
// shared wrapper in renderSection().
// ===========================================================================

/** Small uppercase label above a heading. */
function eyebrowHtml(text: string, color: string): string {
  if (!text) return '';
  return `<div style="font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.2px;color:${color};margin-bottom:8px;">${esc(
    text.toUpperCase()
  )}</div>`;
}

/** Pill badge. */
function badgeHtml(text: string, bg: string, fg: string): string {
  if (!text) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;"><tr><td style="background:${bg};border-radius:100px;padding:5px 14px;font-family:${FONT};font-size:11.5px;font-weight:700;letter-spacing:.6px;color:${fg};">${esc(
    text.toUpperCase()
  )}</td></tr></table>`;
}

function renderTextBlock(s: TextBlockSection): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);
  const h = HEADING_SIZES[s.headingSize] ?? HEADING_SIZES.md;

  const heading = s.heading
    ? `<div style="font-family:${FONT};font-size:${h.size}px;line-height:${h.lineHeight}px;font-weight:${
        s.headingWeight === 'bold' ? 700 : 400
      };color:${t.text};">${esc(s.heading)}</div>`
    : '';
  const sub = s.subheading
    ? `<p style="margin:8px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:${t.muted};">${nl2br(
        s.subheading
      )}</p>`
    : '';
  const body = s.body
    ? `<p style="margin:14px 0 0;font-family:${FONT};font-size:15px;line-height:26px;color:${t.text};text-align:justify;">${nl2br(
        s.body
      )}</p>`
    : '';
  const divider = s.showDivider
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr><td style="border-top:2px solid ${t.accent};font-size:0;line-height:0;width:52px;">&nbsp;</td></tr></table>`
    : '';

  return `${badgeHtml(s.badge, t.accent, isDark(t.accent) ? '#FFFFFF' : '#1D1F1F')}${eyebrowHtml(
    s.eyebrow,
    t.muted
  )}${heading}${sub}${divider}${body}`;
}

function renderBoxGroup(s: BoxGroupSection): string {
  if (!s.heading) return '';
  return sectionHeading(s.icon || 'document', s.heading);
}

function renderListBlock(s: ListBlockSection): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);
  const head = s.heading ? sectionHeading(s.icon || 'document', s.heading) : '';
  const intro = s.intro
    ? `<p style="margin:16px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:${t.muted};">${nl2br(
        s.intro
      )}</p>`
    : '';

  const rows = s.items
    .filter((i) => i.title || i.text)
    .map((item, i) => {
      const title = item.title
        ? `<div style="font-family:${FONT};font-size:15px;font-weight:700;color:${t.text};">${esc(item.title)}</div>`
        : '';
      const text = item.text
        ? `<div style="font-family:${FONT};font-size:14.5px;line-height:23px;color:${t.text};${
            title ? 'margin-top:4px;' : ''
          }">${nl2br(item.text)}</div>`
        : '';
      const body = title + text;

      switch (s.listStyle) {
        case 'checklist':
          return `<tr><td valign="top" width="34" style="padding:10px 0 0;"><div style="width:22px;height:22px;border-radius:50%;background:#2E9E4E;text-align:center;line-height:22px;"><span style="font-family:${FONT};font-size:12px;font-weight:bold;color:#fff;">&#10003;</span></div></td><td style="padding:10px 0 0;">${body}</td></tr>`;

        case 'numbered':
        case 'steps':
          return `<tr><td valign="top" width="42" style="padding:12px 0 0;"><div style="width:30px;height:30px;border-radius:50%;background:${
            t.accent
          };text-align:center;line-height:30px;"><span style="font-family:${FONT};font-size:14px;font-weight:bold;color:${
            isDark(t.accent) ? '#FFFFFF' : '#1D1F1F'
          };">${i + 1}</span></div></td><td style="padding:12px 0 0;">${body}</td></tr>`;

        case 'timeline': {
          const isLast = i === s.items.length - 1;
          return `<tr><td valign="top" width="38" style="padding:0;">
              <div style="width:12px;height:12px;border-radius:50%;background:${t.accent};margin:6px 0 0 6px;"></div>
              ${isLast ? '' : `<div style="width:2px;height:100%;min-height:34px;background:${t.border};margin-left:11px;"></div>`}
            </td><td style="padding:0 0 18px;">${body}</td></tr>`;
        }

        case 'takeaways':
          return `<tr><td valign="top" width="34" style="padding:10px 0 0;"><div style="width:22px;height:22px;border-radius:6px;background:${t.accent};text-align:center;line-height:22px;"><span style="font-family:${FONT};font-size:12px;font-weight:bold;color:#1D1F1F;">&#9733;</span></div></td><td style="padding:10px 0 0;">${body}</td></tr>`;

        case 'features':
          return `<tr><td valign="top" width="34" style="padding:10px 0 0;"><div style="width:22px;height:22px;border-radius:50%;background:${t.accent};text-align:center;line-height:22px;"><span style="font-family:${FONT};font-size:13px;font-weight:bold;color:#1D1F1F;">&#43;</span></div></td><td style="padding:10px 0 0;">${body}</td></tr>`;

        default:
          return `<tr><td valign="top" width="22" style="padding:8px 0 0;font-family:${FONT};font-size:15px;line-height:24px;color:${t.text};">&bull;</td><td style="padding:8px 0 0;">${body}</td></tr>`;
      }
    })
    .join('');

  const list = rows
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">${rows}</table>`
    : '';

  return head + intro + list;
}

function renderColumns(s: ColumnsSection, resolve: ImageResolver): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);
  const head = s.heading
    ? `<div style="font-family:${FONT};font-size:16px;font-weight:700;letter-spacing:.6px;color:${t.text};margin-bottom:18px;">${esc(
        s.heading.toUpperCase()
      )}</div>`
    : '';

  const cols = s.columns.filter((c) => c.title || c.text || c.imageId);
  if (cols.length === 0) return head;

  const perRow = s.count;
  const width = Math.floor(100 / perRow);
  const rows: string[] = [];

  for (let i = 0; i < cols.length; i += perRow) {
    const group = cols.slice(i, i + perRow);
    const cells = group
      .map((c) => {
        const isCard = s.columnStyle === 'card' || s.columnStyle === 'metric';
        const cardOpenCss = isCard
          ? `background:${t.bg === 'transparent' ? '#FFFFFF' : t.bg};border:1px solid ${t.border};border-radius:14px;padding:18px;`
          : '';

        let head2 = '';
        if (s.columnStyle === 'icon' && c.icon) {
          head2 = `<div style="margin-bottom:10px;">${iconBadge(c.icon)}</div>`;
        } else if (s.columnStyle === 'image') {
          const src = resolve(c.imageId);
          head2 = src
            ? `<img src="${esc(src)}" alt="${esc(c.title)}" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border-radius:10px;margin-bottom:10px;">`
            : imgPlaceholder('100%', 10);
        } else if (s.columnStyle === 'metric') {
          head2 = `<div style="font-family:${FONT};font-size:26px;font-weight:bold;color:${t.text};margin-bottom:4px;">${esc(
            c.title
          )}</div>`;
        }

        const title =
          s.columnStyle === 'metric'
            ? ''
            : c.title
            ? `<div style="font-family:${FONT};font-size:15px;font-weight:700;color:${t.text};">${esc(c.title)}</div>`
            : '';
        const text = c.text
          ? `<div style="font-family:${FONT};font-size:13.5px;line-height:21px;color:${
              s.columnStyle === 'metric' ? t.muted : t.text
            };margin-top:6px;">${nl2br(c.text)}</div>`
          : '';

        return `<td class="stack" width="${width}%" valign="top" style="padding:0 6px 12px;"><div style="${cardOpenCss}">${head2}${title}${text}</div></td>`;
      })
      .join('');
    rows.push(`<tr>${cells}</tr>`);
  }

  return `${head}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join('')}</table>`;
}

function renderFaq(s: FaqSection): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);
  const head = s.heading ? sectionHeading(s.icon || 'document', s.heading) : '';
  const items = s.items
    .filter((i) => i.question)
    .map(
      (i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-bottom:1px solid ${t.border};">
        <tr><td style="padding-bottom:12px;">
          <div style="font-family:${FONT};font-size:15px;font-weight:700;color:${t.text};">${esc(i.question)}</div>
          ${i.answer ? `<p style="margin:8px 0 0;font-family:${FONT};font-size:14.5px;line-height:23px;color:${t.muted};">${nl2br(i.answer)}</p>` : ''}
        </td></tr>
      </table>`
    )
    .join('');
  return head + items;
}

function renderComparison(s: ComparisonSection): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);
  const head = s.heading
    ? `<div style="font-family:${FONT};font-size:16px;font-weight:700;letter-spacing:.6px;color:${t.text};margin-bottom:16px;text-align:center;">${esc(
        s.heading.toUpperCase()
      )}</div>`
    : '';

  const column = (title: string, items: string[], accent: string) => {
    const rows = items
      .filter(Boolean)
      .map(
        (i) =>
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;"><tr><td valign="top" width="20" style="font-family:${FONT};font-size:14px;line-height:22px;color:${accent};">&bull;</td><td style="font-family:${FONT};font-size:14px;line-height:22px;color:${t.text};">${nl2br(
            i
          )}</td></tr></table>`
      )
      .join('');
    return `<td class="stack" width="48%" valign="top" style="padding:0 6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${t.border};border-top:3px solid ${accent};border-radius:12px;">
        <tr><td style="padding:18px;">
          <div style="font-family:${FONT};font-size:14px;font-weight:700;color:${accent};letter-spacing:.5px;">${esc(
      title.toUpperCase()
    )}</div>
          ${rows}
        </td></tr>
      </table>
    </td>`;
  };

  return `${head}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    ${column(s.leftTitle, s.leftItems, s.leftAccent || '#E14B4B')}
    ${column(s.rightTitle, s.rightItems, s.rightAccent || '#2E9E4E')}
  </tr></table>`;
}

function renderTestimonial(s: TestimonialSection, resolve: ImageResolver): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);
  const src = resolve(s.imageId);
  const avatar = src
    ? `<img src="${esc(src)}" alt="${esc(s.authorName)}" width="56" style="display:block;width:56px;height:56px;border-radius:50%;object-fit:cover;">`
    : '';

  const author = `<div style="font-family:${FONT};font-size:14px;font-weight:700;color:${t.text};">${esc(
    s.authorName
  )}</div>${s.authorRole ? `<div style="font-family:${FONT};font-size:12.5px;color:${t.muted};margin-top:2px;">${esc(s.authorRole)}</div>` : ''}`;

  const quote = `<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:28px;font-style:italic;color:${t.text};">&ldquo;${nl2br(
    s.quote
  )}&rdquo;</p>`;

  if (s.layout === 'side') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${avatar ? `<td class="stack" width="76" valign="top" style="padding-right:16px;">${avatar}</td>` : ''}
      <td class="stack" valign="top">${quote}<div style="margin-top:12px;">${author}</div></td>
    </tr></table>`;
  }

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    ${avatar ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr><td>${avatar}</td></tr></table>` : ''}
    ${quote}
    <div style="margin-top:14px;">${author}</div>
  </td></tr></table>`;
}

function renderLogoStrip(s: LogoStripSection, resolve: ImageResolver): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);
  const head = s.heading
    ? `<div style="font-family:${FONT};font-size:12.5px;font-weight:700;letter-spacing:1px;color:${t.muted};text-align:center;margin-bottom:16px;">${esc(
        s.heading.toUpperCase()
      )}</div>`
    : '';

  const ids = s.imageIds.filter(Boolean);
  if (ids.length === 0) return head;

  const perRow = Math.max(1, s.perRow || 4);
  const width = Math.floor(100 / perRow);
  const rows: string[] = [];
  for (let i = 0; i < ids.length; i += perRow) {
    const cells = ids
      .slice(i, i + perRow)
      .map((id) => {
        const src = resolve(id);
        return `<td class="stack" width="${width}%" align="center" valign="middle" style="padding:10px;">${
          src ? `<img src="${esc(src)}" alt="" width="100%" style="display:block;width:100%;max-width:110px;height:auto;">` : ''
        }</td>`;
      })
      .join('');
    rows.push(`<tr>${cells}</tr>`);
  }

  return `${head}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join('')}</table>`;
}

function renderGallery(s: GallerySection, resolve: ImageResolver): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);
  const head = s.heading
    ? `<div style="font-family:${FONT};font-size:16px;font-weight:700;letter-spacing:.6px;color:${t.text};margin-bottom:14px;">${esc(
        s.heading.toUpperCase()
      )}</div>`
    : '';

  const ids = s.imageIds.length ? s.imageIds : [null];
  const perRow = s.columns || 2;
  const width = Math.floor(100 / perRow);
  const gap = s.gap ?? 6;
  const rows: string[] = [];

  for (let i = 0; i < ids.length; i += perRow) {
    const cells = ids
      .slice(i, i + perRow)
      .map((id) => {
        const src = resolve(id);
        return `<td class="stack" width="${width}%" valign="top" style="padding:${gap}px;">${
          src
            ? `<img src="${esc(src)}" alt="" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border-radius:${s.borderRadius}px;">`
            : imgPlaceholder('100%', s.borderRadius)
        }</td>`;
      })
      .join('');
    rows.push(`<tr>${cells}</tr>`);
  }

  const caption = s.caption
    ? `<p style="margin:10px 0 0;font-family:${FONT};font-size:12.5px;line-height:18px;color:${t.muted};text-align:center;">${esc(
        s.caption
      )}</p>`
    : '';

  return `${head}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join(
    ''
  )}</table>${caption}`;
}

function renderDivider(s: DividerSection): string {
  const color = s.color || '#E3E6EC';
  switch (s.dividerStyle) {
    case 'space':
      return spacerRow(s.height || 24);
    case 'dots':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="font-family:${FONT};font-size:18px;letter-spacing:8px;color:${color};line-height:18px;">&bull;&bull;&bull;</td></tr></table>`;
    case 'label':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="border-top:${s.thickness || 1}px solid ${color};font-size:0;line-height:0;">&nbsp;</td>
        <td width="1%" style="padding:0 12px;white-space:nowrap;font-family:${FONT};font-size:11.5px;font-weight:700;letter-spacing:1.2px;color:${color};">${esc(
        (s.label || '').toUpperCase()
      )}</td>
        <td style="border-top:${s.thickness || 1}px solid ${color};font-size:0;line-height:0;">&nbsp;</td>
      </tr></table>`;
    default:
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:${
        s.thickness || 1
      }px solid ${color};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
  }
}

function renderCtaBanner(s: CtaBannerSection, resolve: ImageResolver): string {
  const style = resolveStyle(s.style);
  const t = computeTokens(style);

  const eyebrow = eyebrowHtml(s.eyebrow, t.accent);
  const heading = s.heading
    ? `<div style="font-family:${FONT};font-size:21px;line-height:29px;font-weight:700;color:${t.text};">${esc(
        s.heading
      )}</div>`
    : '';
  const desc = s.description
    ? `<p style="margin:10px 0 0;font-family:${FONT};font-size:14.5px;line-height:23px;color:${t.muted};">${nl2br(
        s.description
      )}</p>`
    : '';
  const copy = `${eyebrow}${heading}${desc}`;

  if (s.layout === 'split') {
    const src = resolve(s.imageId);
    const imageCell = src
      ? `<td class="stack" width="38%" valign="middle" style="padding-left:18px;"><img src="${esc(
          src
        )}" alt="" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border-radius:12px;"></td>`
      : '';
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="stack" width="${src ? '62%' : '100%'}" valign="middle">${copy}</td>
      ${imageCell}
    </tr></table>`;
  }

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="text-align:center;">${copy}</td></tr></table>`;
}

function renderImageBanner(s: ImageBannerSection, resolve: ImageResolver): string {
  const src = resolve(s.imageId);
  const radius = s.borderRadius ?? 14;

  const caption =
    s.heading || s.subheading
      ? `<div style="padding:18px 20px;${
          s.overlay ? `background:${s.overlayColor || 'rgba(29,31,31,0.86)'};` : ''
        }">
          ${s.heading ? `<div class="title" style="font-family:${FONT};font-size:22px;line-height:30px;font-weight:bold;color:${s.textColor || '#FFFFFF'};">${esc(s.heading)}</div>` : ''}
          ${s.subheading ? `<p style="margin:6px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${s.textColor || '#FFFFFF'};opacity:.9;">${nl2br(s.subheading)}</p>` : ''}
        </div>`
      : '';

  const image = src
    ? `<img src="${esc(src)}" alt="${esc(s.heading)}" width="100%" style="display:block;width:100%;max-width:100%;height:auto;">`
    : imgPlaceholder('100%', 0);

  // Real background images are unreliable in email, so the text sits in a
  // solid strip above or below the image instead of floating over it.
  const order = s.textPosition === 'top' ? caption + image : image + caption;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:${radius}px;overflow:hidden;background:#1D1F1F;">
    <tr><td style="font-size:0;line-height:0;">${order}</td></tr>
  </table>`;
}

// ---------------------------------------------------------------------------
// Section dispatch
// ---------------------------------------------------------------------------

/** The block's own content, before the shared style / boxes / buttons wrapper. */
function renderSectionInner(section: Section, settings: GlobalSettings, resolve: ImageResolver): string {
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
    case 'textBlock':
      return renderTextBlock(section);
    case 'boxGroup':
      return renderBoxGroup(section);
    case 'listBlock':
      return renderListBlock(section);
    case 'columns':
      return renderColumns(section, resolve);
    case 'faq':
      return renderFaq(section);
    case 'comparison':
      return renderComparison(section);
    case 'testimonial':
      return renderTestimonial(section, resolve);
    case 'logoStrip':
      return renderLogoStrip(section, resolve);
    case 'gallery':
      return renderGallery(section, resolve);
    case 'divider':
      return renderDivider(section);
    case 'ctaBanner':
      return renderCtaBanner(section, resolve);
    case 'imageBanner':
      return renderImageBanner(section, resolve);
    default:
      return '';
  }
}

/**
 * Renders one section: its own content, then any container boxes, then any
 * buttons — all wrapped in the shared BlockStyle chrome.
 *
 * A pre-existing section has no `style`, so resolveStyle() yields the neutral
 * default (transparent, no padding, 18px bottom spacing) and wrapBlock() is a
 * pass-through that reproduces the previous output.
 */
function renderSection(section: Section, settings: GlobalSettings, resolve: ImageResolver): string {
  if (!section.visible) return '';
  const inner = renderSectionInner(section, settings, resolve);
  const extras = renderBoxes(section.boxes) + renderButtonGroup(section.buttons);
  if (!inner && !extras) return '';
  return wrapBlock(inner + extras, styleForType(section.type, section.style));
}

// ---------------------------------------------------------------------------
// Brand assets — logo + social icons resolved through the Asset Manager
// ---------------------------------------------------------------------------

/**
 * Resolve one brand slot to an <img src>, or null to fall back to inline SVG.
 * Uploaded image wins over a pasted URL so the export ZIP stays self-contained.
 */
function brandSrc(settings: GlobalSettings, key: BrandSlotKey, resolve: ImageResolver): string | null {
  const binding = getBinding(settings.brandAssets, key);
  if (binding.imageId) {
    const src = resolve(binding.imageId);
    if (src) return src;
  }
  return binding.url || null;
}

function socialBadge(platform: string, url: string, settings: GlobalSettings, resolve: ImageResolver): string {
  const src = brandSrc(settings, platform as BrandSlotKey, resolve);
  const inner = src
    ? `<img src="${esc(src)}" alt="${esc(platform)}" width="22" height="22" style="display:block;width:22px;height:22px;border:0;outline:none;text-decoration:none;">`
    : (() => {
        const svg = SOCIAL_SVG_FALLBACK[platform];
        return svg
          ? `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:block;">${svg}</svg>`
          : '';
      })();
  if (!inner) return '';
  return `<a href="${esc(url)}" target="_blank" style="text-decoration:none;">${inner}</a>`;
}

// ---------------------------------------------------------------------------
// Full document assembly
// ---------------------------------------------------------------------------

export function generateHTML(newsletter: Newsletter, settings: GlobalSettings, resolve: ImageResolver): string {
  // Sections normally sit inside a padded content column. Blocks marked
  // fullBleed escape it and get their own edge-to-edge row, so a hero band or
  // image banner can run the full 640px width with square corners.
  const rows: string[] = [];
  let padded: string[] = [];
  const flushPadded = () => {
    if (padded.length === 0) return;
    const topPad = rows.length === 0 ? 28 : 22;
    rows.push(`<tr><td class="px" style="padding:${topPad}px 28px 8px;">${padded.join('')}</td></tr>`);
    padded = [];
  };

  newsletter.sections.forEach((s) => {
    const html = renderSection(s, settings, resolve);
    if (!html) return;
    if (styleForType(s.type, s.style).fullBleed) {
      flushPadded();
      rows.push(`<tr><td style="padding:0;font-size:0;line-height:0;">${html}</td></tr>`);
    } else {
      padded.push(html);
    }
  });
  flushPadded();

  const sectionsHtml = rows.join('');

  // Asset Manager logo slot wins; the legacy Global Settings logo still works.
  const headerLogoSrc = brandSrc(settings, 'logo', resolve) ?? resolve(settings.logoImageId);
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

  const socialLinks = settings.social
    .map((s) => `<td style="padding-right:12px;">${socialBadge(s.platform, s.url, settings, resolve)}</td>`)
    .join('');

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

        ${sectionsHtml}

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

  // Brand Asset Manager slots first, so the logo keeps its stable image1 slot.
  add(settings.logoImageId);
  if (settings.brandAssets) {
    Object.values(settings.brandAssets).forEach((b) => add(b?.imageId));
  }

  newsletter.sections.forEach((s) => {
    switch (s.type) {
      case 'image':
        add(s.imageId);
        add(s.imageId2);
        s.gridImageIds.forEach(add);
        break;
      case 'columns':
        s.columns.forEach((c) => add(c.imageId));
        break;
      case 'gallery':
        s.imageIds.forEach(add);
        break;
      case 'logoStrip':
        s.imageIds.forEach(add);
        break;
      case 'testimonial':
        add(s.imageId);
        break;
      case 'ctaBanner':
        add(s.imageId);
        break;
      case 'imageBanner':
        add(s.imageId);
        break;
      default:
        break;
    }
  });
  return ids;
}
