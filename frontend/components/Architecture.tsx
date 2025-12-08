import React from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Zap,
  Code,
  ArrowDown,
  Database,
  Share2,
  ShieldCheck,
  Globe,
  Wallet,
  Infinity
} from 'lucide-react';

const Architecture = () => {
  return (
    <section className="relative min-h-screen bg-[#080808] py-24 overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="w-full px-6 md:px-12 relative z-10">

        {/* Header */}
        <div className="text-right mb-16 max-w-[1700px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-end gap-2 mb-6"
          >
            <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">ARCHITECTURE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-manrope leading-tight mb-6 text-white"
          >
            Warp-402 <span className="text-brand-orange">Payment System</span>
          </motion.h2>
        </div>

        {/* Zig Zag Stack Container */}
        <div className="max-w-[1400px] mx-auto flex flex-col gap-0 relative w-full">

          {/* LAYER 1: PAYMENT LAYER (SENDER) */}
          <LayerCard
            number="01"
            title="Payment Layer"
            subtitle="CHAIN A: SENDER"
            description="User initiates the flow. The Client pays funds on the Sender Chain (e.g., Fuji), generating a payment ID and triggering the cross-chain message."
            icon={<Wallet size={20} />}
            delay={0.2}
            align="left"
          >
            <div className="flex-1 w-full max-w-xs">
              <TerminalBlock filename="WarpSender.sol" activeLine={0}>
                <p className="bg-brand-orange/10 -mx-4 px-4 py-1 border-l-2 border-brand-orange text-white">function pay() external payable {'{'}</p>
                <p className="pl-4 text-gray-400">// 1. Receive Funds</p>
                <p className="pl-4 text-gray-300">paymentId = _generateId();</p>
                <p className="pl-4 text-gray-400">// 2. Send Cross-Chain Msg</p>
                <p className="pl-4 text-brand-orange">teleporter.send(</p>
                <p className="pl-8 text-gray-500">destinationChainId,</p>
                <p className="pl-8 text-gray-500">message = encode(paymentId)</p>
                <p className="pl-4 text-brand-orange">);</p>
                <p className="pl-4 text-gray-400">emit PaymentSent(paymentId);</p>
                <p className="text-white">{'}'}</p>
              </TerminalBlock>
            </div>
          </LayerCard>

          {/* L-Shaped Connector 1: Left to Right */}
          <LShapedConnector fromSide="left" toSide="right" />

          {/* LAYER 2: MESSAGING LAYER (TELEPORTER) */}
          <LayerCard
            number="02"
            title="Messaging Layer"
            subtitle="AVALANCHE TELEPORTER"
            description="The secure, trust-minimized relay. Validators sign the message on the source subnet, and Relayers deliver it to the destination."
            icon={<Globe size={20} />}
            delay={0.3}
            align="right"
            isMiddle={true}
          >
            {/* CHANGED: Increased vertical padding (py-10) and switched to flex-col for better vertical stacking */}
            <div className="flex-1 w-full flex flex-col items-center justify-center py-10 relative">

              {/* Network Visualization */}
              <div className="relative z-10 flex items-center justify-center gap-8 md:gap-16 text-center w-full">

                {/* Element 1: Validators */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#111] border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-[0_0_15px_-5px_rgba(232,65,66,0.3)] transition-transform hover:scale-105">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Validators</span>
                </div>

                {/* Element 2: Rotating Share Core */}
                {/* CHANGED: Added flex-col and gap-3 to match neighbors so alignment is perfect */}
                <div className="flex flex-col items-center gap-3 relative px-2">
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 -m-4 rounded-full"
                    />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange/80 flex items-center justify-center text-white shadow-lg relative z-10">
                      <Share2 size={24} />
                    </div>

                    {/* Connecting Line Effect - Positioned relative to the icon wrapper now */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent -z-0" />
                  </div>

                  {/* CHANGED: Invisible spacer text. This ensures the middle element has the same height structure as the sides, forcing the icons to align perfectly. */}
                  <span className="text-[9px] font-mono opacity-0 uppercase tracking-wider">Spacer</span>
                </div>

                {/* Element 3: Relayers */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#111] border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-[0_0_15px_-5px_rgba(232,65,66,0.3)] transition-transform hover:scale-105">
                    <Zap size={20} />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Relayers</span>
                </div>
              </div>

              {/* Bottom Text */}
              {/* CHANGED: Removed absolute positioning. Added mt-6 to create physical space below the symbols. */}
              <div className="mt-6 text-center w-full relative z-10">
                <span className="text-[10px] font-mono font-bold text-gray-600 tracking-[0.2em] opacity-50">AWM + BLS SIGS</span>
              </div>
            </div>
          </LayerCard>

          {/* L-Shaped Connector 2: Right to Left */}
          <LShapedConnector fromSide="right" toSide="left" />

          {/* LAYER 3: VERIFICATION LAYER (RECEIVER) */}
          <LayerCard
            number="03"
            title="Verification Layer"
            subtitle="CHAIN B: RECEIVER"
            description="Service unlocks the resource. The receiver contract verifies the message, stores the receipt, and allows the API to consume the payment."
            icon={<Server size={20} />}
            delay={0.4}
            align="left"
          >
            <div className="flex-1 w-full max-w-xs flex gap-4">
              <div className="flex-1">
                <TerminalBlock filename="WarpReceiver.sol">
                  <p className="text-gray-400">// 3. Receive & Store</p>
                  <p className="text-white">function receiveWarpMsg(...) {'{'}</p>
                  <p className="pl-4 text-gray-300">receipts[id] = true;</p>
                  <p className="text-white">{'}'}</p>
                  <p className="mt-2 text-gray-400">// 4. Consume</p>
                  <p className="text-brand-orange">function consume(id) {'{'}</p>
                  <p className="pl-4 text-gray-300">require(receipts[id]);</p>
                  <p className="pl-4 text-gray-300">receipts[id] = false;</p>
                  <p className="text-white">{'}'}</p>
                </TerminalBlock>
              </div>

              {/* Database/Resource Graphic */}
              <div className="hidden md:flex flex-col items-center justify-center gap-3 pl-4 border-l border-white/5">
                <div className="flex flex-col gap-1.5">
                  <div className="w-12 h-2 bg-brand-orange/20 rounded-full border border-brand-orange/20" />
                  <div className="w-12 h-2 bg-brand-orange/20 rounded-full border border-brand-orange/20" />
                  <div className="w-12 h-2 bg-brand-orange/20 rounded-full border border-brand-orange/20" />
                </div>
                <Database size={28} className="text-gray-500" />
                <span className="text-[9px] font-mono text-gray-400">Resource</span>
              </div>
            </div>
          </LayerCard>

        </div>
      </div>
    </section>
  );
};

// --- Sub-components ---

const LayerCard = ({ number, title, subtitle, description, icon, children, delay, isMiddle, gradient, align = "left" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className={`relative z-10 group md:w-[60%] ${align === "left" ? "md:mr-auto" : "md:ml-auto"}`}
  >
    <div className={`
        relative w-full border border-white/10 rounded-xl p-5 md:p-8 
        flex flex-col md:flex-row items-center gap-6 md:gap-10 overflow-hidden
        group-hover:border-brand-orange/30 transition-colors duration-500
        ${align === "right" ? "md:flex-row-reverse" : ""}
    `}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 pointer-events-none`} />

      {/* Content Side */}
      <div className={`flex-1 relative z-10 md:max-w-[45%] ${align === "right" ? "text-left md:text-right" : "text-left"}`}>
        <div className={`flex items-center gap-2 mb-3 ${align === "right" ? "md:justify-end" : ""}`}>
          <span className="text-3xl font-bold text-white/10">{number}.</span>
          <div className="p-1.5 bg-brand-orange/10 rounded-lg border border-brand-orange/20 text-brand-orange">
            {icon}
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-bold font-manrope text-white tracking-wide mb-1">{title}</h3>
        <p className="text-[10px] font-mono text-gray-500 tracking-widest mb-3 uppercase">{subtitle}</p>
        <p className="text-sm md:text-base font-normal text-gray-400 leading-relaxed font-manrope">
          {description}
        </p>
      </div>

      {/* Technical/Visual Side */}
      <div className={`w-full md:w-auto flex-1 relative z-10 flex ${align === "right" ? "md:justify-start" : "md:justify-end"}`}>
        {children}
      </div>
    </div>
  </motion.div>
);

const LShapedConnector = ({ fromSide, toSide }: { fromSide: "left" | "right", toSide: "left" | "right" }) => {
  const isLeftToRight = fromSide === "left" && toSide === "right";

  // Coordinates for the connector lines
  const leftX = "3%";
  const rightX = "97%";

  return (
    <div className="h-12 md:h-24 w-full flex items-center relative py-2">
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {/* Vertical segment (top) */}
        <line
          x1={isLeftToRight ? leftX : rightX}
          y1="0%"
          x2={isLeftToRight ? leftX : rightX}
          y2="50%"
          stroke="rgba(232, 65, 66, 0.4)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Horizontal segment */}
        <line
          x1={isLeftToRight ? leftX : rightX}
          y1="50%"
          x2={isLeftToRight ? rightX : leftX}
          y2="50%"
          stroke="rgba(232, 65, 66, 0.4)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Vertical segment (bottom) */}
        <line
          x1={isLeftToRight ? rightX : leftX}
          y1="50%"
          x2={isLeftToRight ? rightX : leftX}
          y2="100%"
          stroke="rgba(232, 65, 66, 0.4)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Arrow indicator at corner */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
        style={{
          left: isLeftToRight ? leftX : rightX
        }}
      >
        <div className="bg-[#080808] p-1.5 rounded-full border border-brand-orange/20 text-brand-orange/50">
          {/* CHANGED: Removed the rotation logic. It now always points down. */}
          <ArrowDown size={12} />
        </div>
      </div>
    </div>
  );
}

const TerminalBlock = ({ filename, children }: any) => (
  <div className="bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden shadow-2xl w-full">
    <div className="bg-white/5 border-b border-white/5 px-3 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Code size={10} className="text-brand-orange" />
        <span className="text-gray-400 font-mono text-[10px]">{filename}</span>
      </div>
      <div className="flex gap-1.5 opacity-30">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
      </div>
    </div>
    <div className="p-3 font-mono text-[10px] md:text-xs text-gray-300 space-y-1 leading-relaxed overflow-x-auto">
      {children}
    </div>
  </div>
);

export default Architecture;