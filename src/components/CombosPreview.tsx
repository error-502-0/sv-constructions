"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { fetchCombos, Combo } from "@/services/pricingService";

export function CombosPreview() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const combosData = await fetchCombos();
      setCombos(combosData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#d4af37]/20 border-t-[#d4af37] animate-spin" />
        </div>
      </section>
    );
  }

  if (combos.length === 0) return null;

  return (
    <section className="py-32 relative z-10 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-wider">
          <span className="text-[#d4af37]">Customized</span> Projects
        </motion.h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Choose from our pre-designed luxury interior packages with fixed pricing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {combos.slice(0, 3).map((combo, idx) => (
          <motion.div 
            key={combo.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-8 rounded-2xl flex flex-col relative group overflow-hidden border border-[#d4af37]/20 shadow-[0_0_20px_rgba(212,175,55,0.05)] hover:border-[#d4af37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">{combo.name}</h3>
              <div className="text-3xl font-extrabold text-[#d4af37] mb-6">
                ₹{combo.price.toLocaleString('en-IN')}
              </div>
              
              <div className="space-y-3 mb-8 flex-grow">
                {combo.items.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <CheckCircle2 className="text-[#d4af37] w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                ))}
                {combo.items.length > 8 && (
                  <div className="text-xs text-[#d4af37]/70 italic mt-2">
                    + {combo.items.length - 8} more features included
                  </div>
                )}
              </div>
            </div>

            <Link href={`/calculator?comboId=${combo.id}`} className="mt-auto block w-full bg-[#d4af37]/10 hover:bg-[#d4af37] border border-[#d4af37]/30 text-[#d4af37] hover:text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] text-center relative z-10">
              CHOOSE CUSTOMIZED PROJECT
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <Link href="/combos">
          <button className="px-8 py-3 rounded-full border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 font-bold transition-colors">
            View All Customized Projects
          </button>
        </Link>
      </div>
    </section>
  );
}
