"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function ServicesPreview() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 mt-16 z-30 relative">
      <div className="text-center mb-12">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-white mb-4">
          Our <span className="text-[#d4af37]">Services</span>
        </motion.h2>
        <p className="text-white/60 max-w-2xl mx-auto">End-to-end solutions for all your construction and interior needs.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 text-left">
        {["Building Construction", "3D Interior Design", "Govt Plan Approval"].map((service, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-panel p-8 group hover:-translate-y-2 transition-transform cursor-pointer border border-white/10 hover:border-[#d4af37]/50 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]">
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">{service}</h3>
            <p className="text-white/60 text-sm mb-6">Premium quality execution with strict adherence to timelines and budget.</p>
            <Link href="/services" className="text-[#d4af37] text-sm font-bold uppercase tracking-widest group-hover:text-white transition-colors">Explore</Link>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link href="/services">
          <button className="px-8 py-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">View All Services</button>
        </Link>
      </div>
    </div>
  );
}
