
import React, { useState, useMemo, useEffect } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { EducationalCycle, SelectionState, CDASequencing, CDASequencingItem } from './types';
import { CDA_DATA, COMPETENCES } from './constants';
import { generateCDASequencing } from './geminiService';

const ROBOTS_OPTIONS = [
  'Dispositius',
  'Robots compactes amb polsadors',
  'Robots compactes amb sensors i actuadors',
  'Robots amb hub i kit constructiu',
  'Plaques',
  'Conjunt de sensors i actuadors',
  'Màquines maker',
  'Maleta audiovisual',
  'Programari'
];

const DEVICES_OPTIONS = [
  'Portàtil',
  'PC',
  'Chromebook',
  'Tauleta'
];

const MALETA_ELEMENTS = [
  'Croma i il·luminació (softboxes, paraigües, teles)',
  'Cercle de llum LED',
  'Micròfon de taula XLR',
  'Micròfons lavalier (simple i doble sense fil)',
  'Micròfon sense fil de mà',
  'Taula de so USB de 12 canals',
  'Amplificador d\'auriculars',
  'Gravadora d\'àudio digital portàtil',
  'Càmera de vídeo 4K',
  'Càmera d\'acció 4K',
  'Caixa d\'estudi fotogràfic',
  'Trípodes',
  'Estabilitzador de mà (Gimbal)'
];

const SENSORS_PRIMARIA_ELEMENTS = [
  'Placa d\'extensió micro:shield',
  'Sensor d\'humitat del terra',
  'Pantalla OLED',
  'Sensor de col·lisió o fi de cursa',
  'Sensor infraroig (x3)',
  'Sensor PIR',
  'Sensor de distància per ultrasons',
  'Tira de 30 leds (1m)',
  'Motor amb roda (x2)',
  'Servomotor (x2)'
];

const SENSORS_SECUNDARIA_BASIC_ELEMENTS = [
  'Sensor de llum',
  'Sensor d\'humitat del terra',
  'Sensor de temperatura',
  'Pantalla OLED',
  'Sensor de col·lisió o fi de cursa',
  'Sensor infraroig (x3)',
  'Sensor PIR',
  'Sensor de distància per ultrasons',
  'Tira de 30 LEDs (1m)',
  'Motor amb roda (x2)',
  'Servomotor (x2)'
];

const SENSORS_SECUNDARIA_AVANCAT_ELEMENTS = [
  'Sensor de so/micròfon',
  'Giroscopi i acceleròmetre',
  'Sensor CO2',
  'Sensor d\'humitat i temperatura',
  'Sensor pressió baromètrica',
  'LED blanc',
  'LED groc',
  'LED verd',
  'LED vermell',
  'LED RGB',
  'Brunzidor',
  'Relé',
  'Bomba d\'aigua',
  'Receptor IR i comandament',
  'Emissor IR',
  'Polsador'
];

const KIT_ELEMENTS_MAP: Record<string, string[]> = {
  'Dispositius': DEVICES_OPTIONS,
  'Robots compactes amb polsadors': ['beebot', 'bluebot', 'mtiny', 'code and go mouse', 'cubetto'],
  'Robots compactes amb sensors i actuadors': ['Codey Rocky', 'Dash', 'Edsson v3'],
  'Robots amb hub i kit constructiu': ['Lego Spike Essential', 'Lego Spike Prime', 'Mbot2'],
  'Plaques': ['Microbit', 'esp32', 'keystudio uno', 'imagina', 'whapstto:bit', 'microshield'],
  'Conjunt de sensors i actuadors': [
    'conjunt de sensors i actuadors primària amb reptes',
    'conjunt de sensors i actuadors secundària bàsic',
    'conjunt de sensors i actuadors secundària avançat'
  ],
  'Màquines maker': ['Impressora 3D', 'Talladora làser', 'Màquina de tall de vinil', 'Brodadora'],
  'Maleta audiovisual': MALETA_ELEMENTS,
  'Programari': ['Scratch (només programari)', 'mBlock (només programari)'],
  
  // Mappings per als kits de sensors (segon nivell)
  'conjunt de sensors i actuadors primària amb reptes': SENSORS_PRIMARIA_ELEMENTS,
  'conjunt de sensors i actuadors secundària bàsic': SENSORS_SECUNDARIA_BASIC_ELEMENTS,
  'conjunt de sensors i actuadors secundària avançat': SENSORS_SECUNDARIA_AVANCAT_ELEMENTS
};

