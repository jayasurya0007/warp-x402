import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-orange text-white py-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20">
        <div>
           <h3 className="font-mono uppercase text-sm font-bold tracking-widest mb-6 border-b border-white/20 pb-2">
           <div className="flex items-center mb-4">
           <img src="/logo-light.svg" alt="Avalanche" className="h-6 w-auto object-contain" />
           </div> Warp-402: Cross-Chain Payments
           </h3>
           <p className="max-w-md text-sm leading-relaxed mb-6">
             A revolutionary HTTP 402 payment system enabling payments on one chain and verification on another, powered by Avalanche Teleporter.
           </p>
           <div className="flex gap-4">
              <a href="https://github.com/jayasurya0007/wrap-x402" target="_blank" className="bg-white text-brand-orange px-6 py-2 font-bold hover:bg-gray-100 transition-colors uppercase text-sm rounded">
                Star on GitHub
              </a>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12 font-mono text-sm">
           <div>
              <h4 className="font-bold mb-4 text-black/60">PROJECT</h4>
              <ul className="space-y-2">
                 <li><a href="#" className="hover:underline">HOME</a></li>
                 <li><a href="#" className="hover:underline">ARCHITECTURE</a></li>
                 <li><a href="#" className="hover:underline">SDK</a></li>
                 <li><a href="#" className="hover:underline">CONTRACTS</a></li>
              </ul>
           </div>
           <div>
              <h4 className="font-bold mb-4 text-black/60">RESOURCES</h4>
              <li><a href="https://github.com/jayasurya0007/wrap-x402" className="hover:underline">GITHUB REPO</a></li>
              <li><a href="#" className="hover:underline">DOCS</a></li>
              <li><a href="#" className="hover:underline">AVALANCHE</a></li>
           </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-20 flex flex-col md:flex-row justify-between items-end border-t border-white/20 pt-8 font-mono text-xs">
         <div className="flex gap-8 mb-4 md:mb-0">
            <span className="opacity-80">MIT LICENSE</span>
         </div>
         <div>
            © 2024 WARP-402. BUILT FOR AVALANCHE.
         </div>
      </div>
      
    </footer>
    
  );
};

export default Footer;