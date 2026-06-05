"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Loader2, Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";

const DEFAULT_CONFIG = {
  propertyTypeOptions: ["Apartment", "Independent House", "Villa", "Commercial"],
  propertyStatusOptions: ["Under Construction", "Ready To Move", "Renovation"],
  configurationOptions: ["1BHK", "2BHK", "3BHK", "4BHK+", "Villa"],
  rooms: [
    { name: "Kitchen", options: ["Base Cabinets", "Wall Cabinets", "Tall Unit / Pantry", "Loft Storage", "Tandem Drawers", "SS Drawers", "Corner Unit", "Sink & Plumbing", "Counter Top", "Tiles"] },
    { name: "Master Bedroom", options: ["Wardrobe(Open/Sliding)", "Dressing Unit", "Walk-in Wardrobe", "Bed Back Paneling", "Cushion Back Panel", "Side Tables", "TV Unit", "Window seating", "Bed Structure"] },
    { name: "Guest Bedroom", options: ["Wardrobe(Open/Sliding)", "Dressing Unit", "Walk-in Wardrobe", "Bed Back Paneling", "Cushion Back Panel", "Side Tables", "TV Unit", "Window seating", "Bed Structure"] },
    { name: "Children's Bedroom", options: ["Wardrobe(Open/Sliding)", "Dressing Unit", "Walk-in Wardrobe", "Bed Back Paneling", "Cushion Back Panel", "Side Tables", "TV Unit", "Window seating", "Bed Structure", "Study Unit"] },
    { name: "Living Room", options: ["Feature Wall Paneling", "Horizontal Storage", "Vertical Storage", "Partion", "Sofa Back Design"] },
    { name: "Dining Area", options: ["Crockery Unit", "Wash Basin Unit"] },
    { name: "Pooja Room", options: ["Back Panel", "Arch Entrance Frame", "Glass Doors"] },
    { name: "Bathroom / Vanity", options: ["Vanity Unit", "Storage Cabinet"] },
    { name: "Common Area / Other Works", options: ["False Ceiling", "Painting", "Wall Papers", "WPC Wall Frames / Mouldings", "Entrance Foyer", "Shoe Rack", "Entrance Console Unit"] },
  ],
  materialPreferenceOptions: ["Wardrobes Laminate", "Wardrobe Acrylic", "Kitchen Laminate", "Kitchen Acrylic", "Wardrobe Lacquered glass", "Kitchen Lacquered glass", "Wardrobe PU / Deco Paint"],
  hardwareOptions: ["Standard", "Branded (Premium) Soft Close"],
  plywoodChoiceOptions: ["Commercial Ply", "10 Years Warranty BWP Ply", "21 Years Warranty BWP & Termite Proof Ply", "31 Years Warranty BWP & Termite Proof Ply With Fire Retardant"]
};

export default function ConfigManager() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadConfig() {
      try {
        const docRef = doc(db, "site_config", "forms");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Failed to load configuration." });
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await setDoc(doc(db, "site_config", "forms"), config);
      setMessage({ type: "success", text: "Configuration saved successfully! All website forms are updated." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save configuration." });
    } finally {
      setSaving(false);
    }
  };

  const updateSimpleArray = (key: string, index: number, value: string) => {
    const newArray = [...config[key]];
    newArray[index] = value;
    setConfig({ ...config, [key]: newArray });
  };

  const addSimpleArrayItem = (key: string) => {
    setConfig({ ...config, [key]: [...config[key], "New Option"] });
  };

  const removeSimpleArrayItem = (key: string, index: number) => {
    const newArray = [...config[key]];
    newArray.splice(index, 1);
    setConfig({ ...config, [key]: newArray });
  };

  const updateRoomName = (index: number, value: string) => {
    const newRooms = [...config.rooms];
    newRooms[index].name = value;
    setConfig({ ...config, rooms: newRooms });
  };

  const updateRoomOption = (roomIndex: number, optIndex: number, value: string) => {
    const newRooms = [...config.rooms];
    newRooms[roomIndex].options[optIndex] = value;
    setConfig({ ...config, rooms: newRooms });
  };

  const addRoomOption = (roomIndex: number) => {
    const newRooms = [...config.rooms];
    newRooms[roomIndex].options.push("New Feature");
    setConfig({ ...config, rooms: newRooms });
  };

  const removeRoomOption = (roomIndex: number, optIndex: number) => {
    const newRooms = [...config.rooms];
    newRooms[roomIndex].options.splice(optIndex, 1);
    setConfig({ ...config, rooms: newRooms });
  };

  const addRoom = () => {
    setConfig({
      ...config,
      rooms: [...config.rooms, { name: "New Room Type", options: ["Feature 1"] }]
    });
  };

  const removeRoom = (index: number) => {
    const newRooms = [...config.rooms];
    newRooms.splice(index, 1);
    setConfig({ ...config, rooms: newRooms });
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" /></div>;
  }

  const renderSimpleArrayEditor = (title: string, key: string) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#d4af37]">{title}</h3>
        <button onClick={() => addSimpleArrayItem(key)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors">
          <Plus size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {config[key].map((item: string, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <input 
              type="text" 
              value={item} 
              onChange={(e) => updateSimpleArray(key, i, e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none"
            />
            <button onClick={() => removeSimpleArrayItem(key, i)} className="text-red-400 hover:text-red-300 p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-wider">Form Configurator</h2>
          <p className="text-white/50 mt-1">Manage all dropdowns, radio buttons, and room features across the website.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-[#d4af37] to-yellow-600 text-black font-bold px-6 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-semibold text-sm">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderSimpleArrayEditor("Property Types", "propertyTypeOptions")}
          {renderSimpleArrayEditor("Property Status", "propertyStatusOptions")}
          {renderSimpleArrayEditor("Configurations (BHK)", "configurationOptions")}
          {renderSimpleArrayEditor("Material Preferences", "materialPreferenceOptions")}
          {renderSimpleArrayEditor("Hardware", "hardwareOptions")}
          {renderSimpleArrayEditor("Plywood Choices", "plywoodChoiceOptions")}
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-[#d4af37]">Rooms & Features</h3>
                <p className="text-white/50 text-xs mt-1">Manage side headings (like Master Bedroom) and their checkboxes.</p>
              </div>
              <button onClick={addRoom} className="bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                <Plus size={16} /> Add Room
              </button>
            </div>

            <div className="space-y-8">
              {config.rooms.map((room: any, rIndex: number) => (
                <div key={rIndex} className="bg-black/30 border border-white/5 rounded-xl p-5 relative group">
                  <button onClick={() => removeRoom(rIndex)} className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="mb-4">
                    <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Side Heading Name</label>
                    <input 
                      type="text" 
                      value={room.name}
                      onChange={(e) => updateRoomName(rIndex, e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-lg font-bold text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Checkbox Features</label>
                    {room.options.map((opt: string, oIndex: number) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={opt}
                          onChange={(e) => updateRoomOption(rIndex, oIndex, e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white/90 focus:border-[#d4af37] focus:outline-none"
                        />
                        <button onClick={() => removeRoomOption(rIndex, oIndex)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addRoomOption(rIndex)} className="text-xs text-[#d4af37] hover:text-yellow-400 font-bold flex items-center gap-1 mt-2">
                      <Plus size={12} /> Add Feature
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
