"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { LogIn, MessageCircle, Menu, X, Calculator } from "lucide-react";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700", "800"] });

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "Materials", href: "/materials" },
  { name: "Contact", href: "/contact" },
  { name: "Customized Projects", href: "/combos" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[110] flex items-center justify-between px-6 py-4 transition-all duration-300",
          scrolled ? "bg-[#020617]/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        )}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left side - Logo & Pill */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.jpg" 
              alt="SV Constructions Logo" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105 rounded"
            />
            <div className={`hidden sm:flex flex-col justify-center ${cinzel.className}`}>
              <span className="text-[#d4af37] text-lg sm:text-xl font-bold leading-none tracking-widest drop-shadow-md">SV</span>
              <span className="text-white/90 text-[10px] sm:text-xs tracking-[0.3em] font-semibold mt-0.5">CONSTRUCTIONS</span>
            </div>
          </Link>
          <div className="hidden md:flex px-3 py-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-xs font-semibold tracking-wide text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            License: 02/2024-27-CE
          </div>
        </div>

        {/* Right side - Desktop Links */}
        <div className="hidden lg:flex items-center gap-2 relative" style={{ perspective: "1000px" }}>
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              whileHover={{ scale: 1.05, rotateX: 10, rotateY: -5, z: 10 }}
              whileTap={{ scale: 0.95, rotateX: 0, rotateY: 0, z: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link 
                href={link.href} 
                className={`relative overflow-hidden group text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all block whitespace-nowrap hover:text-black hover:border-[#d4af37] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] ${scrolled ? "text-[#d4af37] border border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_10px_rgba(212,175,55,0.2)]" : "text-white/80 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_2px_5px_rgba(0,0,0,0.2)]"}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-yellow-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></span>
                <span className="relative z-10 transition-colors duration-300">{link.name}</span>
              </Link>
            </motion.div>
          ))}
          
          <div className="w-px h-4 bg-white/20 mx-2" />

          <Link href="/calculator" className="text-sm font-bold text-black bg-gradient-to-r from-[#d4af37] to-yellow-600 px-4 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-1.5">
            <Calculator size={14} /> Smart Quote
          </Link>
          <a href="https://wa.me/919293946049" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#25D366] transition-colors" title="WhatsApp Us">
            <MessageCircle size={18} />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-bold text-white/80 hover:text-[#d4af37] transition-colors border-b border-white/5 pb-4"
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/calculator" 
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 text-center text-lg font-bold text-black bg-gradient-to-r from-[#d4af37] to-yellow-600 px-6 py-4 rounded-full flex items-center justify-center gap-2"
            >
              <Calculator size={20} /> Get Smart Quote
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
