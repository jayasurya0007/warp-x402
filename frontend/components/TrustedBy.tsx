import React from 'react';
import { motion } from 'framer-motion';

const TrustedBy = () => {
  return (
    <section className="py-20 border-b border-white/5 bg-brand-dark relative z-20">
      <div className="w-full px-6 md:px-12 lg:px-24 relative z-10">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">ABOUT</span>
          </motion.div>

          {/* Heading */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-manrope leading-tight mb-8 text-white"
          >
            Cross-Chain Payments <span className="text-brand-orange">Made Simple</span>
          </motion.h2>

          {/* Summary Text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 leading-relaxed mb-12 max-w-3xl"
          >
            Warp-402 is a revolutionary HTTP 402 payment system that enables true cross-chain payments on the Avalanche network. 
            Built on Avalanche Teleporter's Inter-Chain Messaging (ICM) protocol, it allows you to pay on one subnet and verify 
            the payment instantly on another—no bridges, no waiting, no complexity.
          </motion.p>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-8 text-left justify-items-start"
          >
            <div>
              <div className="text-3xl md:text-4xl font-bold font-manrope text-red-500 mb-2">
                5-10s
              </div>
              <div className="text-sm md:text-base text-gray-400">
                payment transfer
              </div>
            </div>

            <div>
              <div className="text-3xl md:text-4xl font-bold font-manrope text-red-500 mb-2">
                100%
              </div>
              <div className="text-sm md:text-base text-gray-400">
                trustless
              </div>
            </div>

            <div>
              <div className="text-3xl md:text-4xl font-bold font-manrope text-red-500 mb-2">
                ∞
              </div>
              <div className="text-sm md:text-base text-gray-400">
                Subnet support
              </div>
            </div>
          </motion.div>
      </div>
    </section>
  );
};

export default TrustedBy;
