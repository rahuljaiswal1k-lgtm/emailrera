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
  FooterSection,
  HeaderSection,
  HeroLayout,
} from '../types/newsletter';
import { getIcon } from '../data/icons';
import { esc, nl2br, rich, isDark, EMAIL_FONT } from './htmlEscape';
import {
  resolveStyle,
  styleForType,
  tokensFor,
  wrapBlock,
  spacerRow,
  HEADING_SIZES,
  computeTokens,
  THEME_TOKENS,
  type ThemeTokens,
} from './blockStyle';
import { RADIUS, SPACE, TYPE, ICON_SIZE, CARD_PADDING } from './designTokens';
import { renderButtonGroup } from './blockButtons';
import { renderBoxes } from './blockBoxes';
import { SOCIAL_SVG_FALLBACK, getBinding, type BrandSlotKey } from './brandAssets';
import { canvasStyles, canvasScript, CANVAS_ATTR } from './canvasEditor';
import { SECTION_LABELS } from '../data/sectionDefaults';

/**
 * Preview-only options. `interactive` adds the in-canvas editing layer
 * (selection outlines, per-section toolbar, drag-to-reorder). It is never set
 * when generating the export, so the delivered HTML stays clean and
 * email-safe.
 */
export interface GenerateOptions {
  interactive?: boolean;
  selectedId?: string | null;
}

const FONT = EMAIL_FONT;

/**
 * Set for the duration of a preview render. When true, text fields are tagged
 * with `data-nl-edit="<path>"` so the canvas can turn them into contenteditable
 * regions. Always false for the export.
 */
let INTERACTIVE = false;

/** Emit the editable marker for a field path, e.g. "heading" or "items.0". */
function ed(path: string): string {
  return INTERACTIVE ? ` data-nl-edit="${path}"` : '';
}

/** Resolves an image id to a usable <img src>, or null when there is nothing to show. */
export type ImageResolver = (imageId: string | null) => string | null; // returns a usable <img src>

const spacer = spacerRow;

/** Fallback tokens for helpers called without an explicit theme. */
const BASE_T = THEME_TOKENS.light;

function cardOpen(t: ThemeTokens = BASE_T): string {
  // cardBg (never transparent) so a plain/minimal variant on a dark theme still
  // paints a dark card rather than falling back to white.
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${t.border};border-radius:${RADIUS.xl}px;background:${t.cardBg};"><tr><td style="padding:${CARD_PADDING}px;">`;
}
function cardClose(): string {
  return `</td></tr></table>`;
}

/**
 * Draw the block's own card only when the shared wrapper is NOT already
 * painting one. Without this, applying a card/elevated preset to a Content
 * section produces a card inside a card — the "collection of separate widgets"
 * look. One card per block, always.
 */
function card(inner: string, t: ThemeTokens, ownCard: boolean): string {
  return ownCard ? cardOpen(t) + inner + cardClose() : inner;
}

/** True when wrapBlock() already gives this block a surface + padding. */
function wrapperPaintsCard(style: { variant: string; padding: number }): boolean {
  return style.padding > 0 && style.variant !== 'plain' && style.variant !== 'minimal';
}

/**
 * Section icon. Rendered as a soft rounded-square tile (matching the reference
 * newsletters) rather than a hard black circle — lighter, and it sits better
 * against white cards. Colours come from the theme so it inverts on dark.
 */
