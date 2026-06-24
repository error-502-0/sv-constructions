"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Calculator, Loader2, FileText } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConfig, getRoomFieldName } from "@/components/ConfigProvider";
import { fetchCombos, fetchItemPrices, Combo } from "@/services/pricingService";

const generateKeysFromSelections = (data: any, rooms: any[]) => {
  const keys: string[] = [];
  const mapValue = (prefix: string, val: string) => {
    if (!val) return;
    const cleanVal = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    keys.push(`${prefix}_${cleanVal}`);
  };

  mapValue('ptype', data.propertyType);
  mapValue('pstatus', data.propertyStatus);
  mapValue('hw', data.hardware);
  mapValue('ply', data.plywoodChoice);
  mapValue('pkg', data.interiorType);
  mapValue('qual', data.materialQuality);

  const mapArray = (prefix: string, arr: string[]) => {
    if (Array.isArray(arr)) arr.forEach(val => mapValue(prefix, val));
  };
  mapArray('config', data.configuration);
  mapArray('mat_pref', data.materialPreference);

  rooms?.forEach((room: any) => {
    const fieldName = getRoomFieldName(room.name);
    mapArray(fieldName, data[fieldName]);
  });

  mapArray('addon', data.addons);

  return keys.sort();
};

const fullQuoteSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().optional().or(z.literal("")),
  siteLocation: z.string().min(2),
  
  propertyType: z.string().min(1),
  propertyStatus: z.string().min(1),
  configuration: z.array(z.string()).min(1),
  areaSize: z.number().min(10),
  
  materialPreference: z.array(z.string()).min(1),
  hardware: z.string().optional(),
  plywoodChoice: z.string().min(1),
  otherComments: z.string().optional().or(z.literal("")),

  interiorType: z.string().min(1),
  materialQuality: z.string().min(1),
  addons: z.array(z.string()).default([]),
}).catchall(z.any());

type FullQuoteData = z.infer<typeof fullQuoteSchema>;

const baseRates: Record<string, number> = { Basic: 800, Standard: 1200, Premium: 1800, Luxury: 2500 };
const materialMultipliers: Record<string, number> = { Economy: 0.8, Standard: 1, Premium: 1.3 };
const addOnCosts: Record<string, number> = {
  "False Ceiling": 150000,
  "Modular Kitchen": 250000,
  "Wardrobes": 180000,
  "TV Unit": 45000,
  "Lighting Setup": 60000,
  "Wallpaper": 30000,
  "Smart Home Features": 120000,
};

const CheckboxGroup = ({ name, options, control, label, required }: any) => (
  <div className="mb-4">
    <label className="text-white/60 text-[10px] uppercase block mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <Controller name={name} control={control} render={({field}) => (
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => {
          const isSelected = field.value?.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (isSelected) {
                  field.onChange(field.value.filter((a: string) => a !== opt));
                } else {
                  field.onChange([...(field.value || []), opt]);
                }
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${isSelected ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    )} />
  </div>
);

const RadioGroup = ({ name, options, control, label, required }: any) => (
  <div className="mb-4">
    <label className="text-white/60 text-[10px] uppercase block mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <Controller name={name} control={control} render={({field}) => (
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => {
          const isSelected = field.value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => field.onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${isSelected ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    )} />
  </div>
);

