import CanvasShell from './CanvasShell';

export const metadata = {
  title: 'NavFlow — Journey Map',
};

export default function CanvasPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', height: '100%' }}>
      <CanvasShell />
    </div>
  );
}