function iconBadge(iconKey: string, t: ThemeTokens = BASE_T, size: number = ICON_SIZE.md): string {
  const icon = getIcon(iconKey);
  const inner = Math.round(size * 0.55);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:${t.iconTileBg};border:1px solid ${t.iconTileBorder};border-radius:${RADIUS.sm}px;"><tr><td width="${size}" height="${size}" align="center" valign="middle" style="width:${size}px;height:${size}px;text-align:center;"><svg width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">${icon.svg}</svg></td></tr></table>`;
}

function sectionHeading(iconKey: string, heading: string, t: ThemeTokens = BASE_T, path = 'heading'): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="margin-bottom:${SPACE.sm}px;"><tr><td valign="middle" style="padding-right:12px;">${iconBadge(
    iconKey,
    t
  )}</td><td valign="middle" align="left" style="text-align:left;"><div style="font-family:${FONT};font-size:${TYPE.h4.size}px;line-height:${
    TYPE.h4.lh
  }px;font-weight:700;letter-spacing:.9px;color:${t.heading};text-align:left;"${ed(path)}>${esc(heading.toUpperCase())}</div></td></tr></table>`;
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

/**
 * Hero — a layout system rather than a single shape.
 *
 * `heroLayout` picks the arrangement; every element (top strip, logo, badge,
 * heading, subtitle, description, notice strip, image, CTAs, divider) is
 * independently optional, so one component covers the classic banner, the
 * strip-and-badge header from the reference newsletter, image heroes, minimal
 * heroes, dark heroes and editorial heroes.
 */
function renderHero(s: HeroSection, settings: GlobalSettings, resolve: ImageResolver): string {
  const style = styleForType('hero', s.style);
  const layout: HeroLayout = s.heroLayout ?? 'classic';

  const bg = s.backgroundColor || '#FFDA4B';
  const onDark = isDark(bg);
  const heading = s.headingColor || (onDark ? '#FFFFFF' : '#111111');
  const bodyColor = s.textColorOverride || (onDark ? '#E6E8E8' : '#333333');
  const chipBg = s.stripColor || (onDark ? '#FFDA4B' : '#1D1F1F');
  const chipFg = s.stripTextColor || (isDark(chipBg) ? '#FFFFFF' : '#1D1F1F');

  const align = s.textAlign;
  const alignAttr = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  const radiusCss = style.fullBleed ? '' : `border-radius:${s.borderRadius ?? RADIUS.lg}px;`;
  const padY = s.heroPadding ?? (layout === 'minimal' ? 26 : 34);
  const pad = `${padY}px 32px ${Math.max(18, padY - 4)}px`;

  // --- individual elements -------------------------------------------------
  const topStrip = s.showTopStrip ? heroStrip(s.topStripText ?? '', s.topStripColor || '#101010', s.topStripTextColor || '#FFFFFF', alignAttr) : '';
  const bottomStrip = s.showBottomStrip ? heroStrip(s.bottomStripText ?? '', s.bottomStripColor || '#101010', s.bottomStripTextColor || '#FFFFFF', alignAttr) : '';

  const logoSrc = s.showLogo ? brandSrc(settings, 'logo', resolve) ?? resolve(settings.logoImageId) : null;
  const logo = logoSrc
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${alignAttr}" style="margin-bottom:${SPACE.md}px;"><tr><td><img src="${esc(
        logoSrc
      )}" alt="${esc(settings.companyName)}" width="${s.logoWidth || 120}" style="display:block;border:0;height:auto;"></td></tr></table>`
    : '';

  const badge = heroPill(s.badge ?? '', chipBg, chipFg, alignAttr, `margin-bottom:${SPACE.sm}px;`, RADIUS.pill);
  const notice = heroPill(s.noticeText ?? '', chipBg, chipFg, alignAttr, `margin-top:${SPACE.md}px;`, RADIUS.sm);

  const titleSize = layout === 'minimal' ? TYPE.h2 : layout === 'editorial' ? TYPE.display : TYPE.h1;
  const title = s.title
    ? `<h1 class="title"${ed('title')} style="margin:0;font-family:${FONT};font-size:${titleSize.size}px;line-height:${titleSize.lh}px;font-weight:bold;color:${heading};letter-spacing:${titleSize.tracking}px;">${rich(
        s.title
      )}</h1>`
    : '';

  const subtitle =
    s.showSubtitle && s.subtitle
      ? `<p${ed('subtitle')} style="margin:${SPACE.sm}px 0 0;font-family:${FONT};font-size:${TYPE.bodyLg.size}px;line-height:${TYPE.bodyLg.lh}px;color:${bodyColor};">${rich(
          s.subtitle
        )}</p>`
      : '';

  const description = s.description
    ? `<p${ed('description')} style="margin:${SPACE.sm}px 0 0;font-family:${FONT};font-size:${TYPE.body.size}px;line-height:${TYPE.body.lh}px;color:${bodyColor};">${rich(
        s.description
      )}</p>`
    : '';

  const divider = s.showDivider
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${alignAttr}" style="margin-top:${SPACE.md}px;"><tr><td style="border-top:3px solid ${chipBg};font-size:0;line-height:0;width:56px;">&nbsp;</td></tr></table>`
    : '';

  const ctas = [
    s.ctaText ? { text: s.ctaText, url: s.ctaUrl ?? '', bg: chipBg, fg: chipFg } : null,
    s.secondaryCtaText ? { text: s.secondaryCtaText, url: s.secondaryCtaUrl ?? '', bg: 'transparent', fg: heading } : null,
  ].filter(Boolean) as { text: string; url: string; bg: string; fg: string }[];

  const ctaRow = ctas.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${alignAttr}" style="margin-top:${SPACE.md}px;"><tr>${ctas
        .map(
          (c) =>
            `<td style="padding-right:10px;"><a href="${esc(c.url || '#')}" target="_blank" style="display:inline-block;background:${
              c.bg
            };border:1px solid ${c.bg === 'transparent' ? c.fg : c.bg};color:${c.fg};font-family:${FONT};font-size:14px;font-weight:bold;text-decoration:none;padding:12px 26px;border-radius:${RADIUS.sm}px;">${esc(
              c.text
            )}</a></td>`
        )
        .join('')}</tr></table>`
    : '';

  const imgSrc = resolve(s.imageId ?? null);
  const image = imgSrc
    ? `<img src="${esc(imgSrc)}" alt="${esc(s.title)}" width="100%" style="display:block;width:100%;max-width:100%;height:auto;">`
    : '';

  const body = `${logo}${badge}${title}${subtitle}${description}${divider}${notice}${ctaRow}`;
  const bodyCell = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};${
    style.fullBleed ? '' : radiusCss
  }"><tr><td style="padding:${pad};text-align:${align};">${body}</td></tr></table>`;

  // --- layouts -------------------------------------------------------------
  let core: string;
  switch (layout) {
    case 'imageSide':
      // Text and image side by side, stacking on mobile.
      core = image
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};${
            style.fullBleed ? '' : radiusCss
          }"><tr>
            <td class="stack" width="56%" valign="middle" style="padding:${pad};text-align:${align};">${body}</td>
            <td class="stack" width="44%" valign="middle" style="font-size:0;line-height:0;">${image}</td>
          </tr></table>`
        : bodyCell;
      break;

    case 'imageBelow':
      core = bodyCell + (image ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size:0;line-height:0;">${image}</td></tr></table>` : '');
      break;

    case 'imageAbove':
      core = (image ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size:0;line-height:0;">${image}</td></tr></table>` : '') + bodyCell;
      break;

    case 'classic':
    case 'stripBanner':
    case 'minimal':
    case 'dark':
    case 'editorial':
    default:
      core = bodyCell;
      break;
  }

  const wrapCss = style.fullBleed ? '' : `border-radius:${s.borderRadius ?? RADIUS.lg}px;overflow:hidden;`;
  if (!topStrip && !bottomStrip) {
    return style.fullBleed
      ? core
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${wrapCss}"><tr><td style="font-size:0;line-height:0;">${core}</td></tr></table>`;
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${wrapCss}"><tr><td style="font-size:0;line-height:0;">${topStrip}${core}${bottomStrip}</td></tr></table>`;
}

