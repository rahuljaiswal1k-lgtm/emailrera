// ============================================================================
// Container boxes — styled sub-containers that can be dropped INSIDE any block.
//
// This is what lifts a section beyond "a heading and some text": a Content
// block can now carry a warning strip, a checklist card and a quote card
// without needing three separate sections.
//
// Like buttons, `boxes` is optional on a section, so older newsletters simply
// render no boxes.
// ============================================================================

import { nanoid } from './id';
import { esc, nl2br, EMAIL_FONT } from './htmlEscape';
import { getIcon } from '../data/icons';

export type BoxKind =
  | 'info'
  | 'warning'
  | 'success'
  | 'highlight'
  | 'dark'
  | 'yellow'
  | 'outline'
  | 'callout'
  | 'quote'
  | 'feature'
  | 'checklist'
  | 'mini';

export interface ContainerBox {
  id: string;
  kind: BoxKind;
  title: string;
  text: string;
  /** Icon library key. Empty string hides the icon. */
  icon: string;
  /** Used by checklist / feature kinds. */
  items: string[];
  /** Overrides — empty/0 means "use the kind's preset". */
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  borderRadius: number;
  padding: number;
}

interface BoxPreset {
  label: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
  /** Thick left rule, as used by callout strips. */
  leftRule: boolean;
  radius: number;
  padding: number;
}

export const BOX_PRESETS: Record<BoxKind, BoxPreset> = {
  info: { label: 'Information Box', bg: '#EEF4FF', border: '#C9DBFB', text: '#22324D', accent: '#2F6BD8', leftRule: true, radius: 14, padding: 20 },
  warning: { label: 'Warning Box', bg: '#FEF6E7', border: '#F5D69B', text: '#5C4413', accent: '#D9911B', leftRule: true, radius: 14, padding: 20 },
  success: { label: 'Success Box', bg: '#EAF7ED', border: '#BFE4C8', text: '#1F5C31', accent: '#2E9E4E', leftRule: true, radius: 14, padding: 20 },
  highlight: { label: 'Highlighted Box', bg: '#F3F4F6', border: '#E3E6EC', text: '#333333', accent: '#FFDA4B', leftRule: true, radius: 14, padding: 20 },
  dark: { label: 'Dark Box', bg: '#1D1F1F', border: '#1D1F1F', text: '#FFFFFF', accent: '#FFDA4B', leftRule: false, radius: 14, padding: 22 },
  yellow: { label: 'Yellow Box', bg: '#FFDA4B', border: '#E9C43C', text: '#1D1F1F', accent: '#1D1F1F', leftRule: false, radius: 14, padding: 22 },
  outline: { label: 'Outline Box', bg: 'transparent', border: '#1D1F1F', text: '#1A1A1A', accent: '#1D1F1F', leftRule: false, radius: 14, padding: 20 },
  callout: { label: 'Callout Card', bg: '#FFFBEC', border: '#F2E0A8', text: '#4A421F', accent: '#D9911B', leftRule: true, radius: 12, padding: 18 },
  quote: { label: 'Quote Card', bg: '#1C1C1C', border: '#1C1C1C', text: '#F2F2F2', accent: '#FFDA4B', leftRule: false, radius: 14, padding: 24 },
  feature: { label: 'Feature Card', bg: '#FFFFFF', border: '#D9DDE3', text: '#1A1A1A', accent: '#1D1F1F', leftRule: false, radius: 16, padding: 22 },
  checklist: { label: 'Checklist Card', bg: '#FFFFFF', border: '#D9DDE3', text: '#1A1A1A', accent: '#2E9E4E', leftRule: false, radius: 16, padding: 22 },
  mini: { label: 'Mini Card', bg: '#F7F8FA', border: '#E3E6EC', text: '#333333', accent: '#1D1F1F', leftRule: false, radius: 10, padding: 14 },
};

export const BOX_KINDS = Object.keys(BOX_PRESETS) as BoxKind[];

