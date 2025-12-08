import React from 'react';

const logos = [
  { name: 'Avalanche', src: 'https://upload.wikimedia.org/wikipedia/en/2/23/Avalanche_Blockchain_Logo.png' },
  { name: 'Solidity', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/solidity/solidity-original.svg' },
  { name: 'TypeScript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Foundry', src: 'https://avatars.githubusercontent.com/u/96381504?s=200&v=4' }, // Foundry Logo placeholder
  { name: 'OpenZeppelin', src: 'https://seeklogo.com/images/O/openzeppelin-logo-9556A69F06-seeklogo.com.png' },
  { name: 'Node.js', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
];

const TrustedBy = () => {
  return (
    <section className="py-20 border-b border-white/5 bg-brand-dark relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-brand-orange font-mono text-sm tracking-widest mb-8 uppercase font-bold">
          Built with Modern Web3 Stack
        </h3>
        <div className="flex flex-wrap items-center gap-12 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {logos.map((logo, idx) => (
            <img 
              key={idx} 
              src={logo.src} 
              alt={logo.name} 
              className="h-8 md:h-12 w-auto object-contain brightness-200 contrast-0 hover:contrast-100 hover:brightness-100 transition-all" 
            />
          ))}
        </div>
        <p className="mt-8 text-gray-400 max-w-2xl">
          Warp-402 leverages the power of Avalanche Teleporter for instant cross-subnet messaging, secured by OpenZeppelin standards and tested with Foundry.
        </p>
      </div>
    </section>
  );
};

export default TrustedBy;