function renderContentBody(s: ContentSection, t: ThemeTokens): string {
  const para = (txt: string) =>
    `<p${ed(s.bodyType === 'paragraph' || s.bodyType === 'mixed' ? 'paragraph' : 'paragraph')} style="margin:${SPACE.md}px 0 0;font-family:${FONT};font-size:${TYPE.bodyLg.size}px;line-height:${TYPE.bodyLg.lh}px;color:${t.text};text-align:left;">${rich(txt)}</p>`;

  if (s.bodyType === 'paragraph') return para(s.paragraph);

  const rows = s.items
    .map((item, i) => {
      const marker = s.bodyType === 'numbered' ? `${i + 1}.` : '&bull;';
      return `<tr><td valign="top" width="22" style="font-family:${FONT};font-size:${TYPE.bodyLg.size}px;line-height:28px;color:${t.heading};">${marker}</td><td style="font-family:${FONT};font-size:${TYPE.bodyLg.size}px;line-height:28px;color:${t.text};text-align:left;padding-bottom:${SPACE.xs}px;"${ed(`items.${i}`)}>${rich(
        item
      )}</td></tr>`;
    })
    .join('');
  const list = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:${SPACE.md}px;">${rows}</table>`;
  if (s.bodyType === 'mixed') return (s.paragraph ? para(s.paragraph) : '') + list;
  return list;
}

function renderContent(s: ContentSection, t: ThemeTokens, ownCard: boolean): string {
  const sub = s.subheading
    ? `<p${ed('subheading')} style="margin:${SPACE.sm}px 0 0;font-family:${FONT};font-size:${TYPE.small.size}px;line-height:${TYPE.small.lh}px;color:${t.muted};text-align:left;">${rich(
        s.subheading
      )}</p>`
    : '';
  return card(`${sectionHeading(s.icon, s.heading, t)}${sub}${renderContentBody(s, t)}`, t, ownCard);
}