// --- Robot Illustrations (SVGs) ---

const IconCodeyRocky = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] animate-float`} style={{ animationDelay: '0s' }}>
    <rect x="20" y="40" width="60" height="45" rx="10" fill="#f8fafc" />
    <rect x="25" y="45" width="50" height="25" rx="5" fill="#1e293b" />
    <path d="M30 50 Q 50 65 70 50" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.5" />
    <circle cx="35" cy="55" r="2" fill="#38bdf8" />
    <circle cx="45" cy="55" r="2" fill="#38bdf8" />
    <circle cx="55" cy="55" r="2" fill="#38bdf8" />
    <circle cx="65" cy="55" r="2" fill="#38bdf8" />
    <rect x="20" y="30" width="15" height="15" rx="4" fill="#f8fafc" />
    <rect x="65" y="30" width="15" height="15" rx="4" fill="#f8fafc" />
    <rect x="30" y="85" width="40" height="10" rx="2" fill="#64748b" />
    <circle cx="35" cy="90" r="4" fill="#334155" />
    <circle cx="65" cy="90" r="4" fill="#334155" />
  </svg>
);

const IconMicrobit = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] animate-float`} style={{ animationDelay: '2s' }}>
    <rect x="15" y="20" width="70" height="60" rx="4" fill="#2d2d2d" />
    <rect x="35" y="35" width="30" height="30" fill="#1a1a1a" />
    {Array.from({ length: 25 }).map((_, i) => (
      <rect 
        key={i} 
        x={38 + (i % 5) * 5} 
        y={38 + Math.floor(i / 5) * 5} 
        width="3" 
        height="3" 
        fill={Math.random() > 0.6 ? "#ef4444" : "#333"} 
      />
    ))}
    <circle cx="25" cy="50" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
    <circle cx="75" cy="50" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
    <text x="25" y="53" textAnchor="middle" fontSize="8" fontWeight="black" fill="#92400e">A</text>
    <text x="75" y="53" textAnchor="middle" fontSize="8" fontWeight="black" fill="#92400e">B</text>
    <rect x="15" y="75" width="70" height="5" fill="#fbbf24" />
  </svg>
);

const IconLegoRobot = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] animate-float`} style={{ animationDelay: '1.5s' }}>
    <rect x="30" y="30" width="40" height="50" rx="5" fill="#f8fafc" />
    <rect x="35" y="35" width="30" height="20" rx="2" fill="#fbbf24" />
    <rect x="30" y="60" width="10" height="15" fill="#3b82f6" />
    <rect x="60" y="60" width="10" height="15" fill="#3b82f6" />
    <circle cx="50" cy="45" r="5" fill="#ffffff" stroke="#000" strokeWidth="1" />
    <circle cx="50" cy="45" r="2" fill="#000" />
    <rect x="25" y="75" width="50" height="8" rx="2" fill="#64748b" />
    <rect x="40" y="20" width="20" height="10" fill="#f8fafc" />
    <circle cx="45" cy="25" r="2" fill="#ef4444" />
    <circle cx="55" cy="25" r="2" fill="#ef4444" />
  </svg>
);

const IconMouseRobot = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] animate-float`} style={{ animationDelay: '0.8s' }}>
    <ellipse cx="50" cy="60" rx="35" ry="30" fill="#22c55e" />
    <circle cx="50" cy="50" r="10" fill="#a855f7" />
    <path d="M50 40 L 60 50 L 50 60 L 40 50 Z" fill="#ffffff" />
    <circle cx="35" cy="50" r="5" fill="#eab308" />
    <circle cx="65" cy="50" r="5" fill="#eab308" />
    <circle cx="50" cy="65" r="5" fill="#eab308" />
    <rect x="48" y="20" width="4" height="10" rx="2" fill="#1e293b" />
    <circle cx="40" cy="35" r="3" fill="#1e293b" />
    <circle cx="60" cy="35" r="3" fill="#1e293b" />
  </svg>
);

