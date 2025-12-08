import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Network, 
  Zap, 
  CheckCircle, 
  Key, 
  Shield, 
  ArrowRight,
  Send,
  FileCheck,
  Lock,
  Unlock,
  Circle
} from 'lucide-react';

interface Step {
  number: string;
  from: string;
  to: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  lineColor: string;
}

const Architecture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };
    resize();

    // Animated particles for connections
    interface Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      progress: number;
      speed: number;
      color: string;
    }

    const particles: Particle[] = [];
    let animationFrameId: number;

    const createParticles = () => {
      particles.length = 0;
      const width = canvas.width / 2;
      const height = canvas.height / 2;

      // Step 01: CLIENT → SERVER (vertical)
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: width * 0.2,
          y: height * 0.15 + i * 8,
          targetX: width * 0.2,
          targetY: height * 0.35,
          progress: i * 0.15,
          speed: 0.012,
          color: '#22c55e'
        });
      }

      // Step 02: CLIENT → CHAIN A (vertical)
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: width * 0.2,
          y: height * 0.4 + i * 8,
          targetX: width * 0.2,
          targetY: height * 0.55,
          progress: i * 0.15,
          speed: 0.012,
          color: '#E84142'
        });
      }

      // Step 03: CHAIN A → CHAIN B (horizontal)
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: width * 0.2 + i * 12,
          y: height * 0.6,
          targetX: width * 0.5,
          targetY: height * 0.6,
          progress: i * 0.12,
          speed: 0.01,
          color: '#3b82f6'
        });
      }

      // Step 04: CHAIN B → SERVER (diagonal)
      for (let i = 0; i < 8; i++) {
        const startX = width * 0.5;
        const startY = height * 0.6;
        const endX = width * 0.2;
        const endY = height * 0.35;
        particles.push({
          x: startX + (endX - startX) * (i * 0.12),
          y: startY + (endY - startY) * (i * 0.12),
          targetX: endX,
          targetY: endY,
          progress: i * 0.12,
          speed: 0.01,
          color: '#eab308'
        });
      }

      // Step 05: SERVER → CLIENT (vertical up)
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: width * 0.2,
          y: height * 0.35 - i * 8,
          targetX: width * 0.2,
          targetY: height * 0.15,
          progress: i * 0.15,
          speed: 0.012,
          color: '#a855f7'
        });
      }
    };

    createParticles();

    const animate = () => {
      const width = canvas.width / 2;
      const height = canvas.height / 2;
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);

      // Step 01: CLIENT → SERVER
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.15);
      ctx.lineTo(width * 0.2, height * 0.35);
      ctx.stroke();

      // Step 02: CLIENT → CHAIN A
      ctx.strokeStyle = 'rgba(232, 65, 66, 0.3)';
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.4);
      ctx.lineTo(width * 0.2, height * 0.55);
      ctx.stroke();

      // Step 03: CHAIN A → CHAIN B
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.6);
      ctx.lineTo(width * 0.5, height * 0.6);
      ctx.stroke();

      // Step 04: CHAIN B → SERVER
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.6);
      ctx.lineTo(width * 0.2, height * 0.35);
      ctx.stroke();

      // Step 05: SERVER → CLIENT
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.35);
      ctx.lineTo(width * 0.2, height * 0.15);
      ctx.stroke();

      ctx.setLineDash([]);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.progress += particle.speed;
        if (particle.progress > 1) {
          particle.progress = 0;
        }

        const currentX = particle.x + (particle.targetX - particle.x) * particle.progress;
        const currentY = particle.y + (particle.targetY - particle.y) * particle.progress;

        // Glow effect
        const gradient = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, 8
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, particle.color + '80');
        gradient.addColorStop(1, particle.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resize();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const steps: Step[] = [
    {
      number: '01',
      from: 'CLIENT',
      to: 'SERVER',
      description: 'GET /resource → Receives HTTP 402 + Payment ID',
      icon: <CheckCircle size={18} />,
      iconColor: 'text-green-400',
      lineColor: 'rgba(34, 197, 94, 0.4)'
    },
    {
      number: '02',
      from: 'CLIENT',
      to: 'CHAIN A',
      description: 'Send payment on Sender Chain (e.g., Fuji C-Chain)',
      icon: <Send size={18} />,
      iconColor: 'text-brand-orange',
      lineColor: 'rgba(232, 65, 66, 0.4)'
    },
    {
      number: '03',
      from: 'CHAIN A',
      to: 'CHAIN B',
      description: 'Teleporter relays payment receipt to Receiver Chain',
      icon: <Network size={18} />,
      iconColor: 'text-blue-400',
      lineColor: 'rgba(59, 130, 246, 0.4)'
    },
    {
      number: '04',
      from: 'CHAIN B',
      to: 'SERVER',
      description: 'GET /verify/:id → Check if payment received on Receiver Chain',
      icon: <Key size={18} />,
      iconColor: 'text-yellow-400',
      lineColor: 'rgba(234, 179, 8, 0.4)'
    },
    {
      number: '05',
      from: 'SERVER',
      to: 'CLIENT',
      description: 'POST /consume/:id → Mark payment used, return resource',
      icon: <Unlock size={18} />,
      iconColor: 'text-purple-400',
      lineColor: 'rgba(168, 85, 247, 0.4)'
    }
  ];

  return (
    <section className="relative min-h-screen bg-[#080808] py-20 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">ARCHITECTURE</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white">
            HOW <span className="text-brand-orange">WARP-402</span> WORKS
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Cross-chain payment flow powered by Avalanche Teleporter
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <div className="relative min-h-[900px]">
          {/* Animated Canvas for Connections */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ height: '100%' }}
          />

          {/* Components Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Components */}
            <div className="space-y-8 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CLIENT */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <Server className="text-yellow-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">CLIENT</h3>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">DAPP USERS</p>
                    </div>
                  </div>
                </motion.div>

                {/* SERVER */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <FileCheck className="text-green-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">SERVER</h3>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">X402 SERVER</p>
                    </div>
                  </div>
                </motion.div>

                {/* CHAIN A */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Network className="text-blue-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">CHAIN A</h3>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">SENDER CHAIN</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm font-mono text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">•</span>
                      <span>WarpSender.sol</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">•</span>
                      <span>sendPayment()</span>
                    </div>
                  </div>
                </motion.div>

                {/* CHAIN B */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <Shield className="text-cyan-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">CHAIN B</h3>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">RECEIVER CHAIN</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm font-mono text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>WarpReceiver.sol</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>hasPaid()</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>consumePayment()</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* TELEPORTER (Dotted Container) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="border-2 border-dashed border-purple-500/40 rounded-2xl p-6 bg-purple-500/5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-4">
                  <Zap className="text-purple-400" size={40} />
                  <div>
                    <h3 className="text-2xl font-bold text-white">TELEPORTER</h3>
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">CROSS-CHAIN RELAY</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 relative group hover:border-white/20 hover:bg-[#111] transition-all"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center shadow-lg border-2 border-[#0A0A0A]">
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>

                  {/* Icon Circle */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2.5 rounded-lg bg-white/5 ${step.iconColor} border border-white/10`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 leading-relaxed font-mono mb-3">
                    {step.description}
                  </p>

                  {/* From → To */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-white/5">
                    <span className="font-semibold text-white">{step.from}</span>
                    <ArrowRight size={12} className={step.iconColor} />
                    <span className="font-semibold text-white">{step.to}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-6">
            <p className="text-sm text-gray-300 leading-relaxed text-center">
              <span className="text-brand-orange font-bold">Instant Verification:</span> Payments are relayed across chains via Avalanche Teleporter in 5-10 seconds, enabling true cross-chain payment verification without intermediaries.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Architecture;