function renderInfoCard(s: InfoCardSection, t: ThemeTokens, ownCard: boolean): string {
  return card(`
    <div${ed('heading')} style="font-family:${FONT};font-size:${TYPE.h4.size}px;font-weight:700;letter-spacing:.5px;color:${t.heading};margin-bottom:${SPACE.sm}px;">${esc(
    s.heading.toUpperCase()
  )}</div>
    <div style="background:${s.backgroundColor || t.surfaceAlt};border-radius:${RADIUS.md}px;padding:${SPACE.lg - 4}px;border-left:4px solid ${
    s.borderColor || t.accent
  };text-align:left;">
      <p style="margin:0;font-family:${FONT};font-size:${TYPE.bodyLg.size}px;line-height:${TYPE.bodyLg.lh}px;color:${t.text};text-align:left;"${ed('text')}>${rich(
    s.text
  )}</p>
    </div>
  `, t, ownCard);
}

function mythFactRow(text: string, isMyth: boolean): string {
  const bg = isMyth ? '#E14B4B' : '#2E9E4E';
  const symbol = isMyth ? '&#10005;' : '&#10003;';
  const color = isMyth ? '#7A2323' : '#1F5C31';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr>
    <td valign="top" width="30" style="padding-top:1px;"><div style="width:22px;height:22px;border-radius:50%;background:${bg};text-align:center;line-height:22px;"><span style="font-family:${FONT};font-size:13px;font-weight:bold;color:#ffffff;">${symbol}</span></div></td>
    <td valign="top" style="font-family:${FONT};font-size:14.5px;line-height:22px;color:${color};text-align:left;">${nl2br(text)}</td>
  </tr></table>`;
}

function renderMythFact(s: MythFactSection, t: ThemeTokens, ownCard: boolean): string {
  const mythRows = s.myths.map((m) => mythFactRow(m, true)).join('');
  const factRows = s.facts.map((f) => mythFactRow(f, false)).join('');
  const intro = (txt: string, top: number) =>
    `<p style="margin:${top}px 0 0;font-family:${FONT};font-size:${TYPE.small.size}px;line-height:${TYPE.small.lh}px;color:${t.muted};text-align:left;">${esc(
      txt
    )}</p>`;
  return card(`
    ${sectionHeading('warning', s.heading, t)}
    ${intro(s.mythsIntro, SPACE.md)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:${SPACE.sm}px;background:#FDECEC;border:1px solid #F4C6C6;border-radius:${RADIUS.md}px;"><tr><td style="padding:${SPACE.md}px ${SPACE.md + 2}px ${SPACE.xxs}px;">${mythRows}</td></tr></table>
    ${spacer(SPACE.md)}
    ${intro(s.factsIntro, 0)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:${SPACE.sm}px;background:#EAF7ED;border:1px solid #BFE4C8;border-radius:${RADIUS.md}px;"><tr><td style="padding:${SPACE.md}px ${SPACE.md + 2}px ${SPACE.xxs}px;">${factRows}</td></tr></table>
  `, t, ownCard);
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

function renderCTA(s: CTASection, t: ThemeTokens, ownCard: boolean): string {
  const btnTextColor = isDark(s.buttonColor) ? '#FFFFFF' : '#111111';
  const chrome = ownCard ? `border:1px solid ${t.border};border-radius:${RADIUS.md}px;background:${t.cardBg};` : '';
  const innerPad = ownCard ? `${SPACE.lg}px ${SPACE.lg}px ${SPACE.lg + 2}px` : '0';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${chrome}"><tr><td style="padding:${innerPad};">
    <div${ed('heading')} style="font-family:${FONT};font-size:${TYPE.h3.size}px;line-height:${TYPE.h3.lh}px;font-weight:700;letter-spacing:.8px;color:${t.heading};text-align:center;text-transform:uppercase;margin-bottom:${SPACE.xs}px;">${rich(
    s.heading
  )}</div>
    <p${ed('description')} style="margin:0 auto;max-width:460px;font-family:${FONT};font-size:${TYPE.body.size}px;line-height:${TYPE.body.lh}px;color:${t.muted};text-align:center;">${rich(
    s.description
  )}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding-top:${SPACE.lg - 4}px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(
        s.buttonUrl
      )}" style="height:44px;v-text-anchor:middle;width:190px;" arcsize="24%" stroke="f" fillcolor="${s.buttonColor}">
        <w:anchorlock/><center style="color:${btnTextColor};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${esc(s.buttonText)}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-- -->
      <a href="${esc(s.buttonUrl)}" target="_blank" style="display:inline-block;background:${s.buttonColor};color:${btnTextColor};font-family:${FONT};font-size:15px;font-weight:bold;text-decoration:none;padding:13px 32px;border-radius:${RADIUS.sm}px;">${esc(
    s.buttonText
  )}</a>
      <!--<![endif]-->
    </td></tr></table>
  </td></tr></table>`;
}

function renderStats(s: StatsSection, t: ThemeTokens, ownCard: boolean): string {
  const shown = s.metrics.filter((m) => m.show).slice(0, 4);
  const width = shown.length > 0 ? Math.floor(100 / shown.length) : 25;
  const cells = shown
    .map(
      (m) =>
        `<td width="${width}%" align="center" class="stat-cell" style="padding-bottom:${SPACE.sm}px;"><div style="font-family:${FONT};font-size:26px;line-height:32px;font-weight:bold;color:${t.heading};">${esc(
          m.number
        )}</div><div style="font-family:${FONT};font-size:${TYPE.caption.size}px;line-height:${TYPE.caption.lh}px;color:${t.muted};margin-top:${SPACE.xxs}px;">${esc(
          m.label
        )}</div></td>`
    )
    .join('');
  const chrome = ownCard ? `border:1px solid ${t.border};border-radius:${RADIUS.md}px;background:${t.cardBg};` : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${chrome}"><tr><td style="padding:${ownCard ? CARD_PADDING : 0}px;">
    <div style="font-family:${FONT};font-size:${TYPE.eyebrow.size}px;font-weight:bold;letter-spacing:1px;color:${t.heading};text-align:center;margin-bottom:${SPACE.lg - 4}px;">${esc(
    s.heading.toUpperCase()
  )}</div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>
  </td></tr></table>`;
}

/**
 * About block — rebuilt to match the reference newsletter's structure.
 * Every element is individually toggleable and the whole thing follows the
 * block's theme, so it works on dark, light, grey or yellow.
 */
function renderAbout(s: AboutSection, settings: GlobalSettings, resolve: ImageResolver, t: ThemeTokens): string {
  const logoSrc = brandSrc(settings, 'logo', resolve) ?? resolve(settings.logoImageId);
  const showLogo = s.showLogo !== false;
  const showDivider = s.showDivider !== false;
  const showContact = s.showContact !== false;
  const showPhones = s.showPhones !== false;
  const showEmail = s.showEmail !== false;
  const logoWidth = s.logoWidth || 96;

  const logo =
    showLogo && logoSrc
      ? `<img src="${esc(logoSrc)}" alt="${esc(settings.companyName)}" width="${logoWidth}" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">`
      : '';

  // Label and logo sit on one baseline, as in the reference.
  const headRow = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      ${
        s.heading
          ? `<td valign="middle" style="font-family:${FONT};font-size:${TYPE.eyebrow.size}px;font-weight:bold;letter-spacing:1px;color:${t.heading};padding-right:10px;">${esc(
              s.heading.toUpperCase()
            )}</td>`
          : ''
      }
      ${logo ? `<td valign="middle">${logo}</td>` : ''}
    </tr></table>`;

  const description = s.description
    ? `<p${ed('description')} style="margin:${SPACE.sm}px 0 0;font-family:${FONT};font-size:${TYPE.small.size}px;line-height:${TYPE.small.lh + 1}px;color:${t.text};text-align:left;">${rich(
        s.description
      )}</p>`
    : '';

  const divider = showDivider
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:${SPACE.md}px;"><tr><td style="border-top:1px solid ${t.divider};font-size:0;line-height:0;">&nbsp;</td></tr></table>`
    : '';

  const phones =
    showPhones && settings.phones.length
      ? settings.phones
          .map(
            (p) =>
              `<div style="font-family:${FONT};font-size:${TYPE.small.size}px;font-weight:bold;line-height:24px;color:${t.text};">${esc(
                p.label
              )} : ${esc(p.number)}</div>`
          )
          .join('')
      : '';

  // Optional CTA button inside the contact area — reference uses a phone pill.
  const ctaBtn =
    s.showCta && s.ctaText
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:${SPACE.sm}px auto 0;"><tr><td style="background:${t.accent};border-radius:${RADIUS.pill}px;">
          <a href="${esc(s.ctaUrl || '#')}" target="_blank" style="display:inline-block;padding:12px 26px;font-family:${FONT};font-size:${TYPE.small.size}px;font-weight:bold;color:${t.accentText};text-decoration:none;">${esc(
          s.ctaText
        )}</a>
        </td></tr></table>`
      : '';

  const email =
    showEmail && settings.email
      ? `<div style="margin-top:${SPACE.sm}px;font-family:${FONT};font-size:${TYPE.small.size}px;line-height:20px;color:${t.text};"><b>EMAIL ID:</b> <a href="mailto:${esc(
          settings.email
        )}" style="color:${t.text};font-weight:bold;text-decoration:none;">${esc(settings.email)}</a></div>`
      : '';

  const contact =
    showContact && (phones || email || ctaBtn)
      ? `<div style="text-align:center;margin-top:${SPACE.md}px;">
      ${
        s.contactLabel !== ''
          ? `<div style="font-family:${FONT};font-size:${TYPE.eyebrow.size}px;font-weight:bold;letter-spacing:1px;color:${t.heading};margin-bottom:${SPACE.xs}px;">${esc(
              (s.contactLabel || 'CONTACT').toUpperCase()
            )}</div>`
          : ''
      }
      ${phones}
      ${ctaBtn}
      ${email}
    </div>`
      : '';

  return `${headRow}${description}${divider}${contact}`;
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
    ? `<div${ed('heading')} style="font-family:${FONT};font-size:${h.size}px;line-height:${h.lineHeight}px;font-weight:${
        s.headingWeight === 'bold' ? 700 : 400
      };color:${t.text};">${rich(s.heading)}</div>`
    : '';
  const sub = s.subheading
    ? `<p${ed('subheading')} style="margin:8px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:${t.muted};">${rich(
        s.subheading
      )}</p>`
    : '';
  const body = s.body
    ? `<p${ed('body')} style="margin:14px 0 0;font-family:${FONT};font-size:15px;line-height:26px;color:${t.text};text-align:left;">${rich(
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
        ? `<div${ed(`items.${i}.title`)} style="font-family:${FONT};font-size:15px;font-weight:700;color:${t.text};">${rich(item.title)}</div>`
        : '';
      const text = item.text
        ? `<div${ed(`items.${i}.text`)} style="font-family:${FONT};font-size:14.5px;line-height:23px;color:${t.text};${
            title ? 'margin-top:4px;' : ''
          }">${rich(item.text)}</div>`
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
      (i, idx) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-bottom:1px solid ${t.border};">
        <tr><td style="padding-bottom:12px;">
          <div${ed(`items.${idx}.question`)} style="font-family:${FONT};font-size:15px;font-weight:700;color:${t.text};">${rich(i.question)}</div>
          ${i.answer ? `<p${ed(`items.${idx}.answer`)} style="margin:8px 0 0;font-family:${FONT};font-size:14.5px;line-height:23px;color:${t.muted};">${rich(i.answer)}</p>` : ''}
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

