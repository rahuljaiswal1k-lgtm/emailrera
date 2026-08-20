/**
 * Small credit strip shown at the bottom of every page (dashboard, editor,
 * settings). Kept as one component so the wording, styling and link update in
 * one place.
 */
export function DeveloperCredit({ variant = 'footer' }: { variant?: 'footer' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <span className="text-[10.5px] text-gray-400 select-none">
        Developed by <span className="font-semibold text-gray-500">Rahul Jaiswal</span>
      </span>
    );
  }
  return (
    <footer className="border-t border-gray-200 bg-white/70 backdrop-blur-sm py-3 text-center">
      <span className="text-[11px] text-gray-400">
        Developed by <span className="font-semibold text-gray-600">Rahul Jaiswal</span> · RERA Easy Newsletter Builder
      </span>
    </footer>
  );
}
