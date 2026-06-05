"use client";

import { motion } from "framer-motion";
import { FileSignature, Compass, Map as BlueprintIcon, Calculator, Building, Cuboid } from "lucide-react";

const services = [
  {
    title: "Govt Plan Approval",
    description: "Hassle-free processing of all government and municipal approvals for your construction projects.",
    icon: <FileSignature size={32} />,
    color: "from-blue-500/20 to-blue-900/20",
    accent: "text-blue-400"
  },
  {
    title: "2D Plans as per Vastu",
    description: "Meticulously drafted 2D floor plans strictly adhering to Vastu Shastra principles for harmony and prosperity.",
    icon: <Compass size={32} />,
    color: "from-[#d4af37]/20 to-yellow-900/20",
    accent: "text-[#d4af37]"
  },
  {
    title: "Blueprint Drafting",
    description: "Highly detailed structural and architectural blueprints for precise construction execution.",
    icon: <BlueprintIcon size={32} />,
    color: "from-cyan-500/20 to-cyan-900/20",
    accent: "text-cyan-400"
  },
  {
    title: "Cost Estimation",
    description: "Transparent, accurate, and detailed material and labor cost estimations before project commencement.",
    icon: <Calculator size={32} />,
    color: "from-green-500/20 to-green-900/20",
    accent: "text-green-400"
  },
  {
    title: "Building Construction",
    description: "End-to-end premium construction services using high-quality materials and expert engineering.",
    icon: <Building size={32} />,
    color: "from-orange-500/20 to-orange-900/20",
    accent: "text-orange-400"
  },
  {
    title: "3D Interior & Exterior",
    description: "Cinematic, photorealistic 3D renders of your future interiors and exteriors.",
    icon: <Cuboid size={32} />,
    color: "from-purple-500/20 to-purple-900/20",
    accent: "text-purple-400"
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto relative">
      
      {/* Background Blueprint Grid (Subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{ backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-24 relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter">
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200">Expertise</span>
        </h1>
        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
          Comprehensive construction and architectural services tailored to bring your vision to life.
        </p>
      </motion.div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -10 }}
            className={`glass-panel p-8 group relative overflow-hidden cursor-pointer`}
          >
            {/* Hover Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Animated Icon */}
            <div className={`w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mb-6 relative z-10 ${service.accent} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
              {service.icon}
            </div>

            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{service.title}</h3>
            <p className="text-white/60 leading-relaxed relative z-10">{service.description}</p>

            {/* Bottom Accent Line */}
            <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${service.color.replace('/20', '')} transition-all duration-500`} />
          </motion.div>
        ))}
      </div>

    </div>
  );
}