export function SideQuoteTab() {
  const [isOpen, setIsOpen] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [isInteractingWithUpload, setIsInteractingWithUpload] = useState(false);
  const config = useConfig();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-side-quote', handleOpen);
    return () => window.removeEventListener('open-side-quote', handleOpen);
  }, []);
  
  const [step, setStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);
  const totalSteps = 7;

  const { control, watch, reset, formState: { isValid } } = useForm<FullQuoteData>({
    // @ts-expect-error - Zod resolver type mismatch with default array values
    resolver: zodResolver(fullQuoteSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      siteLocation: "",
      propertyType: "",
      propertyStatus: "",
      configuration: [],
      areaSize: "" as any,
      materialPreference: [],
      hardware: "",
      plywoodChoice: "",
      otherComments: "",
      interiorType: "",
      materialQuality: "",
      addons: [],
    },
  });

  const requiredFieldsByStep = useMemo(() => {
    if (!config) return {};
    return {
      1: ["name", "phone", "siteLocation"],
      2: ["propertyType", "propertyStatus"],
      3: ["configuration", "areaSize"],
      4: config.rooms.slice(0, 2).map((r:any) => getRoomFieldName(r.name)),
      5: config.rooms.length > 4 ? [getRoomFieldName(config.rooms[4].name)] : [],
      6: ["materialPreference", "plywoodChoice"],
      7: ["interiorType", "materialQuality"]
    };
  }, [config]);

  const watchAllFields = watch();

  useEffect(() => {
    const loadData = async () => {
      setIsFetchingData(true);
      const [fetchedCombos, fetchedPrices] = await Promise.all([fetchCombos(), fetchItemPrices()]);
      setCombos(fetchedCombos);
      setItemPrices(fetchedPrices);
      setIsFetchingData(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isFetchingData || !config) return;

    const getRawFeatures = (data: any) => {
      const features: string[] = [];
      Object.keys(data).forEach(key => {
        const val = data[key];
        if (Array.isArray(val)) {
          val.forEach(item => { if (item) features.push(item); });
        } else if (typeof val === "string" && val.trim() !== "") {
          features.push(val);
        }
      });
      return features;
    };

    let sum = 0;
    const selectedRawFeatures = getRawFeatures(watchAllFields);
    selectedRawFeatures.forEach(item => {
      if (itemPrices[item]) {
        sum += itemPrices[item];
      }
    });

    setEstimatedCost(sum > 0 ? sum : 0);
  }, [watchAllFields, combos, itemPrices, isFetchingData, config]);

  const isCurrentStepValid = ((requiredFieldsByStep as any)[step] || []).every((field: string) => {
    const val = (watchAllFields as any)[field];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'number') return val > 0;
    return !!val && String(val).length >= (field === 'phone' ? 10 : 2);
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const hasSubmitted = sessionStorage.getItem("quote_submitted");
    if (isValid && !isSubmitting && !submitted && !hasSubmitted && step === totalSteps && !isInteractingWithUpload && !floorPlan) {
      timeoutId = setTimeout(() => { handleAutoSubmit(watchAllFields); }, 2500);
    }
    return () => clearTimeout(timeoutId);
  }, [isValid, watchAllFields, isSubmitting, submitted, step, isInteractingWithUpload, floorPlan]);

  const handleAutoSubmit = async (data: any) => {
    setIsSubmitting(true);
    const addonString = data.addons?.length > 0 ? data.addons.join(", ") : "None";
    const costFormatted = `₹${estimatedCost.toLocaleString()}`;
    const timeline = data.areaSize > 2000 ? "4-6 Months" : "2-3 Months";
    const roomsString = config.rooms.map((room: any) => {
      const fieldName = getRoomFieldName(room.name);
      const vals = data[fieldName] as string[] | undefined;
      return `• <b>${room.name}:</b> ${vals?.join(", ") || 'None'}`;
    }).join("\n");

    const message = `<b>Hello SRI VENKATESWARA Constructions,</b>

A new project inquiry has been submitted. Details below:

👤 <b>CLIENT INFORMATION</b>
• <b>Name:</b> ${data.name}
• <b>Phone:</b> ${data.phone}
• <b>Email:</b> ${data.email || 'N/A'}
• <b>Location:</b> ${data.siteLocation}

🏠 <b>PROPERTY OVERVIEW</b>
• <b>Type:</b> ${data.propertyType} (${data.propertyStatus})
• <b>Configuration:</b> ${data.configuration?.join(", ")} (${data.areaSize} Sq.ft)
• <b>Interior:</b> ${data.interiorType}
• <b>Add-ons:</b> ${addonString}

🛋️ <b>SCOPE OF WORK</b>
${roomsString}

🪵 <b>MATERIAL & HARDWARE</b>
• <b>Materials:</b> ${data.materialQuality} (${data.materialPreference?.join(", ") || 'None'})
• <b>Hardware:</b> ${data.hardware || 'Standard'}
• <b>Plywood:</b> ${data.plywoodChoice}

💰 <b>BUDGET & TIMELINE</b>
• <b>Est. Budget:</b> ${costFormatted}
• <b>Est. Timeline:</b> ${timeline}
• <b>Comments:</b> ${data.otherComments || 'None'}

<i>I would like to discuss this project further.</i>`;
    try {
      if (floorPlan) {
        const formData = new FormData();
        formData.append("message", message);
        formData.append("file", floorPlan);

        await fetch("/api/contact", {
          method: "POST",
          body: formData,
        });
      } else {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
      }
      
      sessionStorage.setItem("quote_submitted", "true");
      setSubmitted(true);
      reset();
      setStep(1);
      setHighestStep(1);
      setTimeout(() => { 
        setSubmitted(false); 
        sessionStorage.removeItem("quote_submitted"); 
        setIsOpen(false);
      }, 5000);
    } catch (error) { console.error("Auto-submit failed", error); } finally { setIsSubmitting(false); }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-sm mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">1: Personal Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-[10px] uppercase block mb-1">Full Name <span className="text-red-500">*</span></label>
                <Controller name="name" control={control} render={({field}) => <input {...field} placeholder="Your answer" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
              </div>
              <div>
                <label className="text-white/60 text-[10px] uppercase block mb-1">Mobile Number <span className="text-red-500">*</span></label>
                <Controller name="phone" control={control} render={({field}) => <input {...field} placeholder="Your answer" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
              </div>
              <div>
                <label className="text-white/60 text-[10px] uppercase block mb-1">Email ID</label>
                <Controller name="email" control={control} render={({field}) => <input {...field} type="email" placeholder="Your answer" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
              </div>
              <div>
                <label className="text-white/60 text-[10px] uppercase block mb-1">Site Location <span className="text-red-500">*</span></label>
                <Controller name="siteLocation" control={control} render={({field}) => <input {...field} placeholder="Your answer" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-sm mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">2: Property Type & Status</h3>
            <RadioGroup name="propertyType" control={control} label="Property Type" required={true} options={config.propertyTypeOptions} />
            <RadioGroup name="propertyStatus" control={control} label="Property Status" required={true} options={config.propertyStatusOptions} />
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-sm mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">3: Configuration & Area</h3>
            <CheckboxGroup name="configuration" control={control} label="Configuration" required={true} options={config.configurationOptions} />
            <div className="mb-4">
              <label className="text-white/60 text-[10px] uppercase block mb-2">Approx Carpet/Built-up Area (sq.ft) <span className="text-red-500">*</span></label>
              <Controller name="areaSize" control={control} render={({field}) => <input {...field} type="number" placeholder="Your answer" value={field.value === undefined ? "" : field.value} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : "")} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-sm mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">4: Primary Room Requirements</h3>
            {config.rooms.slice(0, 4).map((room: any, idx: number) => (
              <CheckboxGroup key={idx} name={getRoomFieldName(room.name)} control={control} label={room.name} required={idx === 0 || idx === 1} options={room.options} />
            ))}
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-sm mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">5: Secondary Room Requirements</h3>
            {config.rooms.slice(4).map((room: any, idx: number) => (
              <CheckboxGroup key={idx} name={getRoomFieldName(room.name)} control={control} label={room.name} required={idx === 0} options={room.options} />
            ))}
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-sm mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">6: Material & Build Preferences</h3>
            <CheckboxGroup name="materialPreference" control={control} label="Material Preference" required={true} options={config.materialPreferenceOptions} />
            <RadioGroup name="hardware" control={control} label="Hardware" required={false} options={config.hardwareOptions} />
            <RadioGroup name="plywoodChoice" control={control} label="Plywood Choice" required={true} options={config.plywoodChoiceOptions} />
            <div className="mb-4">
              <label className="text-white/60 text-[10px] uppercase block mb-1">Other Comments</label>
              <Controller name="otherComments" control={control} render={({field}) => <textarea {...field} placeholder="Your answer" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-sm mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">7: Quality & Add-ons (Cost Estimate)</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-white/60 text-[10px] uppercase block mb-1">Interior Package <span className="text-red-500">*</span></label>
                <Controller name="interiorType" control={control} render={({field}) => (
                  <select {...field} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] appearance-none">
                    <option value="" disabled className="bg-[#020617]">Select Package</option>
                    {["Basic", "Standard", "Premium", "Luxury"].map(opt => <option key={opt} value={opt} className="bg-[#020617]">{opt}</option>)}
                  </select>
                )} />
              </div>
              <div>
                <label className="text-white/60 text-[10px] uppercase block mb-1">Material Quality <span className="text-red-500">*</span></label>
                <Controller name="materialQuality" control={control} render={({field}) => (
                  <select {...field} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] appearance-none">
                    <option value="" disabled className="bg-[#020617]">Select Quality</option>
                    {["Economy", "Standard", "Premium"].map(opt => <option key={opt} value={opt} className="bg-[#020617]">{opt}</option>)}
                  </select>
                )} />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-[10px] uppercase block mb-2">Select General Add-ons</label>
              <Controller name="addons" control={control} render={({field}) => (
                <div className="flex flex-wrap gap-2">
                  {Object.keys(addOnCosts).map(addon => {
                    const isSelected = field.value?.includes(addon);
                    return (
                      <button key={addon} type="button" onClick={() => { if (isSelected) { field.onChange(field.value.filter((a: string) => a !== addon)); } else { field.onChange([...(field.value || []), addon]); } }} className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${isSelected ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}>{addon}</button>
                    );
                  })}
                </div>
              )} />
            </div>

            {/* Floor Plan Upload Section */}
            <div className="mt-6 p-4 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5">
              <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={16} /> Upload your floor plan (Optional)
              </h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFloorPlan(e.target.files[0]);
                    } else {
                      setFloorPlan(null);
                    }
                  }}
                  onFocus={() => setIsInteractingWithUpload(true)}
                  onClick={() => setIsInteractingWithUpload(true)}
                  className="text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#d4af37]/20 file:text-[#d4af37] hover:file:bg-[#d4af37]/30 transition-colors w-full cursor-pointer"
                />
                {(isInteractingWithUpload || floorPlan) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsInteractingWithUpload(true);
                      handleAutoSubmit(watchAllFields);
                    }}
                    disabled={isSubmitting || !isValid}
                    className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition whitespace-nowrap mt-2 sm:mt-0 ${
                      (isSubmitting || !isValid) 
                        ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                        : 'bg-[#d4af37] text-black hover:bg-yellow-400 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    }`}
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] flex">
      {/* The Toggle Tab */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-32 bg-gradient-to-b from-[#d4af37] to-yellow-600 rounded-l-xl flex flex-col items-center justify-center gap-1 text-black shadow-[-5px_0_15px_rgba(212,175,55,0.3)] hover:w-12 transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        <span className="writing-vertical-lr rotate-180 font-bold tracking-wider text-[10px] uppercase">
          Get Smart Quote
        </span>
      </motion.button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="h-[85vh] max-h-[800px] glass-panel bg-[#020617]/95 border-y border-l border-[#d4af37]/20 rounded-l-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between min-w-[400px]">
              <div className="flex items-center gap-2">
                <Calculator className="text-[#d4af37]" size={20} />
                <h3 className="font-bold text-white">Smart Cost Estimator</h3>
              </div>
              <div className="text-white/40 text-xs font-medium">
                Step {step} of {totalSteps}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/5 overflow-hidden min-w-[400px]">
              <motion.div 
                className="h-full bg-[#d4af37]" 
                initial={{ width: "0%" }} 
                animate={{ width: `${(step / totalSteps) * 100}%` }} 
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-6 overflow-y-auto w-[400px] flex-grow custom-scrollbar">
              <form className="space-y-6">
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>
              </form>
            </div>
            
            {/* Navigation Controls */}
            <div className="p-4 border-t border-white/10 bg-black/40 min-w-[400px] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className={`flex items-center gap-1 px-4 py-2 text-xs rounded-lg font-medium transition-all ${step === 1 ? 'opacity-30 pointer-events-none text-white/50' : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'}`}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (isCurrentStepValid && step < totalSteps) {
                    setStep(prev => prev + 1);
                    setHighestStep(prev => Math.max(prev, step + 1));
                  }
                }}
                className={`flex items-center gap-1 px-4 py-2 text-xs rounded-lg font-medium transition-all ${
                  !isCurrentStepValid || step === totalSteps
                    ? 'opacity-30 pointer-events-none text-[#d4af37]/50 border border-[#d4af37]/10'
                    : 'bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37]/50'
                }`}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            <div className="p-5 border-t border-white/10 bg-black/80 w-[400px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-white/50">Estimated Cost:</span>
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-400">
                  ₹{estimatedCost.toLocaleString()}
                </span>
              </div>
              <div className="relative h-10 flex items-center justify-center rounded overflow-hidden bg-white/5 border border-white/5">
                {submitted ? (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center gap-2 text-green-400 font-semibold text-xs">
                    <CheckCircle2 size={14} /> Quote Processed!
                  </div>
                ) : isSubmitting ? (
                  <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center gap-2 text-[#d4af37] font-semibold text-xs">
                    <Loader2 className="animate-spin" size={14} /> Processing...
                  </div>
                ) : (
                  <div className="text-[10px] text-white/40 text-center px-2">
                    {isValid && step === totalSteps ? "Ready to send. Waiting for you to finish..." : "Complete all fields to auto-send quote."}
                  </div>
                )}
                <motion.div 
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#d4af37] to-yellow-600"
                  initial={{ width: "0%" }}
                  animate={{ width: (isValid && step === totalSteps) ? "100%" : "30%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
