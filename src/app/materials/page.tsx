"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const materials = [
  { name: "Cement Brands", desc: "UltraTech, ACC, or equivalent 53 Grade OPC cement for all structural works.", quality: "Premium structural integrity and setting time." },
  { name: "Steel Quality", desc: "Tata Tiscon, JSW Neo, or equivalent Fe-550D grade TMT bars.", quality: "High earthquake resistance and tensile strength." },
  { name: "Sand Quality", desc: "River sand for plastering and Robo sand (M-Sand) for concreting.", quality: "Sifted and washed for zero silt content." },
  { name: "Bricks & Blocks", desc: "Red clay bricks (Class 1) or AAC Blocks (Aerocon).", quality: "Excellent thermal insulation and load-bearing capacity." },
  { name: "Electrical Materials", desc: "Finolex/Polycab wires, Legrand/Anchor Roma modular switches.", quality: "Fire-retardant and high-load capacity." },
  { name: "Plumbing Materials", desc: "Ashirvad/Astral CPVC pipes, Jaquar/Kohler bath fittings.", quality: "Leak-proof, pressure-tested, and anti-corrosive." },
  { name: "Paint Brands", desc: "Asian Paints Royale (Interior) and Apex Ultima (Exterior).", quality: "Weather-proof, washable, and anti-fungal." },
  { name: "Flooring Materials", desc: "Kajaria/Somany vitrified tiles (2x4) or Italian Marble.", quality: "Scratch-resistant and high-gloss finish." },
  { name: "Wood & Interior", desc: "Teak wood for main door, CenturyPly/Greenply for woodwork.", quality: "Termite-proof and borer-resistant." },
  { name: "Waterproofing", desc: "Dr. Fixit Pidifin 2K for terraces and bathrooms.", quality: "100% moisture barrier guaranteed." },
];

export default function MaterialsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto relative">
      
      {/* Blueprint Style Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tighter">
          Material <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200">Specifications</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          We never compromise on quality. Explore the premium brands and materials we use to build your dream home.
        </p>
      </motion.div>

      {/* Accordion List */}
      <div className="space-y-4 mb-24 relative z-10">
        {materials.map((mat, index) => (
          <motion.div
            key={mat.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={`glass-panel border transition-colors duration-300 overflow-hidden ${openIndex === index ? 'border-[#d4af37]' : 'border-white/10 hover:border-white/30'}`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
              <span className={`font-bold text-lg ${openIndex === index ? 'text-[#d4af37]' : 'text-white'}`}>
                {index + 1}. {mat.name}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className={openIndex === index ? 'text-[#d4af37]' : 'text-white/50'} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 pt-2 border-t border-white/5">
                    <p className="text-white/80 text-lg mb-3">{mat.desc}</p>
                    <div className="flex items-start gap-2 bg-[#d4af37]/10 p-4 rounded-lg border border-[#d4af37]/20">
                      <ShieldCheck className="text-[#d4af37] shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-[#d4af37]/90">{mat.quality}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex justify-center relative z-10"
      >
        <Link href="/calculator">
          <button className="group relative px-8 py-5 rounded-full bg-gradient-to-r from-[#d4af37] to-yellow-600 text-black font-bold tracking-widest uppercase flex items-center gap-4 shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:scale-105 transition-all">
            <span>Open Interior Quote Calculator</span>
            <span className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight size={20} />
            </span>
          </button>
        </Link>
      </motion.div>
      
    </div>
  );
}
