"use client";

import { Hero } from "@/components/Hero";
import { CombosPreview } from "@/components/CombosPreview";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, Shield, HardHat, Sparkles, Building2, TrendingUp, Users } from "lucide-react";

// --- ANIMATED COUNTER COMPONENT ---
function AnimatedCounter({ value, label, suffix = "" }: { value: number, label: string, suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start > end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center p-6 glass-panel">
      <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200 mb-2">
        {count}{suffix}
      </div>
      <div className="text-white/60 font-bold uppercase tracking-widest text-sm">{label}</div>
    </div>
  );
}

// --- MAIN HOME PAGE ---
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* COMBOS PREVIEW SECTION */}
      <CombosPreview />

      {/* INTRODUCTION SECTION */}
      <section className="py-32 relative z-10 px-6 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Engineering <span className="text-[#d4af37]">Excellence</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              At SRI VENKATESWARA Constructions, we don't just build structures; we forge legacies. With a deep-rooted commitment to quality, Vastu principles, and modern architectural aesthetics, we transform your visions into concrete reality.
            </p>
            <Link href="/about">
              <button className="flex items-center gap-2 text-[#d4af37] font-bold hover:text-white transition-colors group">
                Discover Our Story <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
              </button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              className="relative rounded-3xl overflow-hidden group border border-[#d4af37]/20 shadow-[0_0_40px_rgba(212,175,55,0.1)]"
            >
               <motion.img 
                  src="/luxury-exterior.png" 
                  alt="Luxury Architecture" 
                  className="w-full h-full object-cover origin-center brightness-110"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1.25, x: [0, -10, 0], y: [0, 10, 0] }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6">
                 <div>
                   <h3 className="text-white font-extrabold text-xl mb-1 drop-shadow-md">Architectural Mastery</h3>
                   <p className="text-[#d4af37] text-xs font-bold uppercase tracking-widest drop-shadow-md">Exterior Design</p>
                 </div>
               </div>
               <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-colors rounded-3xl pointer-events-none" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.2 }} 
              className="relative rounded-3xl overflow-hidden group mt-12 border border-[#d4af37]/20 shadow-[0_0_40px_rgba(212,175,55,0.1)]"
            >
               <motion.img 
                  src="/luxury-interior.png" 
                  alt="Luxury Interior" 
                  className="w-full h-full object-cover origin-center brightness-110"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1.25, x: [0, 10, 0], y: [0, -10, 0] }}
                  transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6">
                 <div>
                   <h3 className="text-white font-extrabold text-xl mb-1 drop-shadow-md">Bespoke Interiors</h3>
                   <p className="text-[#d4af37] text-xs font-bold uppercase tracking-widest drop-shadow-md">Premium Living</p>
                 </div>
               </div>
               <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-colors rounded-3xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* COUNTERS SECTION */}
      <section className="py-16 relative z-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedCounter value={50} suffix="+" label="Projects Delivered" />
          <AnimatedCounter value={100} suffix="%" label="Vastu Compliant" />
          <AnimatedCounter value={10} suffix="+" label="Years Experience" />
          <AnimatedCounter value={500} suffix="+" label="Happy Clients" />
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-32 relative z-10 bg-[#020617]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why <span className="text-[#d4af37]">Choose Us</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <Shield />, title: "Trusted Partner", desc: "100% transparency in material quality and pricing." },
              { icon: <Sparkles />, title: "Vastu Based", desc: "Scientific approach to Vastu Shastra for prosperity." },
              { icon: <HardHat />, title: "Quality Materials", desc: "We use only premium branded construction materials." },
              { icon: <TrendingUp />, title: "On-Time Delivery", desc: "Strict adherence to project timelines and milestones." }
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-panel p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 relative z-10 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">Client <span className="text-[#d4af37]">Stories</span></h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel p-8 relative">
              <div className="flex gap-1 text-[#d4af37] mb-6">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p className="text-white/70 italic mb-6">"SRI VENKATESWARA Constructions delivered our dream home exactly as promised. The 3D planning was flawless and the execution was highly professional."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">C{i}</div>
                <div>
                  <div className="text-white font-bold text-sm">Happy Client</div>
                  <div className="text-white/50 text-xs">Visakhapatnam</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative z-10 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-5xl mx-auto glass-panel p-12 md:p-20 text-center rounded-[3rem] border-[#d4af37]/30 bg-gradient-to-b from-[#d4af37]/5 to-transparent">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to start your <span className="text-[#d4af37]">Project?</span></h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">Get an instant estimate using our smart calculator, or contact us directly to discuss your requirements.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => window.dispatchEvent(new Event('open-side-quote'))} className="px-8 py-4 rounded-full bg-[#d4af37] text-black font-bold hover:bg-yellow-400 transition-colors w-full sm:w-auto shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              Get Smart Quote
            </button>
            <Link href="/contact">
              <button className="px-8 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-colors w-full sm:w-auto">
                Contact Us
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
