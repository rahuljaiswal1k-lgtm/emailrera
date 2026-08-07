# RERA Easy Newsletter Builder

A no-code, internal newsletter builder. Non-technical staff build newsletters with forms,
drag-and-drop section ordering, and a live preview — then export production-ready,
Gmail/Outlook-safe HTML + images as a ZIP. No HTML or CSS knowledge required.

Built to match the structure of the existing hand-coded template 1:1 — the generated
`index.html` uses the same table-based layout, inline CSS, and MSO/Outlook fallbacks as
the original.

## Live app

**https://rahuljaiswal1k-lgtm.github.io/emailrera/**

Every push to `main` rebuilds and redeploys the site automatically
(`.github/workflows/deploy.yml`). See **Deployment** below.

## Quick Start

```bash
npm install
npm run dev       # http://localhost:5173/emailrera/
```

To build a static production copy of the *builder app itself* (not a newsletter):

```bash
npm run build      # outputs to dist/
npm run preview    # serve that build locally to sanity-check it
```

Everything runs entirely in the browser — there is no backend and nothing is sent to a
server. Newsletters, images, and settings are saved locally (see **Data storage** below).

## Deployment

The app is a static SPA with no server side, so GitHub Pages hosts it as-is.

- **Workflow**: `.github/workflows/deploy.yml` runs on every push to `main`. It installs
  with `npm ci`, lints, type-checks + builds, and publishes `dist/` to Pages.
- **One-time setup (required once)**: in **Settings → Pages**, set *Source* to
  **GitHub Actions**, then re-run the workflow from the Actions tab. The workflow cannot
  do this for itself — creating the Pages site needs repo-admin scope, which the
  built-in `GITHUB_TOKEN` deliberately does not have.
- **Base path**: because this is a *project* site the app is served from `/emailrera/`,
  not `/`. `vite.config.ts` sets `base` accordingly, and the workflow passes
  `BASE_PATH=/<repo-name>/` so renaming the repo does not break asset URLs.
- **Custom domain**: set `BASE_PATH=/` (add a `CNAME` file to `public/` with your domain,
  and point the DNS record at GitHub Pages).

## What's implemented (maps to the requirement doc's modules)

- **Module 1 — Dashboard**: create, open, duplicate, delete newsletters.
- **Module 2 — Newsletter Editor**: three-pane layout (section list / live preview /
  properties), matching the doc's wireframe.
