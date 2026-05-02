"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { InteractiveCanvas } from "@/components/interactive-canvas"
import { HUDOverlay } from "@/components/hud-overlay"

// Updated Types for v3.5 API
interface TopMatch {
  name: string
  status: "ACTIVA" | "MUERTA" | "ADQUIRIDA" | "ALIVE" | "DEAD" | "ACQUIRED"
  description: string
  whyTheyFailed: string[]
  whatTheyDidRight: string[]
  unitEconomics: string
  keyLesson: string
}

interface RadarAlternative {
  name: string
  focus: string
}

interface Verdict {
  title: string
  strategy: string
}

interface PivotOption {
  title: string
  description: string
}

interface Source {
  title: string
  url: string
}

interface Results {
  marketEvaluation: string
  topMatches: TopMatch[]
  radarAlternatives: RadarAlternative[]
  verdict: Verdict
  pivotOptions: PivotOption[]
  sources?: Source[]
  mcpConnected?: boolean
}

interface HistoryNode {
  idea: string
  results: Results
}

const statusConfig = {
  ALIVE: { color: "text-green-400", border: "border-green-400/50", bg: "bg-green-400/10" },
  DEAD: { color: "text-red-500", border: "border-red-500/50", bg: "bg-red-500/10" },
  ACQUIRED: { color: "text-blue-400", border: "border-blue-400/50", bg: "bg-blue-400/10" },
  ACTIVA: { color: "text-green-400", border: "border-green-400/50", bg: "bg-green-400/10" },
  MUERTA: { color: "text-red-500", border: "border-red-500/50", bg: "bg-red-500/10" },
  ADQUIRIDA: { color: "text-blue-400", border: "border-blue-400/50", bg: "bg-blue-400/10" },
}

// Translations
const T = {
  en: {
    subtitle: "THE INTELLIGENCE TO BUILD WHAT'S NEXT",
    title1: "BUILD DIFFERENT.",
    title2: "BECAUSE THEY DIDN'T.",
    desc: "Validate your startup idea. Discover the state of play, learn from mistakes, and build what others missed.",
    stats: [
      { value: "12,847", label: "Active Startups" },
      { value: "86%", label: "Fail Due to Avoidable Errors" },
      { value: "4.7M+", label: "Lessons from Failure" },
      { value: "∞", label: "Opportunities" },
    ],
    placeholder: "Describe your startup idea...",
    ctrlEnter: "CTRL + ENTER",
    marketEval: "MARKET EVALUATION",
    topMatches: "CLOSEST MATCHES",
    match: "MATCH",
    radar: "RADAR ALTERNATIVES",
    verdict: "DOPPELGANGER VERDICT",
    sources: "SOURCES (TAVILY MCP)",
    newSearch: "[NEW SEARCH]",
    loadingLogs: [
      "> Initializing DOPPELGANGER v3.5...",
      "> Connecting to Tavily MCP Server...",
      "> Performing real-time market search...",
      "> Scanning competitor landscape...",
      "> Analyzing startup post-mortems...",
      "> Synthesizing data with Groq LLaMA...",
      "> Generating differentiation strategy...",
    ],
    whyFailed: "WHY THEY FAILED / FRICTIONS",
    whatRight: "TACTICAL WINS TO LEVERAGE",
    unitEcon: "UNIT ECONOMICS",
    keyLesson: "KEY LESSON",
    pivotTree: "PIVOT OPTIONS (SELECT TO ITERATE)",
    history: "ITERATION PATH",
    start: "ORIGINAL IDEA"
  },
  es: {
    subtitle: "LA INTELIGENCIA PARA CONSTRUIR EL FUTURO",
    title1: "CONSTRUYE DIFERENTE.",
    title2: "PORQUE ELLOS NO LO HICIERON.",
    desc: "Valida tu idea de startup. Descubre el estado del arte, aprende de los errores y construye lo que otros pasaron por alto.",
    stats: [
      { value: "12,847", label: "Startups Activas" },
      { value: "86%", label: "Fallan por Errores Evitables" },
      { value: "4.7M+", label: "Lecciones de Fracasos" },
      { value: "∞", label: "Oportunidades" },
    ],
    placeholder: "Describe tu idea de startup...",
    ctrlEnter: "CTRL + ENTER",
    marketEval: "EVALUACIÓN DEL MERCADO",
    topMatches: "LOS MATCHES MÁS PARECIDOS",
    match: "SIMILITUD",
    radar: "OTRAS OPCIONES EN EL RADAR",
    verdict: "EL VEREDICTO DE DOPPELGANGER",
    sources: "FUENTES (TAVILY MCP)",
    newSearch: "[NUEVA BÚSQUEDA]",
    loadingLogs: [
      "> Inicializando DOPPELGANGER v3.5...",
      "> Conectando al Servidor MCP de Tavily...",
      "> Realizando búsqueda de mercado en tiempo real...",
      "> Escaneando panorama de competidores...",
      "> Analizando autopsias de startups...",
      "> Sintetizando datos con Groq LLaMA...",
      "> Generando estrategia de diferenciación...",
    ],
    whyFailed: "POR QUÉ FALLARON / FRICCIONES",
    whatRight: "ACIERTOS TÁCTICOS PARA APALANCAR",
    unitEcon: "UNIT ECONOMICS",
    keyLesson: "LECCIÓN CLAVE",
    pivotTree: "OPCIONES DE PIVOTEO (SELECCIONA PARA ITERAR)",
    history: "RUTA DE ITERACIÓN",
    start: "IDEA ORIGINAL"
  }
}

