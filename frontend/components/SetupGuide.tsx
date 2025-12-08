
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ChevronRight, AlertCircle, Package, Settings, Zap } from 'lucide-react';

const STEPS = [
  {
    id: 'prerequisites',
    label: 'Prerequisites',
    icon: <AlertCircle size={16} />,
    title: 'System Requirements',
    description: 'Ensure you have Node.js v18+ and access to Avalanche C-Chain or a Subnet.',
    lines: [
      { type: 'comment', text: '# Check Node.js version (v18+ required)' },
      { type: 'cmd', text: 'node --version' },
      { type: 'output', text: 'v20.10.0' },
      { type: 'comment', text: '# Prepare your environment variables' },
      { type: 'cmd', text: 'export PRIVATE_KEY="0x..."' },
      { type: 'cmd', text: 'export AVAX_RPC="https://api.avax-test.network/ext/bc/C/rpc"' },
      { type: 'success', text: '✔ Environment configured' }
    ]
  },
  {
    id: 'install',
    label: 'Installation',
    icon: <Package size={16} />,
    title: 'Install the SDK',
    description: 'Add the avax-warp-pay package to your project.',
    lines: [
      { type: 'comment', text: '# Install via NPM' },
      { type: 'cmd', text: 'npm install avax-warp-pay ethers' },
      { type: 'output', text: '...' },
      { type: 'output', text: 'added 24 packages in 2s' },
      { type: 'output', text: '24 packages are looking for funding' },
      { type: 'success', text: '✔ Package installed successfully' }
    ]
  },
  {
    id: 'configure',
    label: 'Configuration',
    icon: <Settings size={16} />,
    title: 'Initialize Client',
    description: 'Configure the Warp402 client with your chain details and private key.',
    lines: [
      { type: 'code', text: "import { Warp402 } from 'avax-warp-pay';" },
      { type: 'break' },
      { type: 'code', text: "const warp = new Warp402({" },
      { type: 'code', text: "  privateKey: process.env.PRIVATE_KEY," },
      { type: 'code', text: "  senderChain: {" },
      { type: 'code', text: "    rpc: 'https://api.avax-test.network/ext/bc/C/rpc'," },
      { type: 'code', text: "    sender: '0xYourSenderContractAddress'" },
      { type: 'code', text: "  }," },
      { type: 'code', text: "  receiverChain: {" },
      { type: 'code', text: "    rpc: 'http://127.0.0.1:9650/ext/bc/Subnet/rpc'," },
      { type: 'code', text: "    receiver: '0xYourReceiverContractAddress'" },
      { type: 'code', text: "  }" },
      { type: 'code', text: "});" }
    ]
  },
  {
    id: 'usage',
    label: 'Usage',
    icon: <Zap size={16} />,
    title: 'Send & Verify',
    description: 'Execute cross-chain payments and verify receipts.',
    lines: [
      { type: 'comment', text: '// 1. Send Payment on Source Chain' },
      { type: 'code', text: "const paymentId = await warp.pay(" },
      { type: 'code', text: "  ethers.parseEther('1.0')" },
      { type: 'code', text: ");" },
      { type: 'output', text: "> Payment Sent: 0x7f...a1b2" },
      { type: 'break' },
      { type: 'comment', text: '// 2. Verify on Destination Chain' },
      { type: 'code', text: "const isPaid = await warp.verify(paymentId);" },
      { type: 'break' },
      { type: 'code', text: "if (isPaid) {" },
      { type: 'code', text: "  console.log('Access Granted!');" },
      { type: 'code', text: "}" }
    ]
  }
];

const TerminalWindow = ({ title, children, className = "" }) => (
  <div className={`bg-[#0F0F0F] rounded-lg overflow-hidden border border-white/10 font-mono text-sm shadow-2xl ${className}`}>
    {/* Title Bar */}
    <div className="bg-[#1A1A1A] px-4 py-2 flex items-center justify-between border-b border-white/5">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
      </div>
      <div className="text-gray-500 text-xs flex items-center gap-2">
        <Terminal size={12} />
        {title}
      </div>
      <div className="w-12" /> {/* Spacer for centering */}
    </div>
    
    {/* Content */}
    <div className="p-6 h-full overflow-y-auto custom-scrollbar relative">
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
      {children}
    </div>
  </div>
);

