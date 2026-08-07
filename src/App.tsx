import { useEffect } from 'react';
import { useNewsletterStore } from './store/useNewsletterStore';
import { Dashboard } from './components/Dashboard/Dashboard';
import { EditorLayout } from './components/Editor/EditorLayout';
import { GlobalSettingsPage } from './components/Settings/GlobalSettingsPage';

export default function App() {
  const init = useNewsletterStore((s) => s.init);
  const ready = useNewsletterStore((s) => s.ready);
  const view = useNewsletterStore((s) => s.view);

  useEffect(() => {
    init();
  }, [init]);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading your newsletters…
      </div>
    );
  }

  if (view === 'editor') return <EditorLayout />;
  if (view === 'settings') return <GlobalSettingsPage />;
  return <Dashboard />;
}