export function createBox(kind: BoxKind = 'info'): ContainerBox {
  return {
    id: nanoid(),
    kind,
    title: BOX_PRESETS[kind].label,
    text: 'Add the detail you want to call out here.',
    icon: '',
    items: kind === 'checklist' || kind === 'feature' ? ['First item', 'Second item'] : [],
    backgroundColor: '',
    borderColor: '',
    textColor: '',
    borderRadius: 0,
    padding: 0,
  };
}

function iconBadge(iconKey: string, bg: string): string {
  const icon = getIcon(iconKey);
  return `<div style="width:34px;height:34px;border-radius:50%;background:${bg};text-align:center;line-height:34px;"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">${icon.svg}</svg></div>`;
}

function checkRow(text: string, accent: string, color: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;"><tr>
    <td valign="top" width="26" style="padding-top:2px;"><div style="width:18px;height:18px;border-radius:50%;background:${accent};text-align:center;line-height:18px;"><span style="font-family:${EMAIL_FONT};font-size:11px;font-weight:bold;color:#ffffff;">&#10003;</span></div></td>
    <td valign="top" style="font-family:${EMAIL_FONT};font-size:14.5px;line-height:22px;color:${color};">${nl2br(text)}</td>
  </tr></table>`;
}

export function renderBox(box: ContainerBox): string {
  const preset = BOX_PRESETS[box.kind] ?? BOX_PRESETS.info;
  const bg = box.backgroundColor || preset.bg;
  const border = box.borderColor || preset.border;
  const color = box.textColor || preset.text;
  const radius = box.borderRadius || preset.radius;
  const padding = box.padding || preset.padding;

  const bgCss = bg === 'transparent' ? '' : `background:${bg};`;
  const leftRuleCss = preset.leftRule ? `border-left:4px solid ${preset.accent};` : '';

  const title = box.title
    ? `<div style="font-family:${EMAIL_FONT};font-size:15px;font-weight:700;color:${color};margin-bottom:8px;">${esc(
        box.title
      )}</div>`
    : '';

  const text = box.text
    ? `<p style="margin:0;font-family:${EMAIL_FONT};font-size:14.5px;line-height:23px;color:${color};">${nl2br(
        box.text
      )}</p>`
    : '';

  let items = '';
  if (box.items.length > 0) {
    if (box.kind === 'checklist') {
      items = box.items.filter(Boolean).map((i) => checkRow(i, preset.accent, color)).join('');
    } else {
      items = box.items
        .filter(Boolean)
        .map(
          (i) =>
            `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr><td valign="top" width="18" style="font-family:${EMAIL_FONT};font-size:14.5px;line-height:22px;color:${preset.accent};">&bull;</td><td style="font-family:${EMAIL_FONT};font-size:14.5px;line-height:22px;color:${color};">${nl2br(
              i
            )}</td></tr></table>`
        )
        .join('');
    }
  }

  // Quote boxes get an oversized opening mark instead of an icon badge.
  if (box.kind === 'quote') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${bgCss}border:1px solid ${border};border-radius:${radius}px;margin-top:14px;">
      <tr><td style="padding:${padding}px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:28px;color:${preset.accent};">&ldquo;</div>
        ${text}
        ${box.title ? `<div style="margin-top:12px;font-family:${EMAIL_FONT};font-size:13px;font-weight:700;color:${preset.accent};">${esc(box.title)}</div>` : ''}
      </td></tr>
    </table>`;
  }

  const body = `${title}${text}${items}`;

  if (box.icon) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${bgCss}border:1px solid ${border};${leftRuleCss}border-radius:${radius}px;margin-top:14px;">
      <tr><td style="padding:${padding}px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="top" width="46">${iconBadge(box.icon, preset.accent)}</td>
          <td valign="top">${body}</td>
        </tr></table>
      </td></tr>
    </table>`;
  }

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${bgCss}border:1px solid ${border};${leftRuleCss}border-radius:${radius}px;margin-top:14px;">
    <tr><td style="padding:${padding}px;">${body}</td></tr>
  </table>`;
}

export function renderBoxes(boxes: ContainerBox[] | undefined): string {
  if (!boxes || boxes.length === 0) return '';
  return boxes.map(renderBox).join('');
}