const SetupGuide = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedLines([]);
    setIsTyping(true);
    let lineIndex = 0;
    
    const interval = setInterval(() => {
      // Safety check: Ensure activeStep is valid and has lines
      const currentStep = STEPS[activeStep];
      if (!currentStep || !currentStep.lines) return;

      if (lineIndex < currentStep.lines.length) {
        const nextLine = currentStep.lines[lineIndex];
        // Ensure we don't add undefined lines to state
        if (nextLine) {
          setDisplayedLines(prev => [...prev, nextLine]);
        }
        lineIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 400); // Speed of line appearance

    return () => clearInterval(interval);
  }, [activeStep]);

  return (
    <section className="py-32 bg-brand-dark relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Setting Up the SDK</h2>
            <p className="text-gray-400 max-w-xl">
              Follow these simple steps to integrate cross-chain payments into your dApp.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-[600px] lg:h-[500px]">
          {/* Left: Navigation */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-4 rounded-lg border transition-all duration-300 group relative overflow-hidden ${
                  activeStep === idx 
                    ? 'bg-white/5 border-brand-orange/50 translate-x-2' 
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                }`}
              >
                {activeStep === idx && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange" />
                )}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      activeStep === idx ? 'bg-brand-orange/20 text-brand-orange' : 'bg-white/10 text-gray-500'
                    }`}>
                      0{idx + 1}
                    </span>
                    <h3 className={`font-bold transition-colors ${activeStep === idx ? 'text-white' : 'text-gray-400'}`}>
                      {step.label}
                    </h3>
                  </div>
                  {activeStep === idx && <ChevronRight size={16} className="text-brand-orange animate-pulse" />}
                </div>
                <p className="text-xs text-gray-500 pl-9 line-clamp-1 group-hover:text-gray-400 transition-colors">
                  {step.title}
                </p>
              </button>
            ))}
          </div>

          {/* Right: Terminal */}
          <div className="lg:col-span-8 h-full">
            <div className="relative h-full">
              {/* Decorative elements */}
              <div className="absolute -top-10 right-10 w-24 h-24 bg-brand-orange/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

              <TerminalWindow 
                title={`bash — ${STEPS[activeStep]?.id || 'terminal'}`} 
                className="h-full relative z-10"
              >
                <div className="space-y-2">
                  {displayedLines.map((line, i) => (
                    // Safety Check: Only render if line exists
                    line ? (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="leading-relaxed break-all"
                      >
                        {line.type === 'comment' && (
                          <span className="text-gray-500 italic">{line.text}</span>
                        )}
                        {line.type === 'cmd' && (
                          <div className="flex gap-2 text-white group">
                            <span className="text-brand-orange select-none">$</span>
                            <span>{line.text}</span>
                          </div>
                        )}
                        {line.type === 'output' && (
                          <span className="text-gray-400 block pl-4 border-l-2 border-white/10 ml-1">{line.text}</span>
                        )}
                        {line.type === 'success' && (
                          <span className="text-green-400 block">{line.text}</span>
                        )}
                        {line.type === 'code' && (
                          <span className="text-blue-300 font-normal">{line.text}</span>
                        )}
                        {line.type === 'break' && <br />}
                      </motion.div>
                    ) : null
                  ))}
                  
                  {isTyping && (
                    <div className="inline-block w-2 h-4 bg-brand-orange animate-pulse align-middle ml-1" />
                  )}
                  {!isTyping && (
                    <div className="flex gap-2 mt-2">
                      <span className="text-brand-orange">$</span>
                      <span className="w-2 h-4 bg-gray-500 animate-pulse" />
                    </div>
                  )}
                </div>
              </TerminalWindow>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetupGuide;
