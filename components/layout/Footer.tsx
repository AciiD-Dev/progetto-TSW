import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-[#45484f]/15 bg-[#0b0e14]">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8 md:gap-0">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="text-lg font-bold text-[#6dddff] font-['Space_Grotesk']">Neural Canvas</div>
          <p className="text-slate-500 text-sm font-['Inter']">© 2024 Neural Canvas. Logic as Art.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Terms of Service</Link>
          <Link href="/status" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Status</Link>
          <Link href="/docs/api" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">API Reference</Link>
        </div>
        <div className="flex gap-4">
          <a href="#" className="p-2 rounded-full hover:bg-white/5 transition-colors opacity-80 hover:opacity-100">
            <span className="material-symbols-outlined text-[#6dddff]">terminal</span>
          </a>
          <a href="#" className="p-2 rounded-full hover:bg-white/5 transition-colors opacity-80 hover:opacity-100">
            <span className="material-symbols-outlined text-[#6dddff]">forum</span>
          </a>
          <a href="#" className="p-2 rounded-full hover:bg-white/5 transition-colors opacity-80 hover:opacity-100">
            <span className="material-symbols-outlined text-[#6dddff]">public</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
