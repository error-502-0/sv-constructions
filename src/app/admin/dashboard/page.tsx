"use client";

import { motion } from "framer-motion";
import { Users, FileText, CheckCircle } from "lucide-react";

export default function AdminDashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-wider">Dashboard Overview</h2>
        <p className="text-white/50 mt-1">Welcome back, Admin. Here is your platform status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { title: "Total Combos", value: "8", icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
          { title: "Active Enquiries", value: "24", icon: Users, color: "text-green-400", bg: "bg-green-400/10" },
          { title: "Configurations", value: "Active", icon: CheckCircle, color: "text-[#d4af37]", bg: "bg-[#d4af37]/10" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-white/50 font-bold text-sm uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-extrabold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-500`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
