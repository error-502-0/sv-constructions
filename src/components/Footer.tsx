import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020617] pt-20 pb-10 relative z-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[#d4af37]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group inline-flex">
              <img 
                src="/logo.jpg" 
                alt="SV Constructions Logo" 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Building Dreams Into Reality. Premium construction, Vastu-compliant architecture, and cinematic interior designs in Visakhapatnam.
            </p>
            <div className="inline-block px-3 py-1 rounded border border-[#d4af37]/20 bg-[#d4af37]/5 text-xs font-bold tracking-widest text-[#d4af37]">
              License No: 02/2024-27-CE
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Quick Links</h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li><Link href="/about" className="hover:text-[#d4af37] transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-[#d4af37] transition-colors">Our Services</Link></li>
              <li><Link href="/projects" className="hover:text-[#d4af37] transition-colors">Portfolio</Link></li>
              <li><Link href="/materials" className="hover:text-[#d4af37] transition-colors">Material Specs</Link></li>
              <li><Link href="/calculator" className="hover:text-[#d4af37] transition-colors">Smart Quote</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Contact Us</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#d4af37] shrink-0 mt-0.5" size={16} />
                <a href="https://maps.app.goo.gl/RcgBKwZosgWxbu718" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  main road, Elamanchili, Andhra Pradesh 531055
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#d4af37] shrink-0" size={16} />
                <a href="https://wa.me/919293946049" className="hover:text-white transition-colors">9293946049</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#d4af37] shrink-0" size={16} />
                <a href="mailto:praneethkatta18091@gmail.com" className="hover:text-white transition-colors">praneethkatta18091@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <InstagramIcon />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <FacebookIcon />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <TwitterIcon />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <LinkedinIcon />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} SRI VENKATESWARA Constructions. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
