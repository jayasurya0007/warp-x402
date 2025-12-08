import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Check, FileCode, Folder, Zap, ChevronRight, Lock, Unlock } from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to track state inside the event listener without re-binding
  const stepRef = useRef(1);
  const isScrollingRef = useRef(false);
  const totalSteps = 4;

  // Keep stepRef in sync with activeStep
  useEffect(() => {
    stepRef.current = activeStep;
  }, [activeStep]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // 1. Check Boundary: Only engage if the section is roughly at the top of the viewport
      const rect = container.getBoundingClientRect();
      const isAtTop = Math.abs(rect.top) < 50; // 50px tolerance

      // If we aren't centered at the top, let the user scroll naturally to get there (or away)
      if (!isAtTop) return;

      // 2. Check Animation Cooldown
      if (isScrollingRef.current) {
        e.preventDefault(); 
        return;
      }

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentStep = stepRef.current;

      // SCROLL DOWN LOGIC
      if (direction === 1) {
        if (currentStep < totalSteps) {
          // If NOT at the last step, LOCK scroll and advance
          e.preventDefault();
          isScrollingRef.current = true;
          stepRef.current = currentStep + 1;
          setActiveStep(stepRef.current);
          
          setTimeout(() => { isScrollingRef.current = false; }, 800);
        } 
        // If at last step, allow default (scrolls page down to next section)
      } 
      
      // SCROLL UP LOGIC
      else if (direction === -1) {
        if (currentStep > 1) {
          // If NOT at the first step, LOCK scroll and go back
          e.preventDefault();
          isScrollingRef.current = true;
          stepRef.current = currentStep - 1;
          setActiveStep(stepRef.current);
          
          setTimeout(() => { isScrollingRef.current = false; }, 800);
        }
        // If at first step, allow default (scrolls page up to previous section)
      }
    };

    // Add native event listener with { passive: false } to allow preventing default
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [totalSteps]);

  const steps = [
    {
      id: 1,
      title: "Request Resource",
      description: "Client requests protected content. Server responds with HTTP 402 and a unique Payment ID for cross-chain payment.",
      icon: <Lock size={20} className="text-brand-orange" />,
      terminal: "curl -X GET http://localhost:3000/resource",
      code: `// Server responds with HTTP 402 Payment Required
import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';

app.get('/resource', (req, res) => {
  // Generate unique payment ID
  const paymentId = ethers.keccak256(
    ethers.toUtf8Bytes(\`payment-\${Date.now()}-\${Math.random()}\`)
  );
  
  // Return HTTP 402 with payment details
  res.status(402).json({
    error: 'Payment Required',
    message: 'This resource requires payment to access',
    payment: {
      paymentId: paymentId,
      amount: '1000000000000000000', // 1 AVAX in wei
      amountFormatted: '1.0 AVAX',
      senderChainId: 43113,
      receiverChainId: 43113,
      senderContract: '0x0d45537c1DA893148dBB113407698E20CfA2eE56',
      receiverContract: '0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f'
    }
  });
});`,
      fileName: "server.js",
    },
    {
      id: 2,
      title: "Send Payment",
      description: "User sends funds to the WarpSender contract on the Source Chain using the avax-warp-pay SDK. The payment ID from step 1 is used to link the payment.",
      icon: <Zap size={20} className="text-yellow-400" />,
      terminal: "npm install avax-warp-pay ethers",
      code: `import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';

// Initialize SDK with chain configuration
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY,
  senderChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: '0x0d45537c1DA893148dBB113407698E20CfA2eE56'
  },
  receiverChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: '0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f'
  }
});

// Get paymentId from HTTP 402 response (from step 1)
const response = await fetch('http://localhost:3000/resource');
const { payment } = await response.json();
const paymentId = payment.paymentId;

// Send payment using the paymentId from server
const amount = ethers.parseEther("1.0");
await warp.pay(amount, paymentId);

console.log('Payment sent! Payment ID:', paymentId);
// Payment receipt will be relayed via Teleporter`,
      fileName: "client.js",
    },
    {
      id: 3,
      title: "Cross-Chain Relay",
      description: "Avalanche Teleporter automatically relays the payment receipt from WarpSender to WarpReceiver contract within 5-10 seconds via Inter-Chain Messaging (ICM).",
      icon: <ArrowRight size={20} className="text-blue-400" />,
      terminal: "Teleporter: Relaying payment receipt via ICM...",
      code: `// Teleporter automatically handles cross-chain relay
// No additional code needed - it's built into Avalanche

// WarpSender contract emits PaymentSent event and sends
// cross-chain message via Teleporter messenger

// The WarpReceiver contract receives the message and stores:
// - paymentId: bytes32
// - payer: address (from msg.sender on sender chain)
// - amount: uint256 (from msg.value)
// - timestamp: uint256 (block.timestamp)

// This happens automatically via Avalanche's 
// Inter-Chain Message (ICM) protocol in ~5-10 seconds`,
      fileName: "teleporter.md",
    },
    {
      id: 4,
      title: "Verify & Access",
      description: "Server verifies the payment receipt on the Receiver Chain using WarpReceiver contract, then consumes it via POST /consume to grant access to the protected resource.",
      icon: <Unlock size={20} className="text-green-400" />,
      terminal: "curl -X POST http://localhost:3000/consume/0x1234...5678",
      code: `// Server-side verification and consumption
import { Warp402 } from 'avax-warp-pay';

const warp = new Warp402({
  privateKey: process.env.SERVER_PRIVATE_KEY,
  senderChain: { /* ... */ },
  receiverChain: { /* ... */ }
});

// Step 1: Verify payment (GET /verify/:paymentId)
app.get('/verify/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  const isVerified = await warp.verify(paymentId);
  
  if (isVerified) {
    const receipt = await warp.getReceipt(paymentId);
    return res.json({ verified: true, receipt });
  }
  
  return res.json({ verified: false });
});

// Step 2: Consume payment and grant access (POST /consume/:paymentId)
app.post('/consume/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  
  // Validate payment is valid (exists, not consumed, not expired)
  const isValid = await warp.receiver.isValidPayment(paymentId);
  
  if (!isValid) {
    return res.status(403).json({ 
      error: "Payment invalid, expired, or already consumed" 
    });
  }
  
  // Consume payment (prevents replay attacks)
  await warp.consume(paymentId);
  
  // Return protected resource
  return res.json({ 
    success: true,
    data: protectedResource 
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
    <div 
        ref={containerRef}
        className="relative min-h-screen bg-[#080808] py-20"
    >
      
      {/* Main container */}
      <div className="h-full overflow-hidden flex items-center">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="w-full px-6 md:px-12 lg:px-24 relative z-10">
          {/* CHANGED: Removed 'items-start' to allow columns to stretch to equal height */}
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Left Panel: Text Content */}
            {/* CHANGED: Added 'flex flex-col h-full justify-between' to force content to spread and align bottoms */}
            <div className="flex flex-col h-full justify-between py-2">
              
              {/* Top Section Wrapper */}
              <div>
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">PRODUCT</span>
                </div>

                {/* Main Heading */}
                <h2 className="text-4xl md:text-6xl font-bold font-manrope leading-tight mb-6 text-white">
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
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-lg mb-8">
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
              </div>

              {/* Step Navigation - Pushed to Bottom */}
              <div className="mt-auto">
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
                      className={`flex items-center gap-2 transition-colors cursor-pointer ${
                        activeStep === step.id
                          ? 'text-brand-orange'
                          : 'text-gray-500'
                      }`}
                      onClick={() => {
                        stepRef.current = step.id;
                        setActiveStep(step.id);
                      }}
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
            {/* Height is determined by the CodeEditor component, left panel will stretch to match */}
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

// Code Editor Component
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
      className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl w-full max-w-4xl mx-auto"
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

      <div className="flex h-[700px]">
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