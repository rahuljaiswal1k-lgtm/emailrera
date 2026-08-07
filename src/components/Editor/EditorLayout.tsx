import { useNewsletterStore } from '../../store/useNewsletterStore';
import { EditorTopBar } from './EditorTopBar';
import { Sidebar } from './Sidebar/Sidebar';
import { PreviewFrame } from './Preview/PreviewFrame';
import { PropertiesPanel } from './Properties/PropertiesPanel';

export function EditorLayout() {
  const current = useNewsletterStore((s) => s.current);
  if (!current) return null;

  return (
    <div className="h-screen flex flex-col">
      <EditorTopBar />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <PreviewFrame />
        <PropertiesPanel />
      </div>
    </div>
  );
}