const IconGenericRobot = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] animate-float`}>
    <rect x="25" y="30" width="50" height="40" rx="5" fill="#cbd5e1" />
    <rect x="35" y="40" width="10" height="10" rx="2" fill="#1e293b" />
    <rect x="55" y="40" width="10" height="10" rx="2" fill="#1e293b" />
    <rect x="40" y="60" width="20" height="4" rx="2" fill="#1e293b" />
    <rect x="45" y="20" width="10" height="10" rx="2" fill="#94a3b8" />
    <circle cx="50" cy="15" r="3" fill="#ef4444" />
  </svg>
);

const IconMaletaAudiovisual = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] animate-float`}>
    <rect x="15" y="30" width="70" height="50" rx="8" fill="#1e293b" />
    <rect x="20" y="35" width="60" height="40" rx="4" fill="#334155" />
    <rect x="40" y="20" width="20" height="10" rx="2" fill="#64748b" />
    <circle cx="35" cy="55" r="8" fill="#94a3b8" stroke="#f8fafc" strokeWidth="2" />
    <circle cx="35" cy="55" r="3" fill="#1e293b" />
    <rect x="55" y="45" width="20" height="20" rx="2" fill="#ef4444" opacity="0.8" />
    <path d="M60 50 L 70 55 L 60 60 Z" fill="white" />
    <rect x="25" y="75" width="50" height="2" fill="#475569" />
  </svg>
);

