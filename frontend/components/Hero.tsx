
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';

// 1. Define the PixelPlanet component first
const PixelPlanet = ({ color = "#a83a18" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Configuration
    const pixelSize = 3;
    const globeRadius = 500; // Larger for background

    // Resize logic
    const resize = () => {
      // Set high resolution for crisp pixels
      canvas.width = 2000;
      canvas.height = 2000;
    };
    resize();

    // Fibonacci Sphere Algorithm
    const createPoints = () => {
      const points = [];
      const count = 2500; 
      const goldenRatio = (1 + 5 ** 0.5) / 2;

      for (let i = 0; i < count; i++) {
        const theta = (2 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        
        points.push({
          x: globeRadius * Math.sin(phi) * Math.cos(theta),
          y: globeRadius * Math.sin(phi) * Math.sin(theta),
          z: globeRadius * Math.cos(phi),
          baseX: globeRadius * Math.sin(phi) * Math.cos(theta),
          baseZ: globeRadius * Math.cos(phi),
        });
      }
      return points;
    };

    const points = createPoints();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      time += 0.002; // Slower Rotation

      points.forEach((point) => {
        // Rotation math (Y-axis)
        const x = point.baseX * Math.cos(time) - point.baseZ * Math.sin(time);
        const z = point.baseX * Math.sin(time) + point.baseZ * Math.cos(time);
        
        // Simple depth sorting/culling
        if (z < -globeRadius / 1.5) return;

        // Perspective scale & Alpha
        const scale = (z + globeRadius * 2) / (globeRadius * 2); // 0.5 to 1.5
        const alpha = (z + globeRadius) / (globeRadius * 2);
        
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.8, alpha));

        // Draw pixel
        ctx.fillRect(
            cx + x, 
            cy + point.y, 
            pixelSize * (z > 0 ? 1.2 : 1), 
            pixelSize * (z > 0 ? 1.2 : 1)
        );
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [color]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-contain mix-blend-screen opacity-50"
    />
  );
};

// 2. The Hero Component
const Hero = () => {
  const [copied, setCopied] = useState(false);
  const installCommand = "npm install avax-warp-pay";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-black font-sans">
      
      {/* Background Planet - Centered & Large */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
         <div className="w-[100vw] h-[100vw] max-w-[2000px] max-h-[2000px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-[10%]">
             <div className="absolute inset-0 bg-brand-orange/10 blur-[150px] rounded-full" />
             <PixelPlanet color="#E84142" /> 
         </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center c">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
           <span className="text-brand-orange font-mono text-sm tracking-[0.2em] mb-6 inline-block uppercase font-bold px-3 py-1 rounded border border-brand-orange/20 bg-brand-orange/10">
            HTTP 402 ON AVALANCHE
          </span>
          <h1 className="text-5xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight">
            Warp-402 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500">
              verified instantly.
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl">
            Pay on one subnet, verify on another
          </p>
          
          {/* Powered By Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="flex flex-col items-center">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Powered by</span><br />
            <div className="flex items-center gap-4 transition-all duration-300">
               <img src="/x402.png" alt="x402" className="h-8 w-auto object-contain" />
               <div className="h-4 w-px bg-white/10"></div>
               <img src="/avalanche.png" alt="Avalanche" className="h-6 w-auto object-contain" />
            </div>
            </div>
          </motion.div>
          
          {/* New Terminal Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-orange to-orange-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Terminal Card */}
            <div 
              onClick={handleCopy}
              className="relative flex items-center gap-4 bg-[#0A0A0A] border border-white/10 rounded-xl px-6 py-5 md:py-6 shadow-2xl cursor-pointer hover:bg-[#111] transition-colors min-w-[300px] md:min-w-[450px] justify-between"
            >
              <div className="flex items-center gap-3 font-mono text-sm md:text-lg">
                <span className="text-gray-500 select-none">$</span>
                <span className="text-gray-100">npm install <span className="text-brand-orange">avax-warp-pay</span></span>
              </div>
              
              <div className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 text-gray-400 transition-colors">
                 {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
              </div>
            </div>
            
            <div className="absolute top-full left-0 right-0 mt-4 flex justify-center gap-6 text-[10px] md:text-xs font-mono text-gray-500 opacity-60">
               <span className="flex items-center gap-1"><Terminal size={10}/> v1.0.4</span>
               <span>MIT LICENSE</span>
               <span>60/60 TESTS PASSING</span>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Grid overlay for texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
    </section>
  );
};

export default Hero;
