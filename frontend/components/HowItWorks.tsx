import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Check, FileCode, Folder, Zap, ChevronRight, Lock, Unlock } from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 4;
  const stepDuration = 5000; // 5 seconds per step

  // Auto-cycle through steps periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        // Loop back to step 1 after reaching the last step
        return prev >= totalSteps ? 1 : prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [totalSteps, stepDuration]);

  const steps = [
    {
      id: 1,
      title: "Request Resource",
      description: "Client requests protected content. Server responds with HTTP 402 and a unique Payment ID for cross-chain payment.",
      icon: <Lock size={20} className="text-brand-orange" />,
      terminal: "curl -X GET https://api.example.com/protected-resource",
      code: `// Server responds with HTTP 402 Payment Required
// x402-server middleware handles this automatically

app.get('/protected-resource', async (req, res) => {
  const paymentId = generatePaymentId();
  
  // Return HTTP 402 with payment details
  return res.status(402).json({
    status: 402,
    paymentId: paymentId,
    amount: ethers.parseEther("0.1").toString(),
    senderChain: "fuji",
    receiverChain: "subnet-b",
    senderContract: "0x52C8...c1f922",
    receiverContract: "0xReceiver..."
  });
});`,
      fileName: "server.js",
    },
    {
      id: 2,
      title: "Send Payment",
      description: "User sends funds to the WarpSender contract on the Source Chain (Fuji C-Chain) using the avax-warp-pay SDK.",
      icon: <Zap size={20} className="text-yellow-400" />,
      terminal: "npm install avax-warp-pay ethers",
      code: `import { Warp402, PRESETS } from 'avax-warp-pay';
import { ethers } from 'ethers';

// Initialize with pre-deployed contracts
const warp = new Warp402({
  ...PRESETS.fuji,
  privateKey: process.env.PRIVATE_KEY
});

// Send payment on Sender Chain (Fuji)
const paymentId = await warp.pay(
  ethers.parseEther("0.1")
);

console.log('Payment sent:', paymentId);
// Payment receipt will be relayed via Teleporter`,
      fileName: "client.js",
    },
    {
      id: 3,
      title: "Cross-Chain Relay",
      description: "Avalanche Teleporter (Warp Messaging) automatically relays the payment receipt from Sender Chain to Receiver Chain within 5-10 seconds.",
      icon: <ArrowRight size={20} className="text-blue-400" />,
      terminal: "Teleporter: Relaying payment receipt from Fuji → Subnet B...",
      code: `// Teleporter automatically handles cross-chain relay
// No additional code needed - it's built into Avalanche

// The WarpReceiver contract on Receiver Chain receives:
// - paymentId: bytes32
// - sender: address
// - amount: uint256
// - timestamp: uint256

// This happens automatically via Avalanche's 
// Inter-Chain Message (ICM) protocol`,
      fileName: "teleporter.md",
    },
    {
      id: 4,
      title: "Verify & Access",
      description: "Server verifies the receipt on the Receiver Chain using WarpReceiver contract, then unlocks the resource for the client.",
      icon: <Unlock size={20} className="text-green-400" />,
      terminal: "curl -X GET https://api.example.com/verify/0x1234...5678",
      code: `// Server-side verification on Receiver Chain
import { Warp402, PRESETS } from 'avax-warp-pay';

const warp = new Warp402({
  ...PRESETS.receiverSubnet,
  privateKey: process.env.SERVER_PRIVATE_KEY
});

app.get('/verify/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  
  // Check if payment was received on Receiver Chain
  const receipt = await warp.verify(paymentId);
  
  if (receipt.paid && !receipt.consumed) {
    // Mark as consumed (prevents replay attacks)
    await warp.consume(paymentId);
    
    // Return protected resource
    return res.json({ data: protectedResource });
  }
  
  return res.status(402).json({ 
    error: "Payment required or already consumed" 
  });
});`,
      fileName: "verify.js",
    },
  ];

  const activeStepData = steps.find(s => s.id === activeStep) || steps[0];
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'macos' | 'windows'>('macos');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#080808] py-20">
      
      {/* Main container */}
      <div className="h-full overflow-hidden flex items-center">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Panel: Text Content */}
            <div className="space-y-8 py-8">
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">PRODUCT</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white">
                Cross-chain payments <span className="text-brand-orange">verified instantly</span>
              </h2>

              {/* Subtitle - Animated */}
              <div className="min-h-[80px]">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-gray-400 text-lg leading-relaxed mb-8"
                  >
                    {activeStepData.description}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Terminal/Command Block - Animated */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                  <span className="text-xs font-mono text-gray-500">01 - TERMINAL / IDE</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedTab('macos')}
                      className={`px-3 py-1 text-xs font-mono transition-colors rounded ${
                        selectedTab === 'macos' 
                          ? 'bg-white/10 text-white' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      MACOS
                    </button>
                    <button
                      onClick={() => setSelectedTab('windows')}
                      className={`px-3 py-1 text-xs font-mono transition-colors rounded ${
                        selectedTab === 'windows' 
                          ? 'bg-white/10 text-white' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      WIN
                    </button>
                  </div>
                </div>
                <div className="p-4 min-h-[60px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between w-full group"
                    >
                      <div className="flex items-center gap-2 font-mono text-sm overflow-hidden">
                        <span className="text-gray-500 select-none">$</span>
                        <span className="text-gray-100 truncate">{activeStepData.terminal}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(activeStepData.terminal)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded ml-2"
                      >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="mt-8 space-y-3">
                {/* Progress Circles */}
                <div className="flex gap-2 mb-4">
                  {steps.map((step) => (
                    <motion.div
                      key={step.id}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        activeStep === step.id ? 'bg-brand-orange' : 'bg-gray-600'
                      }`}
                      animate={{
                        backgroundColor: activeStep === step.id ? '#FF6B35' : '#4B5563',
                        scale: activeStep === step.id ? 1.2 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>

                {/* Step List */}
                <div className="space-y-1">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 transition-colors ${
                        activeStep === step.id
                          ? 'text-brand-orange'
                          : 'text-gray-500'
                      }`}
                    >
                      <span className={`font-mono text-xs font-medium w-5 ${activeStep === step.id ? 'text-brand-orange' : 'text-gray-500'}`}>
                        {String(step.id).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-wider">
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="relative h-full flex items-center">
              <CodeEditor 
                code={activeStepData.code}
                fileName={activeStepData.fileName}
                stepTitle={activeStepData.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Code Editor Component (Preserved exactly as is, just simplified types for brevity)
interface CodeEditorProps {
  code: string;
  fileName: string;
  stepTitle: string;
}

const CodeEditor = ({ code, fileName, stepTitle }: CodeEditorProps) => {
  type FileTreeItem = 
    | { name: string; type: 'folder'; expanded: boolean; children?: FileTreeItem[] }
    | { name: string; type: 'file'; active?: boolean };

  const fileTree: FileTreeItem[] = [
    { name: '.github', type: 'folder', expanded: false },
    { name: 'src', type: 'folder', expanded: true, children: [
      { name: fileName, type: 'file', active: true }
    ]},
    { name: 'package.json', type: 'file' },
  ];

  const syntaxHighlight = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      let highlighted = line;
      // Simple regex highlighting for demo
      if (line.trim().startsWith('//')) {
        highlighted = `<span class="text-gray-500 italic">${line}</span>`;
      } else {
        highlighted = highlighted
            .replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
            .replace(/\b(const|import|from|await|async|if|else|return|new|class|interface|type|export|default)\b/g, '<span class="text-purple-400">$1</span>')
            .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="text-blue-400">$1</span>(')
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>');
      }
      
      return (
        <div key={idx} className="flex hover:bg-white/5 transition-colors">
          <span className="text-gray-700 select-none mr-4 w-8 text-right text-xs pt-0.5">{idx + 1}</span>
          <span className="flex-1 font-mono text-[13px]" dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl w-full max-w-xl mx-auto"
    >
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={stepTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs font-mono text-gray-500 uppercase tracking-wider"
          >
            {stepTitle}
          </motion.div>
        </AnimatePresence>
        <div className="w-16"></div>
      </div>

      <div className="flex h-[500px]">
        {/* Sidebar */}
        <div className="w-48 bg-[#0D0D0D] border-r border-white/5 p-3 hidden sm:block">
          <div className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-3 px-2">EXPLORER</div>
          <div className="space-y-1">
            {fileTree.map((item, idx) => (
              <div key={idx} className="text-xs">
                {item.type === 'folder' ? (
                  <>
                    <div className="flex items-center gap-1 px-2 py-1 text-gray-400">
                      <ChevronRight size={12} className={item.expanded ? 'rotate-90' : ''} />
                      <Folder size={12} />
                      <span>{item.name}</span>
                    </div>
                    {item.children && item.expanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child, cIdx) => (
                           <motion.div key={cIdx} 
                            layoutId={child.type === 'file' && child.active ? "active-file" : undefined}
                            className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${child.type === 'file' && child.active ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-500'}`}
                           >
                              <FileCode size={12} />
                              <span>{child.name}</span>
                           </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 text-gray-500">
                     <FileCode size={12} />
                     <span>{item.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-1 bg-[#111] border-b border-white/5 px-2 overflow-x-auto no-scrollbar">
             <div className="px-3 py-2 bg-[#0A0A0A] border-t-2 border-brand-orange text-sm font-mono text-white flex items-center gap-2 whitespace-nowrap">
                <FileCode size={12} className="text-brand-orange"/>
                {fileName}
             </div>
          </div>
          <div className="flex-1 overflow-auto bg-[#0A0A0A] p-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={fileName}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {syntaxHighlight(code)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HowItWorks;