/**
 * Footer block — the static page footer promoted to a real, reusable section
 * so it can be themed, reordered and edited like anything else. Offices,
 * social row, legal line and unsubscribe are each individually toggleable.
 */
/**
 * Header block — replaces the hardcoded dark bar so background, logo, brand
 * text and tagline are all editable. The theme drives the colours, so
 * switching the block's Theme in the Design tab recolours everything at once.
 */
function renderHeader(s: HeaderSection, settings: GlobalSettings, resolve: ImageResolver, t: ThemeTokens): string {
  const bg = s.backgroundColor || t.bg;
  const logoSrc = s.showLogo !== false ? brandSrc(settings, 'logo', resolve) ?? resolve(settings.logoImageId) : null;

  const logo = logoSrc
    ? `<img src="${esc(logoSrc)}" alt="${esc(settings.companyName)}" width="${s.logoWidth || 120}" style="display:block;border:0;height:auto;margin:0 auto;">`
    : '';

  const brand = s.showBrandText !== false && s.brandText
    ? `<div${ed('brandText')} style="font-family:${FONT};font-weight:bold;color:${t.heading};font-size:${TYPE.h3.size}px;line-height:${TYPE.h3.lh}px;${logo ? `margin-top:${SPACE.xs}px;` : ''}">${rich(
        s.brandText
      )}</div>`
    : '';

  const tagline = s.showTagline && s.tagline
    ? `<div${ed('tagline')} style="font-family:${FONT};font-size:${TYPE.caption.size}px;color:${t.muted};margin-top:${SPACE.xxs}px;">${rich(
        s.tagline
      )}</div>`
    : '';

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};"><tr><td align="center" style="padding:${SPACE.md - 2}px 28px;text-align:center;">${logo}${brand}${tagline}</td></tr></table>`;
}

