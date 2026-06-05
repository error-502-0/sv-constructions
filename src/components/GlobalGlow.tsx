"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function GlobalGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  
  const springConfig = { damping: 100, stiffness: 20, mass: 1 };
  const cursorX = useSpring(-500, springConfig);
  const cursorY = useSpring(-500, springConfig);

  // Hook calls MUST be at the top level, never inside JSX
  const primaryGlowX = useTransform(cursorX, v => v - (windowSize.width * 0.6));
  const primaryGlowY = useTransform(cursorY, v => v - (windowSize.width * 0.6));
  
  const secondaryGlowX = useTransform(cursorX, v => v - (windowSize.width * 0.4));
  const secondaryGlowY = useTransform(cursorY, v => v - (windowSize.width * 0.4));

  useEffect(() => {
    setIsVisible(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    // Initial center position
    cursorX.set(window.innerWidth / 2);
    cursorY.set(window.innerHeight / 2);
    
    const moveGlow = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // Move slightly towards cursor for parallax, but stay mostly centered
      const targetX = (window.innerWidth / 2) + (clientX - window.innerWidth / 2) * 0.15;
      const targetY = (window.innerHeight / 2) + (clientY - window.innerHeight / 2) * 0.15;
      
      cursorX.set(targetX);
      cursorY.set(targetY);
    };

    window.addEventListener("mousemove", moveGlow);
    window.addEventListener("touchmove", moveGlow);
    window.addEventListener("resize", () => setWindowSize({ width: window.innerWidth, height: window.innerHeight }));

    return () => {
      window.removeEventListener("mousemove", moveGlow);
      window.removeEventListener("touchmove", moveGlow);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#020617]">
      {/* Massive elegant central glow (deep blue / soft gold) */}
      <motion.div
        className="absolute h-[150vw] w-[150vw] md:h-[120vw] md:w-[120vw] rounded-full blur-[150px] mix-blend-screen opacity-50 will-change-transform"
        style={{
          background: "radial-gradient(circle at center, rgba(30, 58, 138, 0.4) 0%, rgba(212, 175, 55, 0.1) 40%, rgba(0,0,0,0) 70%)",
          x: primaryGlowX,
          y: primaryGlowY,
        }}
      />
      
      {/* Deeper gold core for contrast */}
      <motion.div
        className="absolute h-[80vw] w-[80vw] rounded-full blur-[120px] mix-blend-screen opacity-40 will-change-transform"
        style={{
          background: "radial-gradient(circle at center, rgba(212, 175, 55, 0.2) 0%, rgba(0,0,0,0) 60%)",
          x: secondaryGlowX, 
          y: secondaryGlowY,
        }}
      />
    </div>
  );
}
