import { create } from 'zustand';
import { nanoid } from '../lib/id';
import type { GlobalSettings, Newsletter, Section, SectionType, StoredImage } from '../types/newsletter';
import { createSection } from '../data/sectionDefaults';
import {
  loadNewsletters,
  saveNewsletters,
  loadGlobalSettings,
  saveGlobalSettings,
  putImage,
  loadAllImages,
  DEFAULT_GLOBAL_SETTINGS,
} from '../lib/storage';
import { blankNewsletter } from '../data/templates';

type View = 'dashboard' | 'editor' | 'settings';

interface NewsletterStore {
  // data
  newsletters: Newsletter[];
  current: Newsletter | null;
  selectedSectionId: string | null;
  images: Record<string, StoredImage>;
  globalSettings: GlobalSettings;

  // ui
  view: View;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  ready: boolean;

  // lifecycle
  init: () => Promise<void>;

  // dashboard actions
  createBlankNewsletter: () => void;
  createFromTemplate: (newsletter: Newsletter) => void;
  openNewsletter: (id: string) => void;
  duplicateNewsletter: (id: string) => void;
  deleteNewsletter: (id: string) => void;
  goToDashboard: () => void;
  goToSettings: () => void;

  // editor actions
  updateTitle: (title: string) => void;
  updateSubtitle: (subtitle: string) => void;
  addSection: (type: SectionType, atIndex?: number) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  setSections: (sections: Section[]) => void;
  updateSection: (id: string, partial: Partial<Section>) => void;
  /** Apply an inline canvas edit addressed by dotted path, e.g. "items.2.title". */
  updateSectionField: (id: string, path: string, value: string) => void;
  /** Code mode: set hand-written HTML, or null to go back to the sections. */
  setHtmlOverride: (html: string | null) => void;
  /** Format toolbar on a specific field — per-`data-nl-edit` path style override. */
  updateFieldStyle: (id: string, path: string, patch: Partial<import('../types/newsletter').FieldStyle>) => void;
  toggleSectionVisibility: (id: string) => void;
  selectSection: (id: string | null) => void;
  duplicateCurrentAsNew: () => void;
  importNewsletter: (newsletter: Newsletter, importedImages: StoredImage[]) => void;

  // images
  uploadImage: (file: File) => Promise<string>;

  // global settings
  updateGlobalSettings: (partial: Partial<GlobalSettings>) => void;
  /** Dotted-path update for global settings, e.g. "offices.0.label". */
  updateGlobalField: (path: string, value: string) => void;
}

function persistCurrent(get: () => NewsletterStore, set: (p: Partial<NewsletterStore>) => void) {
  const { current, newsletters } = get();
  if (!current) return;
  set({ saveStatus: 'saving' });
  const updated = { ...current, updatedAt: Date.now() };
  const idx = newsletters.findIndex((n) => n.id === updated.id);
  const nextList = idx >= 0 ? newsletters.map((n) => (n.id === updated.id ? updated : n)) : [...newsletters, updated];
  const ok = saveNewsletters(nextList);
  set({ newsletters: nextList, current: updated, saveStatus: ok ? 'saved' : 'error' });
}

