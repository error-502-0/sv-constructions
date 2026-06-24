"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, CheckCircle2, Loader2, ChevronLeft, ChevronRight, Trash2, Edit3, Save, LogOut } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchCombos, fetchItemPrices, saveItemPrices, deleteCombo, updateCombo, Combo } from "@/services/pricingService";
import { useConfig, getRoomFieldName } from "@/components/ConfigProvider";

// UI Components
const CheckboxGroup = ({ name, options, control, label }: any) => (
  <div className="mb-6">
    <label className="text-white/60 text-xs uppercase block mb-3">{label}</label>
    <Controller name={name} control={control} render={({field}) => (
      <div className="flex flex-wrap gap-3">
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

const RadioGroup = ({ name, options, control, label }: any) => (
  <div className="mb-6">
    <label className="text-white/60 text-xs uppercase block mb-3">{label}</label>
    <Controller name={name} control={control} render={({field}) => (
      <div className="flex flex-wrap gap-3">
        {options.map((opt: string) => {
          const isSelected = field.value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => field.onChange(opt)}
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

const PriceInputGroup = ({ label, options, itemPrices, setItemPrices }: any) => (
  <div className="mb-8">
    <h4 className="text-[#d4af37] font-semibold text-sm mb-4 uppercase tracking-wider">{label}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.map((opt: string) => (
        <div key={opt} className="bg-white/5 p-4 rounded-xl border border-white/10">
          <label className="text-white/80 text-xs block mb-2 font-bold">{opt}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">₹</span>
            <input 
              type="number"
              value={itemPrices[opt] || ""}
              onChange={(e) => setItemPrices({ ...itemPrices, [opt]: e.target.value ? Number(e.target.value) : 0 })}
              className="w-full bg-[#020617] border border-white/10 rounded-lg pl-8 pr-4 py-2 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="0"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const generateKeysFromSelections = (data: any, config: any) => {
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

  const mapArray = (prefix: string, arr: string[]) => {
    if (Array.isArray(arr)) arr.forEach(val => mapValue(prefix, val));
  };
  
  mapArray('config', data.configuration);
  mapArray('mat_pref', data.materialPreference);
  
  // Map dynamic rooms
  config.rooms.forEach((room: any) => {
    const fieldName = getRoomFieldName(room.name);
    mapArray(fieldName, data[fieldName]);
  });

  return keys.sort();
};

export default function OwnerDashboard() {
  const router = useRouter();
  const config = useConfig();
  const [activeTab, setActiveTab] = useState<"combos" | "prices" | "view">("combos");
  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  
  // Wizard State
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form states
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      comboName: "",
      comboPrice: "",
      propertyType: "",
      propertyStatus: "",
      configuration: [],
      materialPreference: [],
      hardware: "",
      plywoodChoice: "",
      ...Object.fromEntries(config.rooms.map((r: any) => [getRoomFieldName(r.name), []]))
    },
  });

  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [initialItemPrices, setInitialItemPrices] = useState<Record<string, number>>({});
  const [savedCombos, setSavedCombos] = useState<Combo[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isFetchingData, setIsFetchingData] = useState(true);

  const hasUnsavedChanges = JSON.stringify(itemPrices) !== JSON.stringify(initialItemPrices);

  useEffect(() => {
    const loadData = async () => {
      setIsFetchingData(true);
      const [fetchedCombos, fetchedPrices] = await Promise.all([fetchCombos(), fetchItemPrices()]);
      setSavedCombos(fetchedCombos);
      setItemPrices(fetchedPrices);
      setInitialItemPrices(fetchedPrices);
      setIsFetchingData(false);
    };
    loadData();
  }, []);

  const onComboSubmit = async (data: any) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      if (!data.comboName || !data.comboPrice) {
        throw new Error("Combo Name and Price are required.");
      }
      const generatedKeys = generateKeysFromSelections(data, config);
      if (generatedKeys.length === 0) {
        throw new Error("Please select at least one feature for the combo.");
      }
      if (editingComboId) {
        await updateCombo(editingComboId, {
          name: data.comboName,
          price: Number(data.comboPrice),
          items: generatedKeys,
          rawForm: data,
        });
        setEditingComboId(null);
      } else {
        const combosCol = collection(db, "combos");
        await addDoc(combosCol, {
          name: data.comboName,
          price: Number(data.comboPrice),
          items: generatedKeys,
          rawForm: data,
          createdAt: new Date().toISOString()
        });
      }
      setSubmitted(true);
      reset();
      setStep(1);
      
      // Reload combos
      const fetchedCombos = await fetchCombos();
      setSavedCombos(fetchedCombos);
      
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save combo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCombo = (combo: Combo) => {
    if (combo.rawForm) {
      reset(combo.rawForm);
    } else {
      reset({
        comboName: combo.name,
        comboPrice: combo.price.toString(),
      } as any);
    }
    setEditingComboId(combo.id);
    setActiveTab("combos");
    setStep(1);
  };

  const savePrices = async () => {
    setIsSubmitting(true);
    try {
      await saveItemPrices(itemPrices);
      setInitialItemPrices(itemPrices);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to save prices");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (confirm("Are you sure you want to delete this combo?")) {
      await deleteCombo(id);
      const fetchedCombos = await fetchCombos();
      setSavedCombos(fetchedCombos);
    }
  };

  const watchAllFields = watch();
  const currentKeys = generateKeysFromSelections(watchAllFields, config);

  const renderComboStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 1: Property Basics</h3>
            <RadioGroup name="propertyType" control={control} label="Property Type" options={config.propertyTypeOptions} />
            <RadioGroup name="propertyStatus" control={control} label="Property Status" options={config.propertyStatusOptions} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 2: Configuration</h3>
            <CheckboxGroup name="configuration" control={control} label="Configuration" options={config.configurationOptions} />
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 3: Primary Rooms</h3>
            {config.rooms.slice(0, 4).map((room: any, idx: number) => (
              <CheckboxGroup key={idx} name={getRoomFieldName(room.name)} control={control} label={room.name} options={room.options} />
            ))}
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 4: Secondary Rooms</h3>
            {config.rooms.slice(4).map((room: any, idx: number) => (
              <CheckboxGroup key={idx} name={getRoomFieldName(room.name)} control={control} label={room.name} options={room.options} />
            ))}
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 5: Materials</h3>
            <CheckboxGroup name="materialPreference" control={control} label="Material Preference" options={config.materialPreferenceOptions} />
            <RadioGroup name="hardware" control={control} label="Hardware" options={config.hardwareOptions} />
            <RadioGroup name="plywoodChoice" control={control} label="Plywood Choice" options={config.plywoodChoiceOptions} />
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 6: Combo Details & Submit</h3>
            <div className="grid md:grid-cols-2 gap-4 bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
              <div>
                <label className="text-white/80 text-xs uppercase block mb-2 font-bold">Combo Name *</label>
                <Controller name="comboName" control={control} render={({field}) => <input {...field} placeholder="e.g. Basic 2BHK Apartment" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />} />
              </div>
              <div>
                <label className="text-white/80 text-xs uppercase block mb-2 font-bold">Total Combo Price (₹) *</label>
                <Controller name="comboPrice" control={control} render={({field}) => <input {...field} type="number" placeholder="e.g. 500000" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />} />
              </div>
            </div>
            
            {errorMsg && <div className="text-red-400 mt-4 text-center">{errorMsg}</div>}
            {submitted && <div className="text-green-400 mt-4 text-center flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Combo added successfully!</div>}
          </motion.div>
        );
      default: return null;
    }
  };

  const renderPricesStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="p-step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 1: Property Basics</h3>
            <PriceInputGroup label="Property Type" options={config.propertyTypeOptions} itemPrices={itemPrices} setItemPrices={setItemPrices} />
            <PriceInputGroup label="Property Status" options={config.propertyStatusOptions} itemPrices={itemPrices} setItemPrices={setItemPrices} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="p-step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 2: Configuration</h3>
            <PriceInputGroup label="Configuration" options={config.configurationOptions} itemPrices={itemPrices} setItemPrices={setItemPrices} />
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="p-step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 3: Primary Rooms</h3>
            {config.rooms.slice(0, 4).map((room: any, idx: number) => (
              <PriceInputGroup key={idx} label={room.name} options={room.options} itemPrices={itemPrices} setItemPrices={setItemPrices} />
            ))}
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="p-step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 4: Secondary Rooms</h3>
            {config.rooms.slice(4).map((room: any, idx: number) => (
              <PriceInputGroup key={idx} label={room.name} options={room.options} itemPrices={itemPrices} setItemPrices={setItemPrices} />
            ))}
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="p-step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 5: Materials</h3>
            <PriceInputGroup label="Material Preference" options={config.materialPreferenceOptions} itemPrices={itemPrices} setItemPrices={setItemPrices} />
            <PriceInputGroup label="Hardware" options={config.hardwareOptions} itemPrices={itemPrices} setItemPrices={setItemPrices} />
            <PriceInputGroup label="Plywood Choice" options={config.plywoodChoiceOptions} itemPrices={itemPrices} setItemPrices={setItemPrices} />
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="p-step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-[#d4af37] font-bold text-lg mb-4 uppercase tracking-widest border-b border-[#d4af37]/20 pb-2">Step 6: Save Prices</h3>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center mt-8">
              <p className="text-white/60 mb-6">Review your entered prices. When ready, click below to update the system. These prices will be used to calculate custom estimates for users.</p>
              {errorMsg && <div className="text-red-400 mt-4 mb-4 text-center">{errorMsg}</div>}
              {submitted && <div className="text-green-400 mt-4 mb-4 text-center flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Prices updated successfully!</div>}
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-wider">Manage Combos & Prices</h2>
          <p className="text-white/50 mt-1">Create customized preset combos or edit individual item prices.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => { setActiveTab("combos"); setStep(1); setEditingComboId(null); reset(); }} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "combos" ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/60 hover:text-white border border-white/10'}`}
          >
            Add New Combo
          </button>
          <button 
            onClick={() => { setActiveTab("prices"); setStep(1); }} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "prices" ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/60 hover:text-white border border-white/10'}`}
          >
            Individual Prices
          </button>
          <button 
            onClick={() => { setActiveTab("view"); setStep(1); }} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "view" ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/60 hover:text-white border border-white/10'}`}
          >
            View Combos
          </button>
        </div>
      </div>

      {isFetchingData ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#d4af37] mb-4" size={48} />
          <p className="text-white/50">Loading data...</p>
        </div>
      ) : activeTab === "view" ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-6">Saved Combos ({savedCombos.length})</h2>
          {savedCombos.length === 0 ? (
            <p className="text-white/50 text-center py-12 italic">No combos saved yet.</p>
          ) : (
            <div className="grid gap-4">
              {savedCombos.map((combo) => (
                <div key={combo.id} className="bg-black/30 border border-white/5 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div>
                    <h3 className="text-[#d4af37] font-bold text-xl mb-1">{combo.name}</h3>
                    <p className="text-white font-mono bg-[#020617] px-3 py-1 rounded inline-block text-sm border border-white/10 mb-2">₹{combo.price.toLocaleString()}</p>
                    <p className="text-white/40 text-xs line-clamp-2 max-w-2xl" title={combo.items.join(', ')}>Keys: {combo.items.join(', ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditCombo(combo)} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors border border-blue-500/20">
                      <Edit3 size={16} /> Edit
                    </button>
                    <button onClick={() => handleDeleteCombo(combo.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors border border-red-500/20">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid xl:grid-cols-3 gap-8 relative z-10">
          <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col min-h-[500px]">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden flex-shrink-0">
              <motion.div 
                className="h-full bg-[#d4af37]" 
                initial={{ width: "0%" }} 
                animate={{ width: `${(step / totalSteps) * 100}%` }} 
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex-grow">
              {activeTab === "combos" ? (
                <form id="combo-form" onSubmit={handleSubmit(onComboSubmit)} className="space-y-8 h-full">
                  <AnimatePresence mode="wait">
                    {renderComboStepContent()}
                  </AnimatePresence>
                </form>
              ) : (
                <div className="space-y-8 h-full">
                  <AnimatePresence mode="wait">
                    {renderPricesStepContent()}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10 flex-shrink-0">
              <button
                type="button"
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'}`}
              >
                <ChevronLeft size={18} /> Previous
              </button>
              
              <div className="text-white/40 text-sm font-medium hidden sm:block">
                Step {step} of {totalSteps}
              </div>

              <div className="flex items-center gap-3">
                {activeTab === "prices" && hasUnsavedChanges && step < totalSteps && (
                  <button
                    onClick={savePrices}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
                  </button>
                )}
                
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => setStep(prev => prev + 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37]/50"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  activeTab === "combos" ? (
                    <button
                      type="button"
                      onClick={handleSubmit(onComboSubmit)}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-[#d4af37] text-black hover:bg-[#b08d29] disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {editingComboId ? 'Update Combo' : 'Save Combo'}
                    </button>
                  ) : (
                    <button
                      onClick={savePrices}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-[#d4af37] text-black hover:bg-[#b08d29] disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Prices
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-8 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
              {activeTab === "combos" ? (
                <>
                  <h3 className="text-white font-bold text-xl mb-6">Generated Keys ({currentKeys.length})</h3>
                  <p className="text-white/50 text-xs mb-4">These are the exact backend keys that will be matched when a user selects the same options in the calculator.</p>
                  <div className="bg-[#020617] p-4 rounded-xl border border-white/10 max-h-[400px] overflow-y-auto font-mono text-xs text-white/70 space-y-2">
                    {currentKeys.length === 0 ? <span className="italic">No options selected yet...</span> : currentKeys.map(key => (
                      <div key={key} className="break-all border-b border-white/5 pb-1 mb-1">{key}</div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2"><Edit3 className="text-[#d4af37]" /> Manage Prices</h3>
                  <p className="text-white/50 text-sm mb-4">Enter individual prices for any component you want to charge for separately.</p>
                  <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 p-4 rounded-xl text-sm text-[#d4af37]/90 leading-relaxed mb-6">
                    If a user's selection matches a Combo exactly, the Combo price overrides individual item prices. Otherwise, all selected individual item prices are summed up.
                  </div>
                  <div className="flex justify-between items-center bg-[#020617] p-4 rounded-xl border border-white/10">
                    <span className="text-white/60 text-sm">Total Priced Items</span>
                    <span className="text-white font-bold bg-white/10 px-3 py-1 rounded-full">{Object.values(itemPrices).filter(v => v > 0).length}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
