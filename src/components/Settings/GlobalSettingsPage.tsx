import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNewsletterStore } from '../../store/useNewsletterStore';
import { FieldGroup, TextField, TextAreaField, SelectField } from '../shared/FormFields';
import { ImagePicker } from '../shared/ImagePicker';
import { AssetManager } from './AssetManager';
import { BrandMark } from '../shared/BrandMark';
import { DeveloperCredit } from '../shared/DeveloperCredit';
import type { GlobalSettings } from '../../types/newsletter';

const SOCIAL_PLATFORMS: { value: GlobalSettings['social'][number]['platform']; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
];

export function GlobalSettingsPage() {
  const settings = useNewsletterStore((s) => s.globalSettings);
  const update = useNewsletterStore((s) => s.updateGlobalSettings);
  const goToDashboard = useNewsletterStore((s) => s.goToDashboard);

  const setPhones = (phones: GlobalSettings['phones']) => update({ phones });
  const setOffices = (offices: GlobalSettings['offices']) => update({ offices });
  const setSocial = (social: GlobalSettings['social']) => update({ social });

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={goToDashboard} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <ArrowLeft size={17} />
          </button>
          <BrandMark height={30} />
          <div className="h-7 w-px bg-gray-200" />
          <div>
            <h1 className="text-base font-bold">Global Settings</h1>
            <p className="text-xs text-gray-400">Company details that automatically populate the header logo and footer on every newsletter.</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Company</h2>
          <FieldGroup label="Company Name">
            <TextField value={settings.companyName} onChange={(companyName) => update({ companyName })} />
          </FieldGroup>
          <FieldGroup label="Logo">
            <ImagePicker value={settings.logoImageId} onChange={(logoImageId) => update({ logoImageId })} />
          </FieldGroup>
          <FieldGroup label="Website URL" hint="The header logo links here">
            <TextField value={settings.websiteUrl} onChange={(websiteUrl) => update({ websiteUrl })} />
          </FieldGroup>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Contact</h2>
          <FieldGroup label="Email">
            <TextField value={settings.email} onChange={(email) => update({ email })} />
          </FieldGroup>
          <FieldGroup label="Phone Numbers">
            <div className="space-y-2">
              {settings.phones.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={p.label}
                    onChange={(e) => setPhones(settings.phones.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="Label (e.g. Pune)"
                    className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={p.number}
                    onChange={(e) => setPhones(settings.phones.map((x, idx) => (idx === i ? { ...x, number: e.target.value } : x)))}
                    placeholder="+91 00000 00000"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => setPhones(settings.phones.filter((_, idx) => idx !== i))}
                    className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPhones([...settings.phones, { label: '', number: '' }])}
              className="text-xs font-semibold text-[#1D1F1F] hover:underline mt-2 flex items-center gap-1"
            >
              <Plus size={12} /> Add Phone Number
            </button>
          </FieldGroup>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Office Addresses</h2>
          <div className="space-y-3">
            {settings.offices.map((o, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3">
                <div className="flex gap-2 mb-2">
                  <input
                    value={o.label}
                    onChange={(e) => setOffices(settings.offices.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="Office label (e.g. Mumbai Office)"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold"
                  />
                  <button
                    onClick={() => setOffices(settings.offices.filter((_, idx) => idx !== i))}
                    className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  value={o.address}
                  onChange={(e) => setOffices(settings.offices.map((x, idx) => (idx === i ? { ...x, address: e.target.value } : x)))}
                  rows={2}
                  placeholder="Full address"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-y"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setOffices([...settings.offices, { label: '', address: '' }])}
            className="text-xs font-semibold text-[#1D1F1F] hover:underline mt-3 flex items-center gap-1"
          >
            <Plus size={12} /> Add Office
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Social Links</h2>
          <div className="space-y-2">
            {settings.social.map((s, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-36 shrink-0">
                  <SelectField
                    value={s.platform}
                    onChange={(platform) => setSocial(settings.social.map((x, idx) => (idx === i ? { ...x, platform } : x)))}
                    options={SOCIAL_PLATFORMS}
                  />
                </div>
                <input
                  value={s.url}
                  onChange={(e) => setSocial(settings.social.map((x, idx) => (idx === i ? { ...x, url: e.target.value } : x)))}
                  placeholder="https://"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => setSocial(settings.social.filter((_, idx) => idx !== i))}
                  className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSocial([...settings.social, { platform: 'linkedin', url: '' }])}
            className="text-xs font-semibold text-[#1D1F1F] hover:underline mt-2 flex items-center gap-1"
          >
            <Plus size={12} /> Add Social Link
          </button>
        </section>

        <AssetManager />

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Footer Legal Text</h2>
          <FieldGroup label="Legal / Copyright Line">
            <TextAreaField value={settings.legalText} onChange={(legalText) => update({ legalText })} rows={2} />
          </FieldGroup>
        </section>
      </main>
      <DeveloperCredit />
    </div>
  );
}
