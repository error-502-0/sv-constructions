"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

const ConfigContext = createContext<any>(DEFAULT_CONFIG);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    const docRef = doc(db, "site_config", "forms");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.rooms && Array.isArray(data.rooms)) {
          data.rooms = data.rooms.filter((r: any) => r.name?.trim().toLowerCase() !== "new room type");
        }
        setConfig({ ...DEFAULT_CONFIG, ...data });
      }
    }, (error) => {
      console.error("Error fetching config:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);

export const getRoomFieldName = (roomName: string) => {
  const normalized = roomName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized.includes('kitchen')) return 'kitchen';
  if (normalized.includes('masterbedroom')) return 'masterBedroom';
  if (normalized.includes('guestbedroom')) return 'guestBedroom';
  if (normalized.includes('childrensbedroom') || normalized.includes('childbedroom')) return 'childrensBedroom';
  if (normalized.includes('livingroom')) return 'livingRoom';
  if (normalized.includes('diningarea')) return 'diningArea';
  if (normalized.includes('poojaroom')) return 'poojaRoom';
  if (normalized.includes('bathroom') || normalized.includes('vanity')) return 'bathroom';
  if (normalized.includes('commonarea') || normalized.includes('otherworks')) return 'commonArea';
  return normalized;
};
