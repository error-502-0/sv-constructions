"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConfig, getRoomFieldName } from "@/components/ConfigProvider";
import { fetchCombos, fetchItemPrices, Combo } from "@/services/pricingService";

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

const CheckboxGroup = ({ name, options, control, label, required, isComboMode, showAllFeatures, lockedCombo }: any) => {
  const currentValue = useWatch({ control, name });
  const displayOptions = (isComboMode && !showAllFeatures) ? options.filter((opt: string) => {
    const rawVal = lockedCombo?.rawForm?.[name];
    const inCombo = Array.isArray(rawVal) ? rawVal.includes(opt) : false;
    const isSelected = Array.isArray(currentValue) ? (currentValue as any[]).includes(opt) : false;
    return inCombo || isSelected;
  }) : options;

  if (isComboMode && !showAllFeatures && displayOptions.length === 0) return null;

  return (
    <div className="mb-6">
      <label className="text-white/60 text-xs uppercase block mb-3">{label} {required && <span className="text-red-500">*</span>}</label>
      <Controller name={name} control={control} render={({field}) => (
        <div className="flex flex-wrap gap-3">
          {displayOptions.map((opt: string) => {
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
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isSelected ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )} />
    </div>
  );
};

const RadioGroup = ({ name, options, control, label, required, isComboMode, showAllFeatures, lockedCombo }: any) => {
  const currentValue = useWatch({ control, name });
  const displayOptions = (isComboMode && !showAllFeatures) ? options.filter((opt: string) => {
    const rawVal = lockedCombo?.rawForm?.[name];
    const inCombo = rawVal === opt;
    const isSelected = (currentValue as any) === opt;
    return inCombo || isSelected;
  }) : options;

  if (isComboMode && !showAllFeatures && displayOptions.length === 0) return null;

  return (
    <div className="mb-6">
      <label className="text-white/60 text-xs uppercase block mb-3">{label} {required && <span className="text-red-500">*</span>}</label>
      <Controller name={name} control={control} render={({field}) => (
        <div className="flex flex-wrap gap-3">
          {displayOptions.map((opt: string) => {
            const isSelected = field.value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { field.onChange(opt); }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isSelected ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )} />
    </div>
  );
};

function CalculatorContent() {
  const searchParams = useSearchParams();
  const comboId = searchParams.get("comboId");
  const config = useConfig();

  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [isComboMode, setIsComboMode] = useState(false);
  const [lockedCombo, setLockedCombo] = useState<Combo | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [missingRawFormError, setMissingRawFormError] = useState(false);
  
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

  useEffect(() => {
    const loadData = async () => {
      setIsFetchingData(true);
      const [fetchedCombos, fetchedPrices] = await Promise.all([fetchCombos(), fetchItemPrices()]);
      setCombos(fetchedCombos);
      setItemPrices(fetchedPrices);
      
      if (comboId) {
        const foundCombo = fetchedCombos.find(c => c.id === comboId);
        if (foundCombo) {
          if (foundCombo.rawForm) {
             setIsComboMode(true);
             setLockedCombo(foundCombo);
             reset({
               ...foundCombo.rawForm,
               name: "",
               phone: "",
               email: "",
               siteLocation: "",
               areaSize: foundCombo.rawForm.areaSize || ("" as any),
               otherComments: "",
             });
          } else {
             setMissingRawFormError(true);
          }
        }
      }
      setIsFetchingData(false);
    };
    loadData();
  }, [comboId, reset]);

  const watchAllFields = watch();

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
    let hasSelection = false;
    const selectedRawFeatures = getRawFeatures(watchAllFields);
    
    selectedRawFeatures.forEach(item => {
      if (itemPrices[item]) {
        sum += itemPrices[item];
      }
      hasSelection = true;
    });

    const currentKeys = generateKeysFromSelections(watchAllFields, config.rooms);

    let bestPrice = sum;

    if (isComboMode && lockedCombo) {
      if (lockedCombo.rawForm) {
        const comboRawFeatures = getRawFeatures(lockedCombo.rawForm);
        const extraRawFeatures = [...selectedRawFeatures];
        comboRawFeatures.forEach(item => {
          const index = extraRawFeatures.indexOf(item);
          if (index !== -1) extraRawFeatures.splice(index, 1);
        });
        
        let extraSum = 0;
        extraRawFeatures.forEach(item => { if (itemPrices[item]) extraSum += itemPrices[item]; });
        bestPrice = lockedCombo.price + extraSum;
      }
    } else {
      let bestComboMatch: Combo | null = null;
      let maxComboItems = 0;
      
      for (const combo of combos) {
        const hasAll = combo.items.every(key => currentKeys.includes(key));
        if (hasAll && combo.items.length > maxComboItems) {
          maxComboItems = combo.items.length;
          bestComboMatch = combo;
        }
      }

      if (bestComboMatch && currentKeys.length > 0 && bestComboMatch.rawForm) {
        const comboRawFeatures = getRawFeatures(bestComboMatch.rawForm);
        const extraRawFeatures = selectedRawFeatures.filter(item => !comboRawFeatures.includes(item));
        let extraSum = 0;
        extraRawFeatures.forEach(item => { if (itemPrices[item]) extraSum += itemPrices[item]; });
        bestPrice = bestComboMatch.price + extraSum;
      }
    }

    setEstimatedCost(bestPrice > 0 || hasSelection ? bestPrice : null);
  }, [watchAllFields, combos, itemPrices, isFetchingData, isComboMode, lockedCombo, config]);

  // Auto-advance logic
  const currentRequiredFields = (requiredFieldsByStep as any)[step] || [];
  const isCurrentStepValid = currentRequiredFields.every((field: string) => {
    const val = (watchAllFields as any)[field];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'number') return val > 0;
    return !!val && String(val).length >= (field === 'phone' ? 10 : 2);
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const hasSubmitted = sessionStorage.getItem("quote_submitted");
    if (isValid && !isSubmitting && !submitted && !hasSubmitted && step === totalSteps) {
      timeoutId = setTimeout(() => { handleAutoSubmit(watchAllFields); }, 2500);
    }
    return () => clearTimeout(timeoutId);
  }, [isValid, watchAllFields, isSubmitting, submitted, step, totalSteps]);

  // Inactivity (Idle) Lead Capture Timer
  useEffect(() => {
    let idleTimeout: NodeJS.Timeout;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      const hasSubmitted = sessionStorage.getItem("quote_submitted");
      if (hasSubmitted || isSubmitting || submitted) return;
      
      const name = watchAllFields.name;
      const phone = watchAllFields.phone;
      
      // If Name and Phone are valid, start 2 minute timer
      if (name && name.length >= 2 && phone && phone.length >= 10) {
        idleTimeout = setTimeout(() => {
          handleAutoSubmit(watchAllFields, true);
        }, 120000); // 120000 ms = 2 minutes
      }
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keypress", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);
    window.addEventListener("scroll", resetIdleTimer);

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keypress", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
      window.removeEventListener("scroll", resetIdleTimer);
    };
  }, [watchAllFields, isSubmitting, submitted]);

  const handleAutoSubmit = async (data: any, isAbandoned = false) => {
    setIsSubmitting(true);
    const addonString = data.addons?.length > 0 ? data.addons.join(", ") : "None";
    const costFormatted = estimatedCost === null ? "Custom Quote Required" : `₹${estimatedCost.toLocaleString()}`;
    const timeline = data.areaSize > 2000 ? "4-6 Months" : "2-3 Months";
    const alertTag = isAbandoned ? " [⚠️ ABANDONED/PARTIAL LEAD]" : "";
    const roomsString = config.rooms.map((room: any) => {
      const fieldName = getRoomFieldName(room.name);
      const vals = data[fieldName] as string[] | undefined;
      return `${room.name}: ${vals?.join(", ") || 'None'}`;
    }).join("\n");
    
    const message = `Hello SRI VENKATESWARA Constructions,

Name: ${data.name}${alertTag}
Phone: ${data.phone}
Email: ${data.email || 'N/A'}
Site Location: ${data.siteLocation}

Property Type: ${data.propertyType}
Property Status: ${data.propertyStatus}
Configuration: ${data.configuration?.join(", ")}
Area: ${data.areaSize} Sq.ft

Interior Type: ${data.interiorType}
Material: ${data.materialQuality}
General Add-ons: ${addonString}

=== ROOM REQUIREMENTS ===
${roomsString}

=== BUILD PREFERENCES ===
Material Preference: ${data.materialPreference?.join(", ")}
Hardware: ${data.hardware || 'N/A'}
Plywood Choice: ${data.plywoodChoice}

Other Comments: ${data.otherComments || 'None'}

Estimated Budget: ${costFormatted}
Estimated Timeline: ${timeline}

I would like to discuss this project further.`;
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      sessionStorage.setItem("quote_submitted", "true");
      setSubmitted(true);
      reset();
      setStep(1);
      setHighestStep(1);
      setTimeout(() => { setSubmitted(false); sessionStorage.removeItem("quote_submitted"); }, 5000);
    } catch (error) { console.error("Auto-submit failed", error); } finally { setIsSubmitting(false); }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 1: Personal Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs uppercase block mb-2">Full Name <span className="text-red-500">*</span></label>
                <Controller name="name" control={control} render={({field}) => <input {...field} placeholder="Your answer" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase block mb-2">Mobile Number <span className="text-red-500">*</span></label>
                <Controller name="phone" control={control} render={({field}) => <input {...field} placeholder="Your answer" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase block mb-2">Email ID</label>
                <Controller name="email" control={control} render={({field}) => <input {...field} type="email" placeholder="Your answer" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase block mb-2">Site Location <span className="text-red-500">*</span></label>
                <Controller name="siteLocation" control={control} render={({field}) => <input {...field} placeholder="Your answer" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 2: Property Type & Status</h3>
            <RadioGroup name="propertyType" control={control} label="Property Type" required={true} options={config.propertyTypeOptions} isComboMode={isComboMode} showAllFeatures={showAllFeatures} lockedCombo={lockedCombo} />
            <RadioGroup name="propertyStatus" control={control} label="Property Status" required={true} options={config.propertyStatusOptions} isComboMode={isComboMode} showAllFeatures={showAllFeatures} lockedCombo={lockedCombo} />
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 3: Configuration & Area</h3>
            <CheckboxGroup name="configuration" control={control} label="Configuration" required={true} options={config.configurationOptions} isComboMode={isComboMode} showAllFeatures={showAllFeatures} lockedCombo={lockedCombo} />
            <div className="mb-6">
              <label className="text-white/60 text-xs uppercase block mb-2">Approx Carpet/Built-up Area (sq.ft) <span className="text-red-500">*</span></label>
              <Controller name="areaSize" control={control} render={({field}) => <input {...field} type="number" placeholder="Your answer" value={field.value === undefined ? "" : field.value} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : "")} className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 4: Primary Room Requirements</h3>
            {config.rooms.slice(0, 4).map((room: any, idx: number) => (
              <CheckboxGroup key={idx} name={getRoomFieldName(room.name)} control={control} label={room.name} required={idx === 0 || idx === 1} options={room.options} isComboMode={isComboMode} showAllFeatures={showAllFeatures} lockedCombo={lockedCombo} />
            ))}
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 5: Secondary Room Requirements</h3>
            {config.rooms.slice(4).map((room: any, idx: number) => (
              <CheckboxGroup key={idx} name={getRoomFieldName(room.name)} control={control} label={room.name} required={idx === 0} options={room.options} isComboMode={isComboMode} showAllFeatures={showAllFeatures} lockedCombo={lockedCombo} />
            ))}
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 6: Material & Build Preferences</h3>
            <CheckboxGroup name="materialPreference" control={control} label="Material Preference" required={true} options={config.materialPreferenceOptions} isComboMode={isComboMode} showAllFeatures={showAllFeatures} lockedCombo={lockedCombo} />
            <RadioGroup name="hardware" control={control} label="Hardware" required={false} options={config.hardwareOptions} isComboMode={isComboMode} showAllFeatures={showAllFeatures} lockedCombo={lockedCombo} />
            <RadioGroup name="plywoodChoice" control={control} label="Plywood Choice" required={true} options={config.plywoodChoiceOptions} isComboMode={isComboMode} showAllFeatures={showAllFeatures} lockedCombo={lockedCombo} />
            {(!isComboMode || showAllFeatures) && (
            <div className="mb-6">
              <label className="text-white/60 text-xs uppercase block mb-2">Other Comments</label>
              <Controller name="otherComments" control={control} render={({field}) => <textarea {...field} placeholder="Your answer" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" />} />
            </div>
            )}
          </motion.div>
        );
      case 7:
        return (
          <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 7: Quality & Add-ons (Cost Estimate)</h3>
            
            {(isComboMode && !showAllFeatures) ? (
              <div className="bg-[#d4af37]/10 p-6 rounded-xl border border-[#d4af37]/20 mb-6 relative">
                <h4 className="text-[#d4af37] font-bold mb-4">Included in this Combo:</h4>
                <p className="text-white/80 text-sm mb-2">Interior Package: <span className="font-bold text-white">{watchAllFields.interiorType}</span></p>
                <p className="text-white/80 text-sm mb-4">Material Quality: <span className="font-bold text-white">{watchAllFields.materialQuality}</span></p>
                
                <h5 className="text-white/60 text-xs uppercase mb-2">General Add-ons</h5>
                <div className="flex flex-wrap gap-2">
                  {watchAllFields.addons?.length > 0 ? watchAllFields.addons.map((addon: string) => (
                    <span key={addon} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/90">{addon}</span>
                  )) : <span className="text-white/30 text-xs italic">None included</span>}
                </div>
              </div>
            ) : (
            <>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-white/60 text-xs uppercase block mb-2">Interior Package <span className="text-red-500">*</span></label>
                <Controller name="interiorType" control={control} render={({field}) => (
                  <select {...field} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] appearance-none">
                    <option value="" disabled className="bg-[#020617]">Select Package</option>
                    {["Basic", "Standard", "Premium", "Luxury"].map(opt => <option key={opt} value={opt} className="bg-[#020617]">{opt}</option>)}
                  </select>
                )} />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase block mb-2">Material Quality <span className="text-red-500">*</span></label>
                <Controller name="materialQuality" control={control} render={({field}) => (
                  <select {...field} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] appearance-none">
                    <option value="" disabled className="bg-[#020617]">Select Quality</option>
                    {["Economy", "Standard", "Premium"].map(opt => <option key={opt} value={opt} className="bg-[#020617]">{opt}</option>)}
                  </select>
                )} />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase block mb-3">Select General Add-ons</label>
              <Controller name="addons" control={control} render={({field}) => (
                <div className="flex flex-wrap gap-3">
                  {Object.keys(addOnCosts).map(addon => {
                    const isSelected = field.value?.includes(addon);
                    return (
                      <button key={addon} type="button" onClick={() => { if (isSelected) { field.onChange(field.value.filter((a: string) => a !== addon)); } else { field.onChange([...(field.value || []), addon]); } }} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isSelected ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}>{addon}</button>
                    );
                  })}
                </div>
              )} />
            </div>
            </>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-6xl mx-auto relative">
      {missingRawFormError && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl mb-8 text-center relative z-10">
          <h2 className="text-red-400 font-bold text-xl mb-2">Error: Old Combo Format</h2>
          <p className="text-red-200/80 text-sm">
            This combo was created before the new pre-fill system was implemented, so it does not contain the required internal data to automatically select features.
            <br/><br/>
            <strong>Owner Action Required:</strong> Please go to the Admin Dashboard, delete this combo, and recreate it exactly as it is. Once recreated, the pre-fill system will work perfectly!
          </p>
        </div>
      )}
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tighter">
          Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-200">Quote Engine</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Fill out your requirements below. Our intelligent system will instantly calculate your estimate and automatically process your request.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 md:p-12 relative z-10 overflow-hidden flex flex-col min-h-[500px]">
          
          {isComboMode && lockedCombo && (
            <div className="mb-8 p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-[#d4af37] font-bold">Combo Mode Active: {lockedCombo.name}</h4>
                <p className="text-white/60 text-xs mt-1">
                  {showAllFeatures 
                    ? "You can now add extra features to this combo. Extra features will be priced individually." 
                    : "You are currently viewing only the predefined combo features."}
                </p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
            <motion.div 
              className="h-full bg-[#d4af37]" 
              initial={{ width: "0%" }} 
              animate={{ width: `${(step / totalSteps) * 100}%` }} 
              transition={{ duration: 0.3 }}
            />
          </div>

          <form className="space-y-8 relative z-10 flex-grow">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </form>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'}`}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            
            <div className="text-white/40 text-sm font-medium">
              Step {step} of {totalSteps}
            </div>

            <div className="flex-1 flex justify-end gap-4">
                {isComboMode && step > 1 && step < totalSteps && (
                  <button
                    type="button"
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all bg-white/10 hover:bg-white/20 text-[#d4af37] border border-[#d4af37]/30 text-sm"
                  >
                    {showAllFeatures ? "Hide Extra Options" : "+ Add More Features"}
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isCurrentStepValid) {
                        setStep(prev => prev + 1);
                        setHighestStep(prev => Math.max(prev, step + 1));
                      }
                    }}
                    disabled={!isCurrentStepValid}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAutoSubmit(watchAllFields, false)}
                    disabled={!isValid || isSubmitting || submitted}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all bg-[#d4af37] text-black hover:bg-[#b08d29] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Submit"}
                  </button>
                )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-32 glass-panel p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2"><Calculator className="text-[#d4af37]" /> Live Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-white/90 font-bold">Estimated Total:</span>
                  <motion.span key={String(estimatedCost)} initial={{ scale: 1.1, color: "#fff" }} animate={{ scale: 1, color: "#d4af37" }} className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-400">
                    {estimatedCost === null ? "Custom Quote" : `₹${estimatedCost.toLocaleString()}`}
                  </motion.span>
                </div>
                <div className="flex justify-between text-[#d4af37]/70 text-xs mt-2 font-bold tracking-widest"><span>EST. TIMELINE:</span><span>{(watchAllFields.areaSize || 0) > 2000 ? "4-6 MONTHS" : "2-3 MONTHS"}</span></div>
              </div>
              <div className="mt-8 rounded-xl bg-black/50 border border-white/5 p-6 relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  {submitted ? (<><CheckCircle2 className="text-green-400 mb-3" size={32} /><span className="text-white font-bold mb-1">Quote Processed!</span><span className="text-white/50 text-xs">We will contact you shortly.</span></>) : isSubmitting ? (<><Loader2 className="text-[#d4af37] animate-spin mb-3" size={32} /><span className="text-[#d4af37] font-bold mb-1">Generating Quote...</span><span className="text-white/50 text-xs">Sending to owner automatically</span></>) : (isValid && step === totalSteps) ? (<><div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mb-3" /><span className="text-white/90 font-bold text-sm mb-1">Ready to send</span><span className="text-white/50 text-xs">Waiting for you to finish...</span></>) : (<><div className="w-12 h-1 bg-white/10 rounded-full mb-4 overflow-hidden"><motion.div className="h-full bg-[#d4af37]" initial={{ width: "0%" }} animate={{ width: Object.keys(watchAllFields).filter(k => !!watchAllFields[k as keyof FullQuoteData]).length > 4 ? "50%" : "10%" }} /></div><span className="text-white/50 text-xs tracking-wide">Complete all required fields.<br/>System will auto-submit.</span></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#d4af37]" size={48} /></div>}>
      <CalculatorContent />
    </Suspense>
  );
}