const sectionVariants = {
  hidden: { opacity: 0, x: -30, filter: "blur(4px)" },
  visible: { 
    opacity: 1, x: 0, filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n\n').map((paragraph, i) => (
    <p key={i} className="mb-4 last:mb-0" dangerouslySetInnerHTML={{
      __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    }} />
  ))
}

export default function DoppelgangerApp() {
  const [lang, setLang] = useState<"en" | "es">("en")
  const t = T[lang]
  const [idea, setIdea] = useState("")
  const [phase, setPhase] = useState<"idle" | "loading" | "results">("idle")
  const [logIndex, setLogIndex] = useState(0)
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<HistoryNode[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (phase === "loading") {
      const interval = setInterval(() => {
        setLogIndex((i) => (i + 1) % t.loadingLogs.length)
      }, 700)
      return () => clearInterval(interval)
    }
  }, [phase, t.loadingLogs.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && idea.trim() && phase === "idle") {
        handleSubmit()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [idea, phase])

  async function handleSubmit(overrideIdea?: string) {
    const currentIdea = overrideIdea || idea
    if (!currentIdea.trim() || phase !== "idle") return
    
    // Push current state to history if we are pivoting
    if (results && overrideIdea) {
      setHistory(prev => [...prev, { idea: idea, results }])
    }

    setIdea(currentIdea)
    setPhase("loading")
    setError("")
    setLogIndex(0)

    try {
      const res = await fetch("/api/find-doppelganger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: currentIdea, lang }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Analysis failed")
      }

      const data = await res.json()
      
      if (data.easterEgg) {
        setError(data.message)
        setPhase("idle")
        return
      }
      
      await new Promise((r) => setTimeout(r, 600))
      setResults(data)
      setPhase("results")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed")
      setPhase("idle")
    }
  }

  function reset() {
    setPhase("idle")
    setResults(null)
    setIdea("")
    setError("")
    setHistory([])
  }

  function loadHistoryState(index: number) {
    if (index === -1) return // Do nothing if trying to load current state

    // Slice history array
    const newHistory = history.slice(0, index)
    const targetState = history[index]
    
    setHistory(newHistory)
    setIdea(targetState.idea)
    setResults(targetState.results)
    setPhase("results")
  }

  return (
    <div className="min-h-screen bg-[#000] text-[#e5e5e5] overflow-x-hidden selection:bg-[#ff4d00] selection:text-black">
      <InteractiveCanvas />
      <HUDOverlay />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-[#000]/90 backdrop-blur-sm border-b border-[#1a1a1a]">
        <span className="font-mono text-lg md:text-xl lg:text-2xl tracking-[0.25em] font-black text-[#FF4D00] uppercase cursor-pointer" onClick={reset}>
          DOPPELGANGER
        </span>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setLang("en")} 
              className={`font-mono text-[10px] md:text-[12px] px-2 py-1 border transition-colors ${lang === 'en' ? 'border-[#FF4D00] text-[#FF4D00]' : 'border-transparent text-[#666] hover:text-[#e5e5e5]'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang("es")} 
              className={`font-mono text-[10px] md:text-[12px] px-2 py-1 border transition-colors ${lang === 'es' ? 'border-[#FF4D00] text-[#FF4D00]' : 'border-transparent text-[#666] hover:text-[#e5e5e5]'}`}
            >
              ES
            </button>
          </div>
          <span className="hidden md:inline font-mono text-[8px] md:text-[9px] text-[#333] tracking-wider">v3.5_MCP</span>
        </div>
      </header>

      <main className="relative min-h-screen pb-32">
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-20"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-[9px] md:text-[10px] tracking-[0.4em] text-[#666] mb-6 md:mb-8 text-center uppercase"
              >
                {t.subtitle}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center mb-4 md:mb-6 basement-title"
              >
                <span className="block font-sans font-black text-[12vw] md:text-[8vw] lg:text-[7vw] leading-[0.85] tracking-tighter text-[#e5e5e5] uppercase">
                  {t.title1}
                </span>
                <span className="block font-sans font-black text-[12vw] md:text-[8vw] lg:text-[7vw] leading-[0.85] tracking-tighter text-[#FF4D00] uppercase">
                  {t.title2}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-mono text-[12px] md:text-[14px] text-[#888] text-center max-w-lg mb-10 md:mb-12 leading-relaxed px-4"
              >
                {t.desc}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-full max-w-3xl px-4"
              >
                <div className="relative bg-[#050505] border-2 border-[#333] hover:border-[#FF4D00] transition-colors shadow-[0_0_40px_rgba(255,77,0,0.05)] focus-within:shadow-[0_0_40px_rgba(255,77,0,0.2)]">
                  <textarea
                    ref={inputRef}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder={t.placeholder}
                    rows={4}
                    className="w-full bg-transparent px-6 py-5 text-[15px] md:text-[16px] font-mono text-[#e5e5e5] placeholder:text-[#444] resize-none focus:outline-none"
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-4">
                    <span className="hidden sm:block font-mono text-[10px] tracking-widest text-[#444]">{t.ctrlEnter}</span>
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!idea.trim()}
                      className="h-12 px-8 flex items-center justify-center bg-[#FF4D00] text-[#000] font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#fff] transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                        <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2.5" />
                      </svg>
                    </button>
                  </div>
                </div>
                {error && <p className="mt-4 font-mono text-[12px] text-red-500 text-center font-bold">{error}</p>}
              </motion.div>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6"
            >
              <div className="w-full max-w-lg">
                <div className="mb-10">
                  <div className="w-full h-[4px] bg-[#1a1a1a] overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FF4D00]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  </div>
                </div>
                <div className="font-mono text-[12px] md:text-[14px] text-[#666] space-y-3">
                  {t.loadingLogs.slice(0, logIndex + 1).map((log, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i === logIndex ? 1 : 0.4, x: 0 }}
                      className={i === logIndex ? "text-[#FF4D00] font-bold" : ""}
                    >
                      {log}
                      {i === logIndex && <span className="animate-pulse ml-1">█</span>}
                    </motion.p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {phase === "results" && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen px-4 md:px-6 pt-24"
            >
              <div className="max-w-5xl mx-auto space-y-12">

                {/* History Breadcrumbs */}
                {history.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-2 text-sm font-mono bg-[#050505] p-4 border border-[#1a1a1a]">
                    <span className="text-[#666]">{t.history}: </span>
                    {history.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button 
                          onClick={() => loadHistoryState(i)}
                          className="text-[#888] hover:text-[#FF4D00] transition-colors truncate max-w-[150px]"
                          title={h.idea}
                        >
                          {i === 0 ? t.start : `Pivot ${i}`}
                        </button>
                        <span className="text-[#333]">&gt;</span>
                      </div>
                    ))}
                    <span className="text-[#e5e5e5] border-b border-[#FF4D00]">Current</span>
                  </motion.div>
                )}
                
                {/* 1. Market Evaluation */}
                <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                  <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                    <span className="w-8 h-[4px] bg-[#FF4D00]" />
                    {t.marketEval}
                  </h3>
                  <div className="bg-[#050505] border-l-4 border-[#FF4D00] p-6 md:p-8 font-mono text-[13px] md:text-[14px] leading-relaxed text-[#aaa]">
                    {renderMarkdown(results.marketEvaluation)}
                  </div>
                </motion.section>

                {/* 2. Top Matches (Deep Analysis) */}
                <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                  <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                    <span className="w-8 h-[4px] bg-[#FF4D00]" />
                    {t.topMatches}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.topMatches.map((dp, i) => {
                      const statusKey = dp.status.toUpperCase() as keyof typeof statusConfig
                      const config = statusConfig[statusKey] || statusConfig.DEAD
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="bg-[#050505] border-2 border-[#1a1a1a] hover:border-[#FF4D00] p-6 transition-colors flex flex-col"
                        >
                          <div className="flex items-start justify-between mb-6 border-b border-[#1a1a1a] pb-4">
                            <div>
                              <h4 className="font-sans font-black text-2xl md:text-3xl tracking-tight text-[#e5e5e5] mb-2 uppercase">{dp.name}</h4>
                              <span className={`inline-block font-mono text-[10px] md:text-[11px] font-bold tracking-widest border-2 px-3 py-1 ${config.color} ${config.border} ${config.bg}`}>
                                {dp.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-6 flex-1">
                            <div>
                              <p className="font-mono text-[13px] text-[#aaa]">{dp.description}</p>
                            </div>

                            {/* Why They Failed / Frictions */}
                            {dp.whyTheyFailed && dp.whyTheyFailed.length > 0 && (
                              <div className="bg-[#1a0a0a] border border-red-900/30 p-4">
                                <p className="font-mono text-[10px] text-red-400 tracking-widest uppercase mb-3 font-bold flex items-center gap-2">
                                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                                  {t.whyFailed}
                                </p>
                                <ul className="list-disc pl-4 space-y-2">
                                  {dp.whyTheyFailed.map((reason, idx) => (
                                    <li key={idx} className="font-mono text-[12px] text-[#ccc] leading-relaxed">{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* What They Did Right */}
                            {dp.whatTheyDidRight && dp.whatTheyDidRight.length > 0 && (
                              <div className="bg-[#0a1a0a] border border-green-900/30 p-4">
                                <p className="font-mono text-[10px] text-green-400 tracking-widest uppercase mb-3 font-bold flex items-center gap-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                                  {t.whatRight}
                                </p>
                                <ul className="list-disc pl-4 space-y-2">
                                  {dp.whatTheyDidRight.map((win, idx) => (
                                    <li key={idx} className="font-mono text-[12px] text-[#ccc] leading-relaxed">{win}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Unit Economics */}
                            {dp.unitEconomics && (
                              <div>
                                <p className="font-mono text-[9px] text-[#666] tracking-widest uppercase mb-1">{t.unitEcon}</p>
                                <p className="font-mono text-[13px] text-[#aaa] border-l-2 border-[#333] pl-3 py-1">{dp.unitEconomics}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                            <p className="font-mono text-[10px] text-[#FF4D00] tracking-widest uppercase mb-2 font-bold">{t.keyLesson}</p>
                            <p className="font-sans text-[15px] font-medium text-[#e5e5e5] leading-snug">{dp.keyLesson}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.section>

                {/* 3. Radar Alternatives */}
                <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                  <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                    <span className="w-8 h-[4px] bg-[#FF4D00]" />
                    {t.radar}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {results.radarAlternatives.map((alt, i) => (
                      <div key={i} className="bg-[#050505] border border-[#1a1a1a] p-5">
                        <p className="font-sans font-bold text-lg text-[#FF4D00] uppercase tracking-tight mb-2">{alt.name}</p>
                        <p className="font-mono text-[12px] text-[#888] leading-relaxed">{alt.focus}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* 4. The Verdict */}
                <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }}>
                  <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                    <span className="w-8 h-[4px] bg-[#FF4D00]" />
                    {t.verdict}
                  </h3>
                  <div className="border-4 border-[#FF4D00] p-8 md:p-12 relative bg-[#050505] shadow-[0_0_50px_rgba(255,77,0,0.1)]">
                    <motion.h2 
                      className="relative font-sans font-black text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.9] mb-8 text-[#e5e5e5] uppercase"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      {results.verdict.title}
                    </motion.h2>
                    <div className="relative font-mono text-[14px] md:text-[16px] text-[#aaa] max-w-3xl leading-relaxed verdict-content">
                      {renderMarkdown(results.verdict.strategy)}
                    </div>
                  </div>
                </motion.section>

                {/* 5. Pivot Options (Branching) */}
                {results.pivotOptions && results.pivotOptions.length > 0 && (
                  <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.9 }}>
                    <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                      <span className="w-8 h-[4px] bg-[#FF4D00]" />
                      {t.pivotTree}
                    </h3>
                    <div className="flex flex-col gap-4">
                      {results.pivotOptions.map((pivot, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            const newIdea = `Idea original: ${idea}\n\nPivote Seleccionado: ${pivot.title} - ${pivot.description}`
                            handleSubmit(newIdea)
                          }}
                          className="group relative bg-[#050505] border-2 border-[#1a1a1a] hover:border-[#FF4D00] p-6 text-left transition-all hover:pl-8 overflow-hidden"
                        >
                          <div className="absolute inset-y-0 left-0 w-2 bg-[#FF4D00] transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                          <h4 className="font-sans font-black text-xl md:text-2xl text-[#e5e5e5] mb-2 uppercase tracking-tight group-hover:text-[#FF4D00] transition-colors">{pivot.title}</h4>
                          <p className="font-mono text-[13px] text-[#888] leading-relaxed">{pivot.description}</p>
                        </button>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* 6. Sources */}
                {results.sources && results.sources.length > 0 && (
                  <motion.section variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 1.1 }}>
                     <h3 className="font-mono text-[11px] tracking-widest text-[#666] mb-4 uppercase">
                      {t.sources}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {results.sources.map((src, i) => (
                        <a 
                          key={i} 
                          href={src.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#FF4D00] hover:text-black text-[#888] font-mono text-[10px] transition-colors"
                        >
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3H3v10h10v-3M9 3h4v4M14 2L7 9"/></svg>
                          <span className="truncate max-w-[200px]">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 pb-24 border-t border-[#1a1a1a] mt-12"
                >
                  <button
                    onClick={reset}
                    className="w-full sm:w-auto font-mono text-[11px] font-bold tracking-[0.2em] border-2 border-[#333] px-10 py-4 hover:border-[#FF4D00] hover:text-[#FF4D00] transition-all uppercase"
                  >
                    {t.newSearch}
                  </button>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