- **Module 3 — Dynamic Sections**: all 9 in-scope section types — Hero, Standard Content
  (paragraph/bullets/numbered/mixed), Information Card, Myth vs Fact (unlimited
  myths/facts), Image (Full / Left+Text / Right+Text / Two Images / Grid / None),
  Quote/Insight, CTA, Statistics (unlimited metrics, max 4 shown at once, reorderable),
  About RERA Easy. *(Section Type 5, "Comparison Section," was explicitly marked "Future
  use" in the doc and is not built — see Roadmap below.)*
- **Module 4 — Icon Management**: a built-in icon library (Documentation, Legal, Warning,
  Construction, Growth, Insight, Marketing, Statistics). Users only ever pick from a
  dropdown grid — no SVG is ever hand-edited.
- **Module 5 — Template Library**: 6 starter templates (Judgment Newsletter, Myths vs
  Facts, Compliance Alert, Developer Advisory, Educational Newsletter, News Update), plus
  a blank starting point.
- **Module 6 — Save Draft**: newsletters autosave as you edit (debounce-free — every
  change persists immediately) and can be duplicated or reopened later.
- **Module 7 — Live HTML Generation**: table-based, inline-CSS, Gmail/Outlook-compatible,
  mobile-responsive HTML, generated instantly as you edit and shown in the live preview
  iframe.
- **Module 8 — Export System**: "Generate Newsletter" produces `newsletter.zip`
  containing `index.html` + an `images/` folder with sequentially renamed images
  (`image1.jpg`, `image2.png`, …), with every `<img src>` correctly pointing at them.
- **Module 9 — Import Existing Newsletter**: newsletters exported from this tool embed a
  hidden `data.json` metadata file inside the ZIP. Re-uploading that ZIP via "Import"
  restores every field, section, and image with full editability.
- **Module 10 — Global Settings**: company name, logo, phone numbers, email, office
  addresses, social links, and footer legal text — auto-applied to the header logo and
  footer of every newsletter.

## Roadmap / intentionally deferred

These were marked optional or "future" in the requirement doc and were left out to keep
this build focused and solid:

- **Comparison Section** (Section Type 5) — doc marked this "Future use."
- **AI Assistance**, **HTML email client preview simulator** (Gmail/Outlook/mobile
  screenshots), and **multi-brand support** — all listed under "Future Features
  (Optional)" in the doc.
- A real backend — the doc explicitly says this is optional and the app "can work
  client-side," which is how it's built. If you later want multi-user shared drafts,
  Node/Express + a database is the natural next step; the store layer
  (`src/lib/storage.ts`) is small and isolated, so swapping local storage for API calls
  is a contained change.

## Notable implementation choices (where this deviates from the doc's suggested stack)

- **Drag-and-drop**: used `@dnd-kit` instead of `react-dnd`. Same result (smooth
  pointer-based section reordering), actively maintained, and generally considered the
  modern default for React 18/19 drag-and-drop.
- **Forms**: section fields are plain controlled React inputs bound directly to the
  Zustand store rather than routed through React Hook Form. With 9 differently-shaped
  section types this kept every field's live-preview sync simple and predictable.
  `react-hook-form` is still installed if you want to adopt it for a specific form later
  (e.g. adding real validation).
- **Social icons**: rendered as inline SVG badges rather than referencing
  `images/whatsapp.png` etc., since no such binary assets existed to bundle. This also
  means the exported ZIP never has a "missing icon" risk. ⚠️ **Caveat**: Gmail and
  Outlook strip inline `<svg>` from email bodies, so the footer social badges (and the
  round section-heading icons, which use the same technique) will not appear in those
  clients — they show as blank space, and the surrounding text and links still work. To
  make them render everywhere, the icons need to become hosted PNGs referenced by
  absolute URL. Everything else in the generated HTML is table-based with inline CSS and
  is safe across clients.

- **Empty image slots**: an image section with nothing uploaded renders a dashed
  "No image selected" box in both the live preview and the exported HTML. Nothing ever
  points at an image file that isn't in the ZIP.
- **Image storage**: uploaded images are stored in **IndexedDB** (via `idb-keyval`), not
  localStorage, since localStorage has a ~5–10MB quota that a handful of photos would
  blow through immediately. Newsletter JSON and global settings (small, text-only) use
  localStorage.

## Data storage (all local to the browser)

| What | Where | Notes |
|---|---|---|
| Newsletters (JSON) | `localStorage` | key `reraeasy_newsletters_v1` |
| Global settings | `localStorage` | key `reraeasy_global_settings_v1` |
| Uploaded images | `IndexedDB` | via `idb-keyval`, keyed by image id |

Storage is **per-browser and per-device**: a newsletter drafted on one laptop will not
appear on another, and clearing browser storage/site data for this app erases everything
— there's no cloud copy. Export the ZIP to keep a portable copy (it re-imports with full
editability). If a save ever fails — storage full, or private-browsing mode — the editor
shows a red **Not saved** indicator in the top bar instead of failing silently.

For a shared/multi-person setup, the next step would be swapping `src/lib/storage.ts` for
real API calls against a small backend.

## Theme engine

`lib/blockStyle.ts` resolves a block's theme into a **complete token set** —
`bg`, `cardBg`, `surface`, `heading`, `text`, `muted`, `border`, `divider`,
`accent`, `iconBg`, `iconFg`, `badgeBg`, `boxBg`, `buttonBg` and more. Every
renderer reads those tokens instead of hardcoding hex, which is what makes
switching a section's Theme recolour its heading, body, borders, icons, badges,
container boxes *and* buttons together rather than just the background.

