import type { ParagraphSection } from '../../../../types/newsletter';
import { useNewsletterStore } from '../../../../store/useNewsletterStore';
import { FieldGroup, TextAreaField } from '../../../shared/FormFields';

/**
 * A dead-simple paragraph section. Content-tab shows one big text area so
 * you can bulk-paste; canvas editing is the richer surface (bullets,
 * numbering, alignment, per-field font/size/colour via the floating
 * toolbar). Rich formatting typed in the text area shows up literally
 * — use the canvas to format visually.
 */
export function ParagraphFields({ section }: { section: ParagraphSection }) {
  const update = useNewsletterStore((s) => s.updateSection);

  return (
    <>
      <FieldGroup label="Paragraph text" hint="Click into the text on the canvas for rich formatting, bullets, and numbered lists">
        <TextAreaField
          value={stripTags(section.body)}
          onChange={(body) => update(section.id, { body })}
          rows={10}
        />
      </FieldGroup>
    </>
  );
}

/** For the sidebar editor, strip inline formatting tags so users see plain
 * text. When they save from here we keep the plain form — richer edits
 * happen on the canvas. */
function stripTags(html: string): string {
  return (html ?? '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:li|p|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}