const RobotIllustration = ({ name, className = "" }: { name: string, className?: string }) => {
  const n = name.toLowerCase();
  if (n.includes('maleta')) return <IconMaletaAudiovisual className={className} />;
  if (n.includes('microbit')) return <IconMicrobit className={className} />;
  if (n.includes('codey rocky')) return <IconCodeyRocky className={className} />;
  if (n.includes('lego') || n.includes('spike')) return <IconLegoRobot className={className} />;
  if (n.includes('mouse')) return <IconMouseRobot className={className} />;
  return <IconGenericRobot className={className} />;
};

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasUserKey, setHasUserKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  const [state, setState] = useState<SelectionState>({
    title: '',
    cycle: EducationalCycle.INICIAL,
    sessions: 6,
    sessionDuration: 60,
    birthYear: new Date().getFullYear() - 6,
    classGroup: 'A',
    robots: [],
    devices: [],
    selectedCompetenceIds: COMPETENCES.map(c => c.id),
    selectedCriteriaIds: [],
    selectedSaberIds: []
  });
  
  const [result, setResult] = useState<CDASequencing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Si estem dins de l'entorn d'AI Studio, comprovem si s'ha seleccionat una clau
      if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasUserKey(hasKey);
      } else {
        // Si estem fora (app publicada/standalone), assumim que la clau es gestiona via variables d'entorn al servidor
        setHasUserKey(true);
      }
      setCheckingKey(false);
    };
    checkKey();
  }, []);

  const exportToPDF = () => {
    if (!result) return;
    
    const element = document.getElementById('pdf-content');
    if (!element) {
      console.error('PDF content element not found');
      return;
    }

    const opt = {
      margin: 10,
      filename: `Sequenciacio_CDA_${state.cycle.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Handle potential default import issues in different environments
      const h2p = (html2pdf as any).default || html2pdf;
      h2p().set(opt).from(element).save();
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const handleNext = () => {
    if (step === 1) {
        if (!state.title) {
            setError("Cal posar un títol a la seqüenciació.");
            return;
        }
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const toggleRobotSelection = (robotName: string) => {
    setState(prev => {
        const currentRobots = prev.robots || [];
        const isSelected = currentRobots.includes(robotName);
        const nextRobots = isSelected
            ? currentRobots.filter(r => r !== robotName)
            : [...currentRobots, robotName];
        
        const nextKitElements = { ...(prev.kitElements || {}) };
        if (isSelected && robotName in KIT_ELEMENTS_MAP) {
            delete nextKitElements[robotName];
        }

        return { ...prev, robots: nextRobots, kitElements: nextKitElements };
    });
  };

  const toggleKitElementSelection = (kitName: string, element: string) => {
    setState(prev => {
        const currentKits = prev.kitElements || {};
        const currentElements = currentKits[kitName] || [];
        const nextElements = currentElements.includes(element)
            ? currentElements.filter(e => e !== element)
            : [...currentElements, element];
        
        // Si és la categoria "Dispositius", també actualitzem el camp "devices"
        if (kitName === 'Dispositius') {
          return {
            ...prev,
            devices: nextElements,
            kitElements: { ...currentKits, [kitName]: nextElements }
          };
        }

        return { 
            ...prev, 
            kitElements: { 
                ...currentKits, 
                [kitName]: nextElements 
            } 
        };
    });
  };

  const handleTopicChange = (criteriId: string, value: string) => {
    setState(prev => ({
      ...prev,
      topics: {
        ...(prev.topics || {}),
        [criteriId]: value
      }
    }));
  };

  const downloadCSV = () => {
    if (!result) return;
    
    const headers = ['Criteri', 'Saber', 'Proposta d\'Activitat', 'Eines Digitals', 'Producte Final'];
    const rows = result.sequenciacio.map(item => [
      `"${item.criteriId}: ${item.criteriDescripcio.replace(/"/g, '""')}"`,
      `"${item.saberId}: ${item.saberDescripcio.replace(/"/g, '""')}"`,
      `"${item.propostaActivitat.replace(/"/g, '""')}"`,
      `"${item.einesUtilitzades.join(', ')}"`,
      `"${item.producteFinal.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sequenciacio_${state.cycle.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenKeySelector = async () => {
    try {
      if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
        setHasUserKey(true);
      }
    } catch (e) {
      console.error("Error clau", e);
    }
  };

  const handleGenerate = async () => {
    const hasAnyTool = (state.robots?.length || 0) > 0 || (state.devices?.length || 0) > 0;
    if (!hasAnyTool) {
      setError("Cal seleccionar almenys una eina o dispositiu.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await generateCDASequencing(state);
      setResult(res);
      setStep(3);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found.")) {
        setHasUserKey(false);
        setError("S'ha produït un error amb la clau API.");
        handleOpenKeySelector();
      } else {
        setError("S'ha produït un error en la generació.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasUserKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8 border border-slate-100">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">🔑</div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Clau API Necessària</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Per generar la seqüenciació amb IA, cal que seleccionis la teva clau de Google Cloud.
              {!(window as any).aistudio && (
                <span className="block mt-4 text-amber-600 font-bold italic text-xs">
                  Si estàs en una app publicada, assegura't que la variable d'entorn API_KEY està configurada.
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full p-6 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-sm active:scale-95"
          >
            SELECCIONAR CLAU API
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-indigo-800 text-white py-24 px-6 shadow-2xl mb-12 text-center relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-700 rounded-full -mr-48 -mt-48 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900 rounded-full -ml-48 -mb-48 opacity-30 blur-3xl"></div>
        
        <div className="absolute top-10 left-10 md:left-24 w-28 md:w-44 z-0">
            <IconMicrobit className="w-full" />
        </div>
        <div className="absolute bottom-8 right-10 md:right-24 w-28 md:w-44 z-0">
            <IconCodeyRocky className="w-full" />
        </div>

        <div className="max-w-4xl mx-auto relative z-20 space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-1 tracking-tighter leading-tight drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">Seqüenciació de la CDA</h1>
            <p className="text-xl md:text-2xl text-indigo-100 font-bold italic opacity-100 tracking-wide drop-shadow-md">Planificació de la Competència Digital de l'Alumnat</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {error && (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] text-red-700 font-bold flex justify-between items-center shadow-lg animate-fadeIn">
                <span className="flex items-center gap-3">⚠️ {error}</span>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-black">✕</button>
            </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-12 animate-fadeIn border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b pb-8">
                <h2 className="text-3xl font-black flex items-center gap-4 text-slate-800">
                    <span className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg">1</span>
                    Cicle i Títol
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 italic">Títol de la Seqüenciació</label>
                  <input type="text" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:shadow-xl outline-none transition-all font-bold text-lg" placeholder="Ex: Seqüenciació 2025-26..." value={state.title} onChange={e => setState({...state, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Cicle Educatiu</label>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.values(EducationalCycle).map(c => (
                      <button key={c} onClick={() => setState({...state, cycle: c})} className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all text-sm ${state.cycle === c ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-md' : 'bg-white border-slate-100 text-slate-500'}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 mb-4">Per què aquesta eina?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Aquesta aplicació t'ajudarà a crear una planificació detallada de com treballar la Competència Digital de l'Alumnat (CDA) al llarg del cicle seleccionat, aprofitant els recursos tecnològics que teniu al centre.
                  </p>
                </div>
              </div>
            </div>
            
            <button onClick={handleNext} className="w-full p-6 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-sm active:scale-95">TRIAR EINES ➡️</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-12 border border-slate-100">
              <h2 className="text-3xl font-black flex items-center gap-4 text-slate-800 border-b pb-8">
                <span className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg">2</span>
                Eines i Dispositius
              </h2>
              
              <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-200 shadow-inner">
                <h3 className="font-black text-amber-800 text-[11px] uppercase tracking-widest mb-6 italic">🛠️ Selecciona les eines que teniu al centre</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ROBOTS_OPTIONS.map(r => (
                    <button key={r} onClick={() => toggleRobotSelection(r)} className={`p-4 rounded-xl border-2 text-center font-bold transition-all text-xs ${state.robots?.includes(r) ? 'bg-amber-400 border-amber-500 text-amber-900 shadow-md' : 'bg-white border-slate-100 text-slate-500'}`}>{r}</button>
                  ))}
                </div>

                {(state.robots || []).map(category => {
                  if (!KIT_ELEMENTS_MAP[category]) return null;
                  return (
                    <div key={category} className="space-y-6">
                      <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-amber-100 animate-fadeIn">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
                          <span>{category === 'Dispositius' ? '💻' : '📂'}</span> {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {KIT_ELEMENTS_MAP[category].map(item => (
                            <label key={item} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${state.kitElements?.[category]?.includes(item) ? 'bg-amber-50 border-amber-400' : 'bg-slate-50 border-transparent hover:bg-white'}`}>
                              <input 
                                type="checkbox" 
                                checked={state.kitElements?.[category]?.includes(item) || false} 
                                onChange={() => toggleKitElementSelection(category, item)}
                                className="w-4 h-4 accent-amber-600"
                              />
                              <span className="text-[11px] font-bold text-slate-700">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {state.kitElements?.[category]?.map(subItem => {
                        if (!KIT_ELEMENTS_MAP[subItem]) return null;
                        return (
                          <div key={subItem} className="ml-6 p-6 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-200 animate-fadeIn">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-4 flex items-center gap-2">
                              <span>🔌</span> Elements de: {subItem}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {KIT_ELEMENTS_MAP[subItem].map(element => (
                                <label key={element} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${state.kitElements?.[subItem]?.includes(element) ? 'bg-white border-amber-500 shadow-sm' : 'bg-white/50 border-transparent hover:bg-white'}`}>
                                  <input 
                                    type="checkbox" 
                                    checked={state.kitElements?.[subItem]?.includes(element) || false} 
                                    onChange={() => toggleKitElementSelection(subItem, element)}
                                    className="w-4 h-4 accent-amber-600"
                                  />
                                  <span className="text-[10px] font-bold text-slate-600">{element}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="bg-indigo-50 p-8 rounded-[2rem] border-2 border-indigo-100 shadow-inner">
                <h3 className="font-black text-indigo-800 text-[11px] uppercase tracking-widest mb-6 italic">📝 Temes per Criteri (Opcional)</h3>
                <p className="text-xs text-indigo-600 mb-6 font-medium">Escriu el tema o centre d'interès que vols treballar per a cada criteri d'avaluació. Si ho deixes en blanc, la IA en proposarà un basat en el currículum de Catalunya.</p>
                <div className="space-y-4">
                  {CDA_DATA[state.cycle].criteria.map(c => (
                    <div key={c.id} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Criteri {c.id}</span>
                          <p className="text-xs font-bold text-slate-700 leading-tight">{c.description}</p>
                        </div>
                        <div className="md:w-1/3">
                          <input 
                            type="text" 
                            placeholder="Tema (opcional, la IA en proposarà un)..." 
                            className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-400 outline-none transition-all text-xs font-bold"
                            value={state.topics?.[c.id] || ''}
                            onChange={(e) => handleTopicChange(c.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <button onClick={handleBack} className="p-6 flex-1 bg-white border-2 border-slate-200 rounded-3xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">⬅️ TORNAR</button>
              <button onClick={handleGenerate} disabled={loading} className="p-6 flex-[2] bg-indigo-600 text-white rounded-3xl font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50">
                {loading ? 'S\'ESTÀ GENERANT LA SEQÜENCIACIÓ...' : 'GENERAR SEQÜENCIACIÓ ✨'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="space-y-12 animate-fadeIn pb-20">
            <div className="bg-indigo-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden border-b-8 border-indigo-700">
              <div className="max-w-4xl flex flex-col md:flex-row items-start md:items-center gap-10">
                <div className="flex-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 mb-6 block italic">SEQÜENCIACIÓ CDA</span>
                  <h1 className="text-5xl font-black mb-10 leading-[1.1] tracking-tight">{result.titol}</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-black uppercase text-[10px] tracking-widest">
                      <div className="bg-white/10 p-5 rounded-2xl border border-white/10">🏫 Cicle: {result.cicle}</div>
                      <div className="bg-amber-400 text-indigo-900 p-5 rounded-2xl shadow-xl">
                        🛠️ {result.einesSeleccionades.join(', ')}
                      </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-xl p-12 space-y-16 border border-slate-100">
                <section className="space-y-10">
                  <h3 className="text-3xl font-black text-slate-800 flex items-center gap-4 border-b pb-6">
                    <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner text-xl">📅</span> 
                    Proposta de Seqüenciació
                  </h3>
                  <div className="space-y-8">
                    {result.sequenciacio.map((item, i) => (
                      <div key={i} className="bg-slate-50 rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className="bg-indigo-600 p-6 text-white flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Criteri {item.criteriId}</span>
                            <h4 className="text-lg font-black leading-tight">{item.criteriDescripcio}</h4>
                          </div>
                          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Saber {item.saberId}</span>
                            <p className="text-xs font-bold">{item.saberDescripcio}</p>
                          </div>
                        </div>
                        <div className="p-8 space-y-6">
                          <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">🚀 Proposta d'Activitat</h5>
                            <p className="text-slate-700 font-medium leading-relaxed">{item.propostaActivitat}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">🛠️ Eines</h5>
                              <div className="flex flex-wrap gap-2">
                                {item.einesUtilitzades.map((e, idx) => (
                                  <span key={idx} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-[10px] font-black uppercase">{e}</span>
                                ))}
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">📦 Producte Final</h5>
                              <p className="text-xs font-bold text-slate-800">{item.producteFinal}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {result.recomanacionsGlobals && (
                  <section className="space-y-8 bg-amber-50 p-10 rounded-[2.5rem] border-2 border-amber-100">
                    <h3 className="text-2xl font-black text-amber-800 flex items-center gap-4">
                      <span className="w-10 h-10 bg-amber-400 text-amber-900 rounded-xl flex items-center justify-center shadow-lg text-lg">💡</span> 
                      Recomanacions Pedagògiques
                    </h3>
                    <ul className="space-y-4">
                      {result.recomanacionsGlobals.map((r, i) => (
                        <li key={i} className="flex gap-4 text-slate-700 font-medium">
                          <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">✓</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="bg-indigo-50 p-10 rounded-[2.5rem] border-2 border-indigo-100 text-center space-y-6">
                  <h3 className="text-2xl font-black text-indigo-800">Vols aprofundir més?</h3>
                  <p className="text-indigo-600 font-bold">Utilitza la nostra eina avançada per crear Situacions d'Aprenentatge detallades a partir d'aquesta seqüenciació.</p>
                  <a 
                    href="https://ai.studio/apps/2b4f6d4a-f046-4990-bdde-26be041a79e8?fullscreenApplet=true" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
                  >
                    🚀 Situacions d'Aprenentatge CDA 3.0
                  </a>
                </section>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
              <button onClick={exportToPDF} className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-sm flex items-center gap-3">
                <span>📄 DESCARREGAR PDF</span>
              </button>
              <button onClick={() => setStep(4)} className="w-full sm:w-auto px-12 py-6 bg-amber-500 text-white font-black rounded-3xl shadow-2xl hover:bg-amber-600 transition-all uppercase tracking-widest text-sm flex items-center gap-3">
                <span>📊 VEURE TAULA I CSV</span>
              </button>
              <button onClick={() => setStep(1)} className="w-full sm:w-auto px-12 py-6 bg-white border-4 border-slate-100 text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-sm">NOVA SEQÜENCIACIÓ</button>
            </div>
          </div>
        )}
        
        {/* Hidden PDF Content - Always available when result exists */}
        {result && (
          <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '280mm' }}>
            <div id="pdf-content">
              <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333', background: 'white' }}>
                <div style={{ borderBottom: '2px solid #4f46e5', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h1 style={{ fontSize: '20px', color: '#1e1b4b', margin: '0 0 5px 0', fontWeight: '900' }}>{result.titol}</h1>
                  <p style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 'bold', margin: 0 }}>Cicle: {result.cicle} | Eines: {result.einesSeleccionades.join(', ')}</p>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                      <th style={{ padding: '10px', border: '1px solid #e2e8f0', width: '15%' }}>Criteri</th>
                      <th style={{ padding: '10px', border: '1px solid #e2e8f0', width: '20%' }}>Saber Relacionat</th>
                      <th style={{ padding: '10px', border: '1px solid #e2e8f0', width: '45%' }}>Proposta d'Activitat</th>
                      <th style={{ padding: '10px', border: '1px solid #e2e8f0', width: '20%' }}>Eines Digitals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.sequenciacio.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: '10px', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                          <strong style={{ color: '#4f46e5' }}>Criteri {item.criteriId}</strong><br/>
                          {item.criteriDescripcio}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                          <strong style={{ color: '#d97706' }}>Saber {item.saberId}</strong><br/>
                          {item.saberDescripcio}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                          {item.propostaActivitat}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                          {item.einesUtilitzades.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {result.recomanacionsGlobals && (
                  <div style={{ marginTop: '20px', background: '#fffbeb', padding: '15px', borderRadius: '8px', pageBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#b45309', marginBottom: '8px' }}>RECOMANACIONS PEDAGÒGIQUES</h3>
                    <ul style={{ fontSize: '10px', color: '#475569', margin: 0, paddingLeft: '15px' }}>
                      {result.recomanacionsGlobals.map((r, i) => <li key={i} style={{ marginBottom: '4px' }}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {step === 4 && result && (
          <div className="space-y-12 animate-fadeIn pb-20">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b pb-8 gap-4">
                <h2 className="text-3xl font-black text-slate-800">Resum de la Seqüenciació</h2>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={exportToPDF}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    📄 DESCARREGAR PDF
                  </button>
                  <button 
                    onClick={downloadCSV}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    📥 DESCARREGAR CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="p-6 border-b">Criteri</th>
                      <th className="p-6 border-b">Saber Relacionat</th>
                      <th className="p-6 border-b">Proposta d'Activitat</th>
                      <th className="p-6 border-b">Eines Digitals</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-slate-600">
                    {result.sequenciacio.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <td className="p-6 align-top">
                          <span className="text-indigo-600 block mb-1">Criteri {item.criteriId}</span>
                          {item.criteriDescripcio}
                        </td>
                        <td className="p-6 align-top">
                          <span className="text-amber-600 block mb-1">Saber {item.saberId}</span>
                          {item.saberDescripcio}
                        </td>
                        <td className="p-6 align-top leading-relaxed">
                          {item.propostaActivitat}
                        </td>
                        <td className="p-6 align-top">
                          <div className="flex flex-wrap gap-1">
                            {item.einesUtilitzades.map((e, idx) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-[9px] font-black uppercase">{e}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setStep(3)} className="px-12 py-6 bg-white border-4 border-slate-100 text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-sm">⬅️ TORNAR A LA VISTA DETALLADA</button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-20 text-[10px] font-black text-slate-200 uppercase tracking-[0.4em] select-none">IA Educativa • Seqüenciació CDA 2026</footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </div>
  );
};

export default App;
