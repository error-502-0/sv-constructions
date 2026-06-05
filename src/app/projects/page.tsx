"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import Image from "next/image";

// Using the newly uploaded interior images
const projects = [
  { id: 1, title: "Modern Master Bedroom", category: "Interior", height: "h-96", image: "/projects/interior-1.jpg" },
  { id: 2, title: "Contemporary TV Unit", category: "Interior", height: "h-64", image: "/projects/interior-2.jpg" },
  { id: 3, title: "Luxury Guest Bedroom", category: "Interior", height: "h-80", image: "/projects/interior-3.jpg" },
  { id: 4, title: "Elegant Bedroom Design", category: "Interior", height: "h-72", image: "/projects/interior-4.jpg" },
  { id: 5, title: "Divine Pooja Mandir", category: "Interior", height: "h-96", image: "/projects/interior-5.jpg" },
  { id: 6, title: "Premium False Ceiling", category: "Interior", height: "h-80", image: "/projects/interior-6.jpg" },
  { id: 7, title: "Luxury Lift Foyer & Statue", category: "Interior", height: "h-96", image: "/projects/interior-7.jpg" },
  { id: 8, title: "Modern Living Room TV Unit", category: "Interior", height: "h-72", image: "/projects/interior-8.jpg" },
  { id: 9, title: "TV Unit with Glass Showcase", category: "Interior", height: "h-80", image: "/projects/interior-9.jpg" },
  { id: 10, title: "Elegant Dining Area", category: "Interior", height: "h-96", image: "/projects/interior-10.jpg" },
  { id: 11, title: "Living Room with Indoor Swing", category: "Interior", height: "h-80", image: "/projects/interior-11.jpg" },
  { id: 12, title: "Premium Living Space", category: "Interior", height: "h-96", image: "/projects/interior-12.jpg" },
  { id: 13, title: "Indoor Swing & Chandeliers", category: "Interior", height: "h-72", image: "/projects/interior-13.jpg" },
  { id: 14, title: "Master Bedroom Floral Carving", category: "Interior", height: "h-96", image: "/projects/interior-14.jpg" },
  { id: 15, title: "Modern Glossy Kitchen", category: "Interior", height: "h-80", image: "/projects/interior-15.jpg" },
  { id: 16, title: "Glossy Built-in Wardrobe", category: "Interior", height: "h-72", image: "/projects/interior-16.png" },
  { id: 17, title: "Premium Bedroom Cupboards", category: "Interior", height: "h-80", image: "/projects/interior-17.png" },
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  
  const filteredProjects = filter === "All" ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter">
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200">Portfolio</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Explore our completed masterpieces across Visakhapatnam.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-4 mb-16"
      >
        {["All", "Interior"].map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              filter === category 
                ? "bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                : "glass-panel text-white/60 hover:text-white hover:border-[#d4af37]/30"
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Masonry Gallery Grid */}
      <motion.div 
        layout
        className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
      >
        {filteredProjects.map((project, index) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            key={project.id}
            className={`relative rounded-3xl overflow-hidden glass-panel group break-inside-avoid ${project.height}`}
          >
            {/* Background Image or Placeholder */}
            {project.image ? (
              <div className="absolute inset-0">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <span className="text-white/20 font-bold tracking-widest uppercase">Project Image</span>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[#020617]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
              <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-2 block">{project.category}</span>
                <h3 className="text-2xl font-bold text-white mb-4">{project.title}</h3>
                <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#d4af37] hover:text-black transition-colors">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
