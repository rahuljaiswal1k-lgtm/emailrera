import { useState } from 'react';
import { useNewsletterStore } from '../../store/useNewsletterStore';
import { TEMPLATES, TEMPLATE_CATEGORY_ORDER } from '../../data/templates';
import { Modal } from '../shared/Modal';
import { SECTION_LABELS } from '../../data/sectionDefaults';
import { Plus, Copy, Trash2, Settings, FileText, LayoutTemplate } from 'lucide-react';
import { BrandMark } from '../shared/BrandMark';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Dashboard() {
  const newsletters = useNewsletterStore((s) => s.newsletters);
  const createBlankNewsletter = useNewsletterStore((s) => s.createBlankNewsletter);
  const createFromTemplate = useNewsletterStore((s) => s.createFromTemplate);
  const openNewsletter = useNewsletterStore((s) => s.openNewsletter);
  const duplicateNewsletter = useNewsletterStore((s) => s.duplicateNewsletter);
  const deleteNewsletter = useNewsletterStore((s) => s.deleteNewsletter);
  const goToSettings = useNewsletterStore((s) => s.goToSettings);

  const [showTemplates, setShowTemplates] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = [...newsletters].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark height={36} />
              <div className="h-8 w-px bg-gray-200" />
              <h1 className="text-lg font-bold tracking-tight">Newsletter Builder</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">No-code email newsletters, ready to send.</p>
          </div>
          <button
            onClick={goToSettings}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <Settings size={16} /> Global Settings
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Newsletters</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 text-gray-700"
            >
              <LayoutTemplate size={16} /> Start from Template
            </button>
            <button
              onClick={createBlankNewsletter}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#1D1F1F] text-white hover:bg-black"
            >
              <Plus size={16} /> Create Newsletter
            </button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl py-20 text-center bg-white">
            <FileText className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-gray-500 text-sm">No newsletters yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden group">
                <button onClick={() => openNewsletter(n.id)} className="block w-full text-left p-5">
                  <div className="w-full h-28 rounded-lg bg-gradient-to-br from-[#FFDA4B] to-[#F3F4F6] mb-4 flex items-center justify-center overflow-hidden">
                    <span className="text-[11px] font-semibold text-[#1D1F1F]/70 px-3 text-center line-clamp-3">{n.title}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{n.title || 'Untitled Newsletter'}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {n.sections.length} section{n.sections.length !== 1 ? 's' : ''} · Updated {formatDate(n.updatedAt)}
                  </p>
                </button>
                <div className="flex items-center gap-1 px-5 pb-4">
                  <button
                    onClick={() => duplicateNewsletter(n.id)}
                    title="Duplicate"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100"
                  >
                    <Copy size={13} /> Duplicate
                  </button>
                  <button
                    onClick={() => setConfirmDelete(n.id)}
                    title="Delete"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 ml-auto"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showTemplates && (
        <Modal title="Start from a Template" onClose={() => setShowTemplates(false)} width="max-w-3xl">
          <button
            onClick={() => {
              createBlankNewsletter();
              setShowTemplates(false);
            }}
            className="w-full text-left p-4 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 mb-5"
          >
            <div className="font-semibold text-sm text-gray-900">Blank Newsletter</div>
            <div className="text-xs text-gray-400 mt-1">Start from scratch with a minimal layout.</div>
          </button>

          {TEMPLATE_CATEGORY_ORDER.filter((c) => TEMPLATES.some((t) => t.category === c)).map((category) => (
            <div key={category} className="mb-5">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.filter((t) => t.category === category).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      createFromTemplate(t.build());
                      setShowTemplates(false);
                    }}
                    className="text-left p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  >
                    <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.description}</div>
                    <div className="text-[10px] text-gray-400 mt-2">
                      {t.build().sections.map((s) => SECTION_LABELS[s.type]).join(' · ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Newsletter" onClose={() => setConfirmDelete(null)} width="max-w-sm">
          <p className="text-sm text-gray-600 mb-5">
            This will permanently delete this newsletter. This can't be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteNewsletter(confirmDelete);
                setConfirmDelete(null);
              }}
              className="text-sm px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