export const useNewsletterStore = create<NewsletterStore>((set, get) => ({
  newsletters: [],
  current: null,
  selectedSectionId: null,
  images: {},
  globalSettings: DEFAULT_GLOBAL_SETTINGS,
  view: 'dashboard',
  saveStatus: 'idle',
  ready: false,

  init: async () => {
    const newsletters = loadNewsletters();
    const globalSettings = loadGlobalSettings();
    // IndexedDB can be unavailable entirely (private browsing, blocked site
    // storage). That must not stop the app from booting — without this the
    // rejected promise leaves `ready` false and the UI stuck on "Loading…"
    // forever. Newsletters still load; only previously uploaded images are
    // missing, and re-uploading reports its own error.
    const images: Record<string, StoredImage> = {};
    try {
      const imageList = await loadAllImages();
      imageList.forEach((img) => (images[img.id] = img));
    } catch (err) {
      console.error('Failed to load stored images from IndexedDB', err);
    }
    set({ newsletters, globalSettings, images, ready: true });
  },

  createBlankNewsletter: () => {
    const n = blankNewsletter();
    set((s) => ({
      current: n,
      newsletters: [...s.newsletters, n],
      selectedSectionId: n.sections[0]?.id ?? null,
      view: 'editor',
    }));
    saveNewsletters(get().newsletters);
  },

  createFromTemplate: (newsletter) => {
    set((s) => ({
      current: newsletter,
      newsletters: [...s.newsletters, newsletter],
      selectedSectionId: newsletter.sections[0]?.id ?? null,
      view: 'editor',
    }));
    saveNewsletters(get().newsletters);
  },

  openNewsletter: (id) => {
    const n = get().newsletters.find((x) => x.id === id);
    if (!n) return;
    set({ current: n, selectedSectionId: n.sections[0]?.id ?? null, view: 'editor' });
  },

  duplicateNewsletter: (id) => {
    const n = get().newsletters.find((x) => x.id === id);
    if (!n) return;
    const copy: Newsletter = {
      ...n,
      id: nanoid(),
      title: n.title + ' (Copy)',
      sections: n.sections.map((s) => ({ ...s, id: nanoid() })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextList = [...get().newsletters, copy];
    set({ newsletters: nextList });
    saveNewsletters(nextList);
  },

  deleteNewsletter: (id) => {
    const nextList = get().newsletters.filter((n) => n.id !== id);
    set({ newsletters: nextList });
    saveNewsletters(nextList);
  },

  goToDashboard: () => set({ view: 'dashboard', current: null, selectedSectionId: null }),
  goToSettings: () => set({ view: 'settings' }),

  updateTitle: (title) => {
    set((s) => (s.current ? { current: { ...s.current, title } } : {}));
    persistCurrent(get, set);
  },
  updateSubtitle: (subtitle) => {
    set((s) => (s.current ? { current: { ...s.current, subtitle } } : {}));
    persistCurrent(get, set);
  },

  addSection: (type, atIndex) => {
    const section = createSection(type);
    set((s) => {
      if (!s.current) return {};
      const sections = [...s.current.sections];
      const idx = atIndex ?? sections.length;
      sections.splice(idx, 0, section);
      return { current: { ...s.current, sections }, selectedSectionId: section.id };
    });
    persistCurrent(get, set);
  },

  removeSection: (id) => {
    set((s) => {
      if (!s.current) return {};
      const sections = s.current.sections.filter((sec) => sec.id !== id);
      const selectedSectionId = s.selectedSectionId === id ? null : s.selectedSectionId;
      return { current: { ...s.current, sections }, selectedSectionId };
    });
    persistCurrent(get, set);
  },

  duplicateSection: (id) => {
    set((s) => {
      if (!s.current) return {};
      const idx = s.current.sections.findIndex((sec) => sec.id === id);
      if (idx === -1) return {};
      const copy = { ...s.current.sections[idx], id: nanoid() };
      const sections = [...s.current.sections];
      sections.splice(idx + 1, 0, copy);
      return { current: { ...s.current, sections }, selectedSectionId: copy.id };
    });
    persistCurrent(get, set);
  },

  setSections: (sections) => {
    set((s) => (s.current ? { current: { ...s.current, sections } } : {}));
    persistCurrent(get, set);
  },

  updateSection: (id, partial) => {
    set((s) => {
      if (!s.current) return {};
      const sections = s.current.sections.map((sec) =>
        sec.id === id ? ({ ...sec, ...partial } as Section) : sec
      );
      return { current: { ...s.current, sections } };
    });
    persistCurrent(get, set);
  },

  updateSectionField: (id, path, value) => {
    set((s) => {
      if (!s.current) return {};
      const sections = s.current.sections.map((sec) => {
        if (sec.id !== id) return sec;
        // Clone along the path so React/zustand see a new object graph.
        const clone: Record<string, unknown> = { ...(sec as unknown as Record<string, unknown>) };
        const parts = path.split('.');
        let node: Record<string, unknown> | unknown[] = clone;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = parts[i];
          const idx = Number(key);
          const container = node as Record<string, unknown>;
          const child = Array.isArray(node) ? (node as unknown[])[idx] : container[key];
          if (child === undefined || child === null) return sec;
          const copy = Array.isArray(child) ? [...(child as unknown[])] : { ...(child as object) };
          if (Array.isArray(node)) (node as unknown[])[idx] = copy;
          else container[key] = copy;
          node = copy as Record<string, unknown> | unknown[];
        }
        const last = parts[parts.length - 1];
        if (Array.isArray(node)) (node as unknown[])[Number(last)] = value;
        else (node as Record<string, unknown>)[last] = value;
        return clone as unknown as Section;
      });
      return { current: { ...s.current, sections } };
    });
    persistCurrent(get, set);
  },

  setHtmlOverride: (html) => {
    set((s) => (s.current ? { current: { ...s.current, htmlOverride: html } } : {}));
    persistCurrent(get, set);
  },

  updateFieldStyle: (id, path, patch) => {
    set((s) => {
      if (!s.current) return {};
      const sections = s.current.sections.map((sec) => {
        if (sec.id !== id) return sec;
        const fieldStyles = { ...(sec.fieldStyles ?? {}) };
        const existing = fieldStyles[path] ?? {};
        const merged = { ...existing, ...patch };
        // Drop entries that fall back to defaults so the section stays clean.
        Object.keys(merged).forEach((k) => {
          const v = (merged as Record<string, unknown>)[k];
          if (v === undefined || v === null || v === '') delete (merged as Record<string, unknown>)[k];
        });
        if (Object.keys(merged).length === 0) delete fieldStyles[path];
        else fieldStyles[path] = merged;
        return { ...sec, fieldStyles };
      });
      return { current: { ...s.current, sections } };
    });
    persistCurrent(get, set);
  },

  toggleSectionVisibility: (id) => {
    set((s) => {
      if (!s.current) return {};
      const sections = s.current.sections.map((sec) =>
        sec.id === id ? { ...sec, visible: !sec.visible } : sec
      );
      return { current: { ...s.current, sections } };
    });
    persistCurrent(get, set);
  },

  selectSection: (id) => set({ selectedSectionId: id }),

  duplicateCurrentAsNew: () => {
    const { current } = get();
    if (!current) return;
    const copy: Newsletter = {
      ...current,
      id: nanoid(),
      title: current.title + ' (Copy)',
      sections: current.sections.map((s) => ({ ...s, id: nanoid() })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ newsletters: [...s.newsletters, copy], current: copy, selectedSectionId: copy.sections[0]?.id ?? null }));
    saveNewsletters(get().newsletters);
  },

  importNewsletter: (newsletter, importedImages) => {
    set((s) => {
      const images = { ...s.images };
      importedImages.forEach((img) => (images[img.id] = img));
      return {
        current: newsletter,
        newsletters: [...s.newsletters, newsletter],
        selectedSectionId: newsletter.sections[0]?.id ?? null,
        view: 'editor' as View,
        images,
      };
    });
    importedImages.forEach((img) => putImage(img));
    saveNewsletters(get().newsletters);
  },

  uploadImage: async (file) => {
    const id = nanoid();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const extMatch = /\.([a-zA-Z0-9]+)$/.exec(file.name);
    const extFromName = extMatch ? extMatch[1].toLowerCase() : '';
    const extFromMime = file.type.split('/')[1] || 'jpg';
    const extension = extFromName || (extFromMime === 'jpeg' ? 'jpg' : extFromMime);
    const image: StoredImage = { id, originalName: file.name, dataUrl, extension };
    await putImage(image);
    set((s) => ({ images: { ...s.images, [id]: image } }));
    return id;
  },

  updateGlobalSettings: (partial) => {
    const next = { ...get().globalSettings, ...partial };
    set({ globalSettings: next });
    saveGlobalSettings(next);
  },

  updateGlobalField: (path, value) => {
    const parts = path.split('.');
    const settings = get().globalSettings;
    // Deep clone along the path so React sees a new object graph.
    const clone: Record<string, unknown> = { ...(settings as unknown as Record<string, unknown>) };
    let node: Record<string, unknown> | unknown[] = clone;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      const child = Array.isArray(node) ? (node as unknown[])[Number(key)] : (node as Record<string, unknown>)[key];
      if (child === undefined || child === null) return;
      const copy = Array.isArray(child) ? [...(child as unknown[])] : { ...(child as object) };
      if (Array.isArray(node)) (node as unknown[])[Number(key)] = copy;
      else (node as Record<string, unknown>)[key] = copy;
      node = copy as Record<string, unknown> | unknown[];
    }
    const last = parts[parts.length - 1];
    if (Array.isArray(node)) (node as unknown[])[Number(last)] = value;
    else (node as Record<string, unknown>)[last] = value;
    const next = clone as unknown as GlobalSettings;
    set({ globalSettings: next });
    saveGlobalSettings(next);
  },
}));
