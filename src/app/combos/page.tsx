"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Plus } from "lucide-react";
import Link from "next/link";
import { fetchCombos, Combo } from "@/services/pricingService";

export default function CombosPage() {
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

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tighter">
            Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200">Combos</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Choose from our pre-designed luxury interior packages with fixed pricing.
          </p>
        </div>
        
        {/* Owner login moved to Navbar */}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-12 h-12 rounded-full border-4 border-[#d4af37]/20 border-t-[#d4af37] animate-spin" />
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-2xl">
          <p className="text-white/50">No predefined combos available yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {combos.map((combo, idx) => (
            <motion.div 
              key={combo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-8 rounded-2xl flex flex-col relative group overflow-hidden"
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

              <Link href={`/calculator?comboId=${combo.id}`} className="mt-8 block w-full bg-white/5 hover:bg-[#d4af37] text-white hover:text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] text-center relative z-10">
                CHOOSE CUSTOMIZED PROJECT
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      

    </div>
  );
}
