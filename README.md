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
- **One-time setup**: in **Settings → Pages**, set *Source* to **GitHub Actions**. The
  workflow's `configure-pages` step also tries to enable this automatically on its first
  successful run.
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

## Project structure

```
src/
  types/newsletter.ts          Core data model (every section type + fields)
  data/
    icons.ts                   Icon library (Module 4)
    sectionDefaults.ts         "New section" factories + labels
    templates.ts                6 starter templates (Module 5)
  store/useNewsletterStore.ts  Zustand store — all app state + actions
  lib/
    htmlGenerator.ts           ⭐ Core: Newsletter → table-based email HTML
    exportZip.ts                Module 8: ZIP export (index.html + images/ + data.json)
    importZip.ts                Module 9: ZIP import / round-trip restore
    storage.ts                  localStorage + IndexedDB persistence
    id.ts                       Tiny id generator
  components/
    Dashboard/                 Module 1
    Editor/
      EditorLayout.tsx          Module 2 (3-pane layout)
      Sidebar/                  Section list, drag-and-drop, add-section menu
      Preview/                  Live iframe preview
      Properties/               Per-section-type field editors (Module 3)
    Settings/GlobalSettingsPage.tsx   Module 10
    shared/                     Reusable field inputs, image picker, icon picker, modal
```

## A note on the visual design

The builder UI uses RERA Easy's brand colors from the requirement doc (`#1D1F1F` ink,
`#FFDA4B` yellow, `#F3F4F6` light gray, `#EDEFF3` background) and keeps a clean,
professional, low-noise interface intentionally — this is an internal production tool
used daily by non-technical staff, so clarity and speed beat visual flourish.
