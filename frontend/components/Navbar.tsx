import React from 'react';
import { Menu, Zap } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl mx-auto border border-white/20 bg-white/10 dark:bg-black/30 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/20">
      <div className="px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <img src="/logo-light.svg" alt="Warp-402" className="h-6 w-auto object-contain" />

        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Architecture</a>
          <a href="#" className="hover:text-white transition-colors">SDK</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
          <a href="#" className="hover:text-white transition-colors">Contracts</a>
          <a href="https://github.com/jayasurya0007/wrap-x402" target="_blank" className="hover:text-white transition-colors">GitHub</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="bg-brand-orange hover:bg-red-600 text-white px-5 py-2 rounded font-semibold text-sm transition-all shadow-[0_0_20px_rgba(232,65,66,0.3)] hover:shadow-[0_0_30px_rgba(232,65,66,0.5)]">
            GET STARTED
          </button>
        </div>

        <div className="md:hidden text-white">
          <Menu className="w-6 h-6" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;