function renderFooter(s: FooterSection, settings: GlobalSettings, resolve: ImageResolver, t: ThemeTokens): string {
  const offices = s.showOffices !== false && settings.offices.length
    ? settings.offices
        .map(
          (o, i) =>
            `<td width="${Math.floor(100 / settings.offices.length)}%" valign="top" align="left" class="stack ${
              i === 0 ? 'addr-first' : 'addr-rest'
            }"><div style="font-family:${FONT};font-size:${TYPE.caption.size}px;font-weight:bold;letter-spacing:.4px;color:${t.heading};margin-bottom:${SPACE.xs}px;text-align:left;">${esc(
              o.label.toUpperCase()
            )}</div><div style="font-family:${FONT};font-size:${TYPE.caption.size - 0.5}px;line-height:19px;color:${t.text};text-align:left;">${nl2br(
              o.address
            )}</div></td>`
        )
        .join('')
    : '';

  const officeRow = offices
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${offices}</tr></table>`
    : '';

  const rule = () =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${SPACE.md}px 0;"><tr><td style="border-top:1px solid ${t.divider};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

  const socialLinks =
    s.showSocial !== false && settings.social.length
      ? `<div${ed('socialLabel')} style="font-family:${FONT};font-size:${TYPE.caption.size}px;font-weight:bold;color:${t.heading};margin-bottom:${SPACE.xs + 2}px;text-align:center;">${esc(
          (s.socialLabel || 'FIND US ON').toUpperCase()
        )}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${settings.social
        .map((x) => `<td style="padding:0 6px;">${socialBadge(x.platform, x.url, settings, resolve)}</td>`)
        .join('')}</tr></table>`
      : '';

  const contactBits: string[] = [];
  if (s.showWebsite && settings.websiteUrl)
    contactBits.push(
      `<a href="${esc(settings.websiteUrl)}" style="color:${t.text};text-decoration:none;font-weight:bold;">${esc(
        settings.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
      )}</a>`
    );
  if (s.showEmail && settings.email)
    contactBits.push(`<a href="mailto:${esc(settings.email)}" style="color:${t.text};text-decoration:none;">${esc(settings.email)}</a>`);
  if (s.showPhone && settings.phones[0])
    contactBits.push(`<span style="color:${t.text};">${esc(settings.phones[0].number)}</span>`);

  const contactLine = contactBits.length
    ? `<div style="margin-top:${SPACE.sm}px;font-family:${FONT};font-size:${TYPE.caption.size}px;line-height:18px;color:${t.text};text-align:center;">${contactBits.join(
        ' &nbsp;·&nbsp; '
      )}</div>`
    : '';

  const legal = s.showLegal !== false && settings.legalText
    ? `<div${ed('__legal')} style="margin-top:${SPACE.sm}px;font-family:${FONT};font-size:${TYPE.caption.size}px;line-height:18px;color:${t.text};text-align:center;">${esc(
        settings.legalText
      )}</div>`
    : '';

  const disclaimer = s.disclaimer
    ? `<div${ed('disclaimer')} style="margin-top:${SPACE.xs}px;font-family:${FONT};font-size:${TYPE.micro.size}px;line-height:16px;color:${t.muted};text-align:center;">${rich(
        s.disclaimer
      )}</div>`
    : '';

  const unsubscribe = s.showUnsubscribe !== false
    ? `<div style="margin-top:${SPACE.sm}px;text-align:center;"><a${ed('unsubscribeText')} href="${esc(
        s.unsubscribeUrl || '#'
      )}" style="font-family:${FONT};font-size:${TYPE.caption.size}px;color:${t.text};text-decoration:underline;">${esc(
        s.unsubscribeText || 'Unsubscribe'
      )}</a></div>`
    : '';

  const parts = [officeRow, socialLinks ? rule() + socialLinks : '', (legal || disclaimer || contactLine || unsubscribe) ? rule() : '', contactLine, legal, disclaimer, unsubscribe];
  return parts.filter(Boolean).join('');
}

// ---------------------------------------------------------------------------
// Hero layout system
// ---------------------------------------------------------------------------

/** A coloured strip above or below the hero body. */
function heroStrip(text: string, bg: string, fg: string, align: string): string {
  if (!text) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};"><tr><td align="${align}" style="padding:10px 28px;font-family:${FONT};font-size:${TYPE.micro.size}px;font-weight:700;letter-spacing:1.2px;color:${fg};">${esc(
    text.toUpperCase()
  )}</td></tr></table>`;
}

