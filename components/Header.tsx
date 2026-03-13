// components/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-slate-800">
          Paws Forever
        </Link>
        <nav className="flex gap-6">
          <Link href="/gallery" className="text-slate-600 hover:text-slate-900">Gallery</Link>
          <Link href="/videos" className="text-slate-600 hover:text-slate-900">Videos</Link>
          <Link href="/memories" className="text-slate-600 hover:text-slate-900">Memories</Link>
        </nav>
      </div>
    </header>
  );
}