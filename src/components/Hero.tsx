"use client";

import { motion } from "framer-motion";
import { Sparkles, Home, Box, Cuboid, Layers, Hammer, PaintBucket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ServicesPreview } from "@/components/ServicesPreview";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* 3D Animated Heading */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="mb-12 relative"
        style={{ perspective: "1000px" }}
      >
        <motion.h2 
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="text-3xl md:text-5xl font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#fff5d1] to-[#b8860b] bg-[length:200%_auto]"
          style={{ textShadow: "0 10px 30px rgba(212,175,55,0.4), 0 2px 10px rgba(212,175,55,0.2)" }}
        >
          SVC INTERIORS
        </motion.h2>
      </motion.div>

      {/* Main Title - Premium Construction Style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center z-20 mb-8"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-2xl font-[family-name:var(--font-geist-sans)] max-w-5xl leading-tight" style={{ textShadow: "0 4px 30px rgba(212,175,55,0.2)" }}>
          Premium Home Interiors in
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200 block mt-2">
            Andhra Pradesh, Telangana and Bangaluru<span className="text-[#d4af37] text-4xl absolute mt-2 ml-2">•</span>
          </span>
        </h1>
        <div className="flex items-center gap-2 mt-6 text-sm font-bold tracking-widest text-[#d4af37]">
          PREMIUM <span className="text-white/50">•</span> CONSTRUCTION <span className="text-white/50">•</span> INTERIORS
        </div>
      </motion.div>

      {/* Subtitles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center z-20 mb-16"
      >
        <p className="text-white/70 text-lg">Uncompromising quality and Vastu-compliant designs.</p>
        <p className="text-white/70 text-lg">Premium Interiors &amp; Construction with Complete Material Transparency</p>
      </motion.div>

      {/* Floating 3D Interaction Panel (Hyper3D layout adapted for Construction) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: "spring", damping: 20 }}
        className="relative z-30"
      >
        <div className="flex justify-center items-center gap-6 w-full relative">
          {/* Side Toolbar */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="w-10 h-10 rounded-full border border-[#d4af37] flex items-center justify-center text-[#d4af37] relative bg-[#d4af37]/10">
              <Sparkles size={16} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4af37] rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-full" /></div>
            </Link>
            <Link href="/about" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition">
              <Home size={16} />
            </Link>
            <Link href="/services" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition">
              <Hammer size={16} />
            </Link>
            <Link href="/projects" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition">
              <Layers size={16} />
            </Link>
          </div>

          {/* Main Display Container (No Background) */}
          <Link href="/projects" className="flex items-center gap-8 relative cursor-pointer group transition-colors pl-8">
            
            {/* Rummy Cards Display (Left) */}
            <div className="relative w-64 h-56 flex items-center justify-center">
              {/* Card 1 (Left) */}
              <div className="absolute w-48 h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl -rotate-12 -translate-x-14 z-10 transition-transform duration-300 group-hover:-translate-x-24 group-hover:-rotate-[15deg]">
                <Image src="/projects/interior-1.jpg" alt="Project 1" fill className="object-cover" />
              </div>
              
              {/* Card 3 (Right) */}
              <div className="absolute w-48 h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl rotate-12 translate-x-14 z-10 transition-transform duration-300 group-hover:translate-x-24 group-hover:rotate-[15deg]">
                <Image src="/projects/interior-3.jpg" alt="Project 3" fill className="object-cover" />
              </div>

              {/* Card 2 (Center - Highest z-index) */}
              <div className="absolute w-48 h-48 rounded-2xl overflow-hidden border-2 border-[#d4af37]/80 shadow-[0_0_20px_rgba(212,175,55,0.3)] z-20 transition-transform duration-300 group-hover:-translate-y-6 group-hover:scale-105">
                <Image src="/projects/interior-2.jpg" alt="Project 2" fill className="object-cover" />
              </div>
            </div>

            {/* View Projects Icon & Text (Right) */}
            <div className="flex items-center gap-3 z-30 pl-4">
              <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37] flex items-center justify-center text-[#d4af37] text-2xl font-light shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d4af37]/20 group-hover:text-white">
                +
              </div>
              <div className="text-white/80 font-bold tracking-wider uppercase text-sm group-hover:text-[#d4af37] transition-colors">
                View Projects
              </div>
            </div>
          </Link>
        </div>

        {/* Generate/Quote Button Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
          <Link href="/materials" className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white hover:bg-[#d4af37]/20 transition border border-[#d4af37]/30">
            <Cuboid size={20} className="text-[#d4af37]" />
          </Link>
          <button onClick={() => window.dispatchEvent(new Event('open-side-quote'))} className="px-16 py-4 rounded-full bg-gradient-to-r from-[#d4af37] to-yellow-600 text-black font-bold tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform uppercase">
            Get Smart Quote
          </button>
        </div>

        {/* INJECTED SERVICES PREVIEW */}
        <ServicesPreview />
      </motion.div>
    </section>
  );
}