function heroPill(text: string, bg: string, fg: string, align: string, marginCss: string, radius: number): string {
  if (!text) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="${marginCss}"><tr><td style="background:${bg};border-radius:${radius}px;padding:8px 18px;font-family:${FONT};font-size:${TYPE.micro.size}px;font-weight:700;letter-spacing:1.1px;color:${fg};text-align:center;">${esc(
    text.toUpperCase()
  )}</td></tr></table>`;
}

// ---------------------------------------------------------------------------
// Section dispatch
// ---------------------------------------------------------------------------

/** The block's own content, before the shared style / boxes / buttons wrapper. */
function renderSectionInner(section: Section, settings: GlobalSettings, resolve: ImageResolver, t: ThemeTokens): string {
  // If the shared wrapper already paints a surface with padding, the block
  // must not draw a second card inside it.
  const ownCard = !wrapperPaintsCard(styleForType(section.type, section.style));
  switch (section.type) {
    case 'hero':
      return renderHero(section, settings, resolve);
    case 'content':
      return renderContent(section, t, ownCard);
    case 'infoCard':
      return renderInfoCard(section, t, ownCard);
    case 'mythFact':
      return renderMythFact(section, t, ownCard);
    case 'image':
      return renderImage(section, resolve);
    case 'quote':
      return renderQuote(section);
    case 'cta':
      return renderCTA(section, t, ownCard);
    case 'stats':
      return renderStats(section, t, ownCard);
    case 'about':
      return renderAbout(section, settings, resolve, t);
    case 'footer':
      return renderFooter(section, settings, resolve, t);
    case 'header':
      return renderHeader(section, settings, resolve, t);
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
  // One token set drives the block's own content, its boxes and its buttons,
  // so changing Theme recolours all three consistently.
  const t = tokensFor(section.type, section.style);
  const inner = renderSectionInner(section, settings, resolve, t);
  const extras = renderBoxes(section.boxes, t, INTERACTIVE) + renderButtonGroup(section.buttons, t);
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

export function generateHTML(
  newsletter: Newsletter,
  settings: GlobalSettings,
  resolve: ImageResolver,
  opts: GenerateOptions = {}
): string {
  const interactive = opts.interactive === true;
  INTERACTIVE = interactive;
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
    const raw = renderSection(s, settings, resolve);
    if (!raw) return;
    // In preview mode each section gets an addressable wrapper so the canvas
    // can outline it, select it and drag it. Absent from the export.
    const html = interactive
      ? `<div ${CANVAS_ATTR}="${s.id}" data-nl-label="${esc(SECTION_LABELS[s.type] ?? s.type)}">${raw}</div>`
      : raw;
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

  // Header and footer are now real, editable blocks. When present, they replace
  // the corresponding hardcoded HTML below. Anything saved before either block
  // existed keeps the built-in fallback so nothing is silently lost.
  const hasHeaderBlock = newsletter.sections.some((x) => x.type === 'header' && x.visible);
  const hasFooterBlock = newsletter.sections.some((x) => x.type === 'footer' && x.visible);
  const builtInFooter = hasFooterBlock
    ? ''
    : `<tr><td align="center" style="padding:22px 28px 30px;">
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
        </td></tr>`;

  return `<!DOCTYPE html>
<html lang="en"${interactive && opts.selectedId ? ` data-nl-selected="${esc(opts.selectedId)}"` : ''} xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
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
  ${interactive ? canvasStyles() : ''}
</head>
<body style="margin:0;padding:0;background:#EDEFF3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EDEFF3;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);">

        ${hasHeaderBlock ? '' : `<tr><td class="px" style="background:#101010;padding:16px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
          <a href="${esc(settings.websiteUrl)}" target="_blank" style="text-decoration:none;border:0;">${logo}</a>
        </td></tr></table></td></tr>`}

        ${sectionsHtml}

        ${builtInFooter}

      </table>
    </td></tr>
  </table>
  ${interactive ? canvasScript() : ''}
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
