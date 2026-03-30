import { Car, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-20 bg-[#9b111e] flex flex-col items-center py-6 shadow-lg z-40">
      <Link href="/" className="mb-8" title="Recepción">
        <Car color="#fff" size={32} />
      </Link>
      <Link href="/admin" className="mb-8" title="Administración">
        <Settings color="#fff" size={32} />
      </Link>
      <Link href="/reportes" title="Reportes">
        <BarChart3 color="#fff" size={32} />
      </Link>
    </aside>
  );
}
