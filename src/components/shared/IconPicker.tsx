import { ICONS } from '../../data/icons';

export function IconPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ICONS.map((icon) => (
        <button
          key={icon.key}
          type="button"
          onClick={() => onChange(icon.key)}
          title={icon.label}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
            value === icon.key ? 'border-[#1D1F1F] bg-[#F3F4F6]' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#1D1F1F] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: icon.svg }} />
          </div>
          <span className="text-[10px] text-gray-500 leading-none text-center">{icon.label}</span>
        </button>
      ))}
    </div>
  );
}
