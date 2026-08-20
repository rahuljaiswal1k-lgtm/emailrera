/**
 * Tiny credit strip shown at the very bottom of every page (dashboard,
 * editor, settings). Deliberately small and unobtrusive.
 */
export function DeveloperCredit() {
  return (
    <footer className="border-t border-gray-200 bg-white py-1.5 text-center">
      <span className="text-[9px] text-gray-400 tracking-wide select-none">
        developed by Rahul J.
      </span>
    </footer>
  );
}