Inheritance rules:

- the theme supplies every token;
- the variant adjusts the surface and border treatment;
- an explicit **Background** override re-derives the readable foreground, so a
  custom dark colour never leaves black text on black;
- an explicit **Text** override cascades to headings and muted text;
- only explicit overrides break inheritance — everything else cascades.

Design scales (radius, spacing, typography, icon and card sizing) live in
`lib/designTokens.ts`, along with 13 **design presets** (Clean, Minimal, Modern,
Corporate, Premium, Government Circular, Compliance Alert, Editorial, Magazine,
Insight, Dark, Luxury, Professional). A preset is a plain `BlockStyle` patch, so
everything stays editable after applying one, and it can be applied to a single
block or to every section at once.

**One card per block.** If the shared wrapper already paints a surface with
padding, the block skips its own card. That is what stops a card-preset Content
section rendering a card inside a card.

## The block design system

Every section is a **block**, and each block composes three shared layers that live
outside its own type. This is the core architectural idea: a new block never has to
reimplement styling, buttons or containers.

| Layer | File | What it gives every block |
|---|---|---|
| **BlockStyle** | `lib/blockStyle.ts` | theme, card variant, background/text/border colours, border width, radius, shadow, padding, space above/below, alignment, section width, separator lines |
| **ButtonGroup** | `lib/blockButtons.ts` | zero or more buttons with variant / size / shape / full-width, group alignment, inline or stacked — on *any* block, not just CTA |
| **ContainerBox[]** | `lib/blockBoxes.ts` | styled sub-containers (information, warning, success, highlight, dark, yellow, outline, callout, quote, feature, checklist, mini) rendered inside the block |

These map directly to the Properties panel's **Design**, **Buttons** and **Boxes** tabs,
which appear for every block type. The **Content** tab is the only per-type editor.

All three are **optional** on a section. A newsletter saved before this system existed
has none of these keys, so `resolveStyle()` falls back to a neutral transparent default
and the section renders exactly as it did before. That backward compatibility is
verified against real pre-upgrade data, not assumed.

### Block library

21 block types cover a much larger set of named components, because several of them
select their component through a *variant* rather than being separate types:

| Block | Covers |
|---|---|
| `textBlock` | Text Block, Section Header (badge, eyebrow, heading size/weight, subheading, accent rule) |
| `boxGroup` | Information Box, Warning Box, Highlight Box, Insight Card, Callout Strip — via ContainerBox kinds |
| `listBlock` | Checklist, Numbered List, Numbered Steps, Timeline, Key Takeaways, Feature List |
| `columns` | Two/Three Column Content, Icon Grid, Metric Cards, Image Cards |
| `faq` | FAQ |
| `comparison` | Comparison Block |
| `testimonial` | Testimonial (centred or photo-beside) |
| `logoStrip` | Logo Strip |
| `gallery` | Image Gallery |
| `divider` | Divider Section, Spacer, dotted rule, labelled rule |
| `ctaBanner` | CTA Banner, CTA Card (centred or split with image) |
| `imageBanner` | Image Banner, Hero Image |
| `footer` | Offices, social row, contact line, legal, disclaimer, unsubscribe |

The **Hero** is a layout system rather than a single shape: `heroLayout` picks
between Classic, Strip Banner, Image beside / above / below text, Minimal, Dark
and Editorial, and every element (top strip, bottom strip, logo, badge, heading,
subtitle, description, notice strip, accent divider, image, primary and
secondary CTA) is independently optional.

The **Footer** is a real block — add it and it replaces the built-in page
footer. Newsletters saved before it existed keep the built-in one, so nothing
loses its footer.

Plus the original nine — Hero, Content, Information Card, Myth vs Fact, Image, Quote,
CTA, Statistics, About — all unchanged and all now able to carry style, buttons and boxes.

### Adding a new block

Four edits, all mechanical:

1. Add the type to the `SectionType` union and an interface to the `Section` union in
   `types/newsletter.ts`.
