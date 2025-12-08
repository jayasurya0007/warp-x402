import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { question: "What is Warp-402?", answer: "Warp-402 is an HTTP 402 payment system that enables true cross-chain payments using Avalanche's Teleporter protocol. You can pay on one subnet and verify it on another instantly." },
  { question: "How does it ensure security?", answer: "The system uses OpenZeppelin's standard security modules (ReentrancyGuard, Ownable), implements secure payment ID binding, and includes emergency pause functionality." },
  { question: "What networks are supported?", answer: "We support any EVM-compatible Avalanche subnet, the Fuji C-Chain, and local development networks. It works anywhere Teleporter is deployed." },
  { question: "Can I use this for real money?", answer: "The contracts are production-ready and tested, but currently deployed on Testnets. We recommend a third-party audit before Mainnet deployment." },
  { question: "Is there a transaction fee?", answer: "Standard network gas fees apply on both the sender and receiver chains. The WarpSender contract helps estimate and cover these cross-chain message fees." }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-black border-t border-white/10">
      <div className="w-full px-6 md:px-12 lg:px-24 grid md:grid-cols-3 gap-12">
        <div>
          <h2 className="text-4xl md:text-6xl font-bold font-manrope mb-6">
            Frequently <br/> asked <br/> questions
          </h2>
          <a href="https://github.com/jayasurya0007/wrap-x402" target="_blank" className="inline-block bg-brand-orange text-white px-6 py-3 rounded font-bold hover:bg-red-600 transition-colors">
             VIEW ON GITHUB
          </a>
        </div>
        
        <div className="md:col-span-2 space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-white/10 pb-4">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex justify-between items-center text-left py-4 hover:text-brand-orange transition-colors group"
              >
                <span className="text-lg font-medium">{faq.question}</span>
                <span className="text-gray-500 group-hover:text-brand-orange">
                  {openIndex === idx ? <Minus size={20}/> : <Plus size={20}/>}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-400 pb-4 pr-12">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;