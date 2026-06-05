"use client";

import { motion } from "framer-motion";
import { User, Award, Flag, MapPin, Building2 } from "lucide-react";
import Image from "next/image";

const timelineEvents = [
  { year: "2018", title: "Foundation", description: "SRI VENKATESWARA Constructions established with a vision to redefine luxury living." },
  { year: "2020", title: "Expansion", description: "Expanded operations to commercial projects and smart home integrations." },
  { year: "2022", title: "Excellence Award", description: "Recognized for outstanding architectural contributions in Visakhapatnam." },
  { year: "2024", title: "Modern Era", description: "Launched advanced 3D planning and AI-assisted interior design services." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-24"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200">SVC</span>
        </h1>
        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
          Building Dreams Into Reality through uncompromising quality, Vastu-compliant designs, and state-of-the-art architectural innovation.
        </p>
      </motion.div>

      {/* Owner & License Section */}
      <div className="grid md:grid-cols-2 gap-12 mb-32 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative aspect-square md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden glass-panel border border-[#d4af37]/30 group"
        >
          {/* Owner Image */}
          <Image 
            src="/owner.jpg" 
            alt="Praneeth Katta - SRI VENKATESWARA Constructions"
            fill
            className="object-cover object-center"
          />
          
          {/* Subtle Overlay Glow */}
          <div className="absolute inset-0 bg-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-sm font-bold w-fit mb-6">
            <Award size={16} /> Leader in Construction
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">Led by <span className="text-[#d4af37]">Praneeth Katta</span></h2>
          
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Under the visionary leadership of Praneeth Katta, SRI VENKATESWARA Constructions has grown from a local contractor into a premier construction and interior design firm in Visakhapatnam. We believe that every structure we build is a testament to our dedication, precision, and architectural integrity.
          </p>

          <div className="glass-panel p-6 border-l-4 border-l-[#d4af37] bg-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building2 size={100} />
            </div>
            <h3 className="text-white font-bold text-xl mb-2 relative z-10">Official Certification</h3>
            <p className="text-white/60 relative z-10">We are a fully licensed and recognized entity, ensuring all your projects meet the highest legal and safety standards.</p>
            <div className="mt-4 inline-block bg-[#d4af37] text-black px-4 py-1 rounded font-bold tracking-widest text-sm relative z-10">
              License No: 02/2024-27-CE
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-10 hover:border-[#d4af37]/50 transition-colors group"
        >
          <Flag size={40} className="text-[#d4af37] mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
          <p className="text-white/60 leading-relaxed">
            To deliver premium construction and interior design solutions that exceed client expectations, utilizing the finest materials, innovative techniques, and strict adherence to Vastu principles.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-10 hover:border-[#d4af37]/50 transition-colors group"
        >
          <MapPin size={40} className="text-[#d4af37] mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
          <p className="text-white/60 leading-relaxed">
            To be the most trusted and sought-after construction firm in Andhra Pradesh, renowned for our unwavering commitment to quality, transparency, and architectural brilliance.
          </p>
        </motion.div>
      </div>

      {/* Timeline Section */}
      <div className="mb-32 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Our Journey</h2>
          <p className="text-white/60">A legacy of building excellence</p>
        </div>

        <div className="relative border-l-2 border-[#d4af37]/30 ml-4 md:ml-1/2 md:translate-x-[50%]">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={event.year}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="mb-12 relative pl-8 md:pl-0"
            >
              <div className="absolute w-4 h-4 bg-[#d4af37] rounded-full -left-[9px] top-1.5 shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
              <div className={`md:w-[45%] ${index % 2 === 0 ? 'md:mr-auto md:pr-12 md:text-right' : 'md:ml-auto md:pl-12 md:-translate-x-[2px]'}`}>
                <span className="text-[#d4af37] font-bold text-xl block mb-2">{event.year}</span>
                <h4 className="text-white font-bold text-lg mb-2">{event.title}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