2. Add a `case` to `createSection()` in `data/sectionDefaults.ts` returning its defaults.
3. Add an entry to `BLOCK_CATALOG` (category, description, search keywords).
4. Add a renderer `case` in `htmlGenerator.ts` and a `<XxxFields>` `case` in
   `PropertiesPanel.tsx`.

You do **not** write any styling, button or container code — those come from the shared
layers via `renderSection()`'s wrapper.

### Adding a new template

A template is only a chosen combination of blocks plus overrides, so it is a **single
entry** in the `TEMPLATES` array in `data/templates.ts` — no other file changes:

```ts
{
  key: 'myTemplate',
  name: 'My Template',
  description: 'What it is for.',
  category: 'Alerts & Compliance',       // groups it in the template picker
  build: () => base('Default Title', '', [
    createSection('hero'),
    withOverrides(createSection('listBlock') as ListBlockSection, { listStyle: 'timeline' }),
    createSection('ctaBanner'),
    createSection('about'),
  ]),
}
```

## Brand assets

`lib/brandAssets.ts` defines named slots — `logo`, `whatsapp`, `instagram`, `linkedin`,
`facebook`, `twitter`, `youtube` — managed from **Global Settings → Brand Assets**.
Each slot resolves in order:

1. **An uploaded image** — bundled into the export ZIP automatically.
2. **An absolute `https://` URL** — best for email, since nothing needs bundling.
3. **The built-in inline-SVG fallback** — last resort.

Swapping in the real RERA Easy logo or official social icons therefore needs **no code
change**: upload a file or paste a URL. The Asset Manager flags every slot still on a
fallback, because those are exactly the ones Gmail and Outlook will render as blank space.

## Project structure

```
src/
  types/newsletter.ts          Core data model (21 block types + shared BaseSection)
  data/
    icons.ts                   Icon library (Module 4)
    sectionDefaults.ts         Block factories, labels, BLOCK_CATALOG (categories + search)
    templates.ts               12 starter templates in 5 categories (Module 5)
  store/useNewsletterStore.ts  Zustand store — all app state + actions
  lib/
    htmlGenerator.ts           ⭐ Core: Newsletter → table-based email HTML
    blockStyle.ts              ⭐ Shared design tokens + wrapBlock() chrome
    blockButtons.ts            ⭐ Buttons for every block (VML + HTML)
    blockBoxes.ts              ⭐ Container boxes for every block
    brandAssets.ts             ⭐ Brand Asset Manager slots + resolution order
    htmlEscape.ts              Shared esc / nl2br / isDark primitives
    exportZip.ts               Module 8: ZIP export (index.html + images/ + data.json)
    importZip.ts               Module 9: ZIP import / round-trip restore
    storage.ts                 localStorage + IndexedDB persistence
    id.ts                      Tiny id generator
  components/
    Dashboard/                 Module 1 — now groups templates by category
    Editor/
      EditorLayout.tsx         Module 2 (3-pane layout)
      Sidebar/
        Sidebar.tsx            Section list + search
        SortableSectionItem.tsx  Drag, hide, duplicate, delete, colour label
        sectionSummary.ts      Shared one-line summaries (also used by search)
        AddSectionMenu.tsx     Searchable, categorised block picker
      Preview/                 Live iframe preview
      Properties/
        PropertiesPanel.tsx    Content / Design / Buttons / Boxes tabs
        sections/              Per-type Content editors (21)
        shared/                StyleFields, ButtonFields, BoxFields, RepeatableList
    Settings/
      GlobalSettingsPage.tsx   Module 10
      AssetManager.tsx         Brand asset slots
    shared/                    Field inputs, image picker, image list picker, icon picker, modal
```

## A note on the visual design

The builder UI uses RERA Easy's brand colors from the requirement doc (`#1D1F1F` ink,
`#FFDA4B` yellow, `#F3F4F6` light gray, `#EDEFF3` background) and keeps a clean,
professional, low-noise interface intentionally — this is an internal production tool
used daily by non-technical staff, so clarity and speed beat visual flourish.
