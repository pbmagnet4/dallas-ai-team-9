import CanvasShell from './CanvasShell';

export const metadata = {
  title: 'NavFlow — Journey Map',
};

export default function CanvasPage() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <CanvasShell />
    </main>
  );
}
