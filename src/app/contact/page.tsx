"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  message: z.string().min(10),
});

type ContactData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { control, watch, reset, formState: { isValid } } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const watchAllFields = watch();

  // ZERO-CLICK AUTO-SUBMIT LOGIC
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Check if session storage has flag to prevent spam
    const hasSubmitted = sessionStorage.getItem("contact_submitted");

    if (isValid && !isSubmitting && !submitted && !hasSubmitted) {
      timeoutId = setTimeout(() => {
        handleAutoSubmit(watchAllFields);
      }, 2500); // Wait 2.5s after valid input to auto-submit
    }

    return () => clearTimeout(timeoutId);
  }, [isValid, watchAllFields, isSubmitting, submitted]);

  const handleAutoSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    const messageTemplate = `Hello SRI VENKATESWARA Constructions,\n\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\n\nMessage: ${data.message}`;
    
    try {
      // 1. Send via secure Next.js API route to Telegram
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageTemplate }),
      });

      // 2. Prevent duplicate submissions
      sessionStorage.setItem("contact_submitted", "true");
      setSubmitted(true);
      reset();

      // Reset submission state after 5 seconds to allow new messages
      setTimeout(() => {
        setSubmitted(false);
        sessionStorage.removeItem("contact_submitted");
      }, 5000);
      
    } catch (error) {
      console.error("Auto-submit failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tighter">
          Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200">Touch</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          We are ready to build your dream. Connect with us instantly through our smart contact system.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Info & Map */}
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 border-l-2 border-l-[#d4af37]">
              <Phone className="text-[#d4af37] mb-4" />
              <h3 className="text-white font-bold mb-1">WhatsApp / Call</h3>
              <p className="text-white/60 text-sm">9293946049</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 border-l-2 border-l-[#d4af37]">
              <Mail className="text-[#d4af37] mb-4" />
              <h3 className="text-white font-bold mb-1">Email Us</h3>
              <p className="text-white/60 text-sm">praneethkatta18091@gmail.com</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 border-l-2 border-l-[#d4af37]">
              <MapPin className="text-[#d4af37] mb-4" />
              <h3 className="text-white font-bold mb-1">Office Address</h3>
              <a href="https://maps.app.goo.gl/RcgBKwZosgWxbu718" target="_blank" rel="noopener noreferrer" className="text-white/60 text-sm hover:text-white transition-colors">
                main road, Elamanchili, Andhra Pradesh 531055
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 border-l-2 border-l-[#d4af37]">
              <Clock className="text-[#d4af37] mb-4" />
              <h3 className="text-white font-bold mb-1">Business Hours</h3>
              <p className="text-white/60 text-sm">Mon - Sat: 9:00 AM - 7:00 PM<br/>Sun: Closed</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="w-full h-[300px] rounded-3xl overflow-hidden glass-panel border border-white/10">
            <iframe 
              src="https://maps.google.com/maps?q=GVX5%2BP5%20Elamanchili,%20Andhra%20Pradesh&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>

        {/* Auto-Submit Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 md:p-12 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 blur-[100px] pointer-events-none" />
          
          <h2 className="text-2xl font-bold text-white mb-2">Smart Message</h2>
          <p className="text-white/50 text-sm mb-8">Fill the details below. Our system will automatically process your inquiry.</p>

          <form className="space-y-6 relative z-10">
            <div>
              <label className="text-white/60 text-xs uppercase block mb-2">Full Name</label>
              <Controller name="name" control={control} render={({field}) => (
                <input {...field} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />
              )} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-white/60 text-xs uppercase block mb-2">Phone Number</label>
                <Controller name="phone" control={control} render={({field}) => (
                  <input {...field} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />
                )} />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase block mb-2">Email Address</label>
                <Controller name="email" control={control} render={({field}) => (
                  <input {...field} type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />
                )} />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase block mb-2">Your Message</label>
              <Controller name="message" control={control} render={({field}) => (
                <textarea {...field} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors resize-none" />
              )} />
            </div>

            {/* Zero-Click Automation Status */}
            <div className="mt-8 rounded-xl bg-black/50 border border-white/5 p-6 text-center h-[120px] flex flex-col justify-center items-center">
              {submitted ? (
                <>
                  <CheckCircle2 className="text-green-400 mb-2" size={24} />
                  <span className="text-white font-bold text-sm">Message Processed!</span>
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="text-[#d4af37] animate-spin mb-2" size={24} />
                  <span className="text-[#d4af37] font-bold text-sm">Sending Automatically...</span>
                </>
              ) : isValid ? (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mb-2" />
                  <span className="text-white/90 font-bold text-sm">Ready to send. Waiting for typing to stop...</span>
                </>
              ) : (
                <>
                  <div className="w-full bg-white/10 h-1 rounded-full mb-3">
                    <motion.div 
                      className="h-full bg-[#d4af37]"
                      initial={{ width: "0%" }}
                      animate={{ width: Object.keys(watchAllFields).filter(k => !!watchAllFields[k as keyof ContactData]).length > 2 ? "50%" : "10%" }} 
                    />
                  </div>
                  <span className="text-white/50 text-xs tracking-wide">Complete all fields.<br/>System will auto-submit.</span>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
