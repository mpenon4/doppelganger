"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { InteractiveCanvas } from "@/components/interactive-canvas"
import { HUDOverlay } from "@/components/hud-overlay"

// Updated Types for v4.1 API
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

interface IterationNode {
  id: number
  idea: string
  results: Results
  isExpanded: boolean
}

interface FinalReport {
  companyName: string
  companySummary: string
  executiveSummary: string
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  attackPlan: { phase: string, action: string }[]
  finalAdvice: string
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
    title1: "MAP YOUR MARKET.",
    title2: "EVOLVE YOUR IDEA.",
    desc: "Doppelganger is your AI market intelligence analyst. Discover real competitors, uncover friction points, and iteratively pivot to find the perfect Go-to-Market strategy.",
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
      "> Initializing DOPPELGANGER v4.1...",
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
    start: "ORIGINAL IDEA",
    iterating: "ITERATING...",
    customPivotPlaceholder: "Or write your own custom pivot (e.g. 'Use AI for...')...",
    iterateBtn: "ITERATE",
    keepThisIdea: "I'LL KEEP THIS IDEA (GENERATE REPORT)",
    generatingReport: "Generating final report...",
    exportPdf: "EXPORT TO PDF",
    printAll: "PRINT ALL",
    printSwot: "PRINT SWOT ONLY",
    printGtm: "PRINT GTM ONLY",
    closeReport: "CLOSE",
    reportTitle: "DOPPELGANGER EXECUTIVE REPORT",
    swotAnalysis: "SWOT ANALYSIS",
    attackPlan: "SUGGESTED GO-TO-MARKET",
    finalAdvice: "FINAL VERDICT",
    strengths: "STRENGTHS",
    weaknesses: "WEAKNESSES",
    opportunities: "OPPORTUNITIES",
    threats: "THREATS",
    reportContextLabel: "TENTATIVE NAME OR EXTRA CONTEXT (OPTIONAL)",
    reportContextPlaceholder: "Write a tentative name or more details on how you plan to execute this..."
  },
  es: {
    subtitle: "LA INTELIGENCIA PARA CONSTRUIR EL FUTURO",
    title1: "MAPEA TU MERCADO.",
    title2: "EVOLUCIONA TU IDEA.",
    desc: "Doppelganger es tu analista de inteligencia de mercado. Descubre a tus competidores reales, detecta fricciones en la industria, y pivota iterativamente para encontrar la estrategia perfecta.",
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
      "> Inicializando DOPPELGANGER v4.1...",
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
    start: "IDEA ORIGINAL",
    iterating: "ITERANDO...",
    customPivotPlaceholder: "O escribe tu propio pivote (ej: 'Usar cripto para...')...",
    iterateBtn: "ITERAR",
    keepThisIdea: "ME QUEDO CON ESTA IDEA (GENERAR REPORTE)",
    generatingReport: "Generando reporte final...",
    exportPdf: "EXPORTAR A PDF",
    printAll: "IMPRIMIR COMPLETO",
    printSwot: "IMPRIMIR SOLO FODA",
    printGtm: "IMPRIMIR SOLO GTM",
    closeReport: "CERRAR",
    reportTitle: "REPORTE EJECUTIVO DOPPELGANGER",
    swotAnalysis: "ANÁLISIS FODA",
    attackPlan: "GO-TO-MARKET SUGERIDO",
    finalAdvice: "VEREDICTO FINAL",
    strengths: "FORTALEZAS",
    weaknesses: "DEBILIDADES",
    opportunities: "OPORTUNIDADES",
    threats: "AMENAZAS",
    reportContextLabel: "NOMBRE TENTATIVO O CONTEXTO EXTRA (OPCIONAL)",
    reportContextPlaceholder: "Escribe un nombre tentativo o más detalles sobre cómo planeas ejecutar esto..."
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
  const [iterations, setIterations] = useState<IterationNode[]>([])
  const [error, setError] = useState("")
  const [customPivot, setCustomPivot] = useState("")
  const [reportContext, setReportContext] = useState("")
  
  // Report State
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportData, setReportData] = useState<FinalReport | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [printMode, setPrintMode] = useState<"all" | "swot" | "gtm">("all")

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

  async function handleSubmit(overrideIdea?: string, pivotDisplayTitle?: string) {
    const currentIdea = overrideIdea || idea
    if (!currentIdea.trim() || phase === "loading") return
    
    setIterations(prev => prev.map(it => ({ ...it, isExpanded: false })))
    setPhase("loading")
    setError("")
    setLogIndex(0)
    setCustomPivot("")

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
      
      const displayIdea = pivotDisplayTitle || currentIdea

      setIterations(prev => [
        ...prev,
        {
          id: prev.length,
          idea: displayIdea,
          results: data,
          isExpanded: true
        }
      ])
      
      setPhase("results")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed")
      setPhase(iterations.length > 0 ? "results" : "idle")
    }
  }

  function handleCustomPivot() {
    if (!customPivot.trim()) return
    const baseIdea = iterations[0]?.idea || idea
    const newIdea = `Idea Original: ${baseIdea}\n\nPivote Seleccionado por el usuario: ${customPivot}`
    handleSubmit(newIdea, `Pivote Manual: ${customPivot}`)
  }

  async function generateFinalReport(iterationIdea: string) {
    setIsGeneratingReport(true)
    setError("")
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: iterationIdea, lang, context: reportContext }),
      })

      if (!res.ok) {
        throw new Error("Failed to generate report")
      }

      const data = await res.json()
      setReportData(data)
      setShowReportModal(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Report generation failed")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  function toggleIteration(id: number) {
    setIterations(prev => prev.map(it => 
      it.id === id ? { ...it, isExpanded: !it.isExpanded } : it
    ))
  }

  function reset() {
    setPhase("idle")
    setIterations([])
    setIdea("")
    setError("")
    setCustomPivot("")
    setReportContext("")
    setReportData(null)
    setShowReportModal(false)
    setPrintMode("all")
  }

  return (
    <div className="min-h-screen bg-[#000] text-[#e5e5e5] overflow-x-hidden selection:bg-[#ff4d00] selection:text-black print:bg-white print:text-black">
      
      {/* Hide UI on print */}
      <div className="print:hidden">
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
            <span className="hidden md:inline font-mono text-[8px] md:text-[9px] text-[#333] tracking-wider">v4.1_DEEP_MCP</span>
          </div>
        </header>

        <main className="relative min-h-screen pb-32">
          <AnimatePresence mode="wait">
            {phase === "idle" && iterations.length === 0 && (
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

            {phase === "loading" && iterations.length === 0 && (
              <motion.div
                key="loading-initial"
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

            {iterations.length > 0 && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen px-4 md:px-6 pt-24 max-w-5xl mx-auto flex flex-col gap-8"
              >
                {iterations.map((iteration) => (
                  <div key={iteration.id} className="relative">
                    {/* Connective Line between nodes */}
                    {iteration.id > 0 && (
                      <div className="absolute -top-8 left-6 w-[2px] h-8 bg-[#FF4D00]/30" />
                    )}

                    {/* Accordion Header */}
                    <button 
                      onClick={() => toggleIteration(iteration.id)}
                      className={`w-full flex items-center justify-between p-4 md:p-6 border-2 transition-all ${iteration.isExpanded ? 'bg-[#050505] border-[#FF4D00]' : 'bg-[#000] border-[#1a1a1a] hover:border-[#333]'}`}
                    >
                      <div className="flex items-center gap-4 text-left overflow-hidden">
                        <span className="font-sans text-xl md:text-3xl font-black text-[#FF4D00] shrink-0">
                          v{iteration.id}
                        </span>
                        <span className={`font-mono text-[12px] md:text-[14px] truncate ${iteration.isExpanded ? 'text-[#e5e5e5]' : 'text-[#666]'}`}>
                          {iteration.idea}
                        </span>
                      </div>
                      <span className="shrink-0 ml-4 font-mono text-[10px] text-[#666]">
                        {iteration.isExpanded ? '[-]' : '[+]'}
                      </span>
                    </button>

                    {/* Accordion Content */}
                    <AnimatePresence>
                      {iteration.isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-8 md:pt-12 pb-4 space-y-12">
                            
                            {/* 1. Market Evaluation */}
                            <section>
                              <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                                <span className="w-8 h-[4px] bg-[#FF4D00]" />
                                {t.marketEval}
                              </h3>
                              <div className="bg-[#050505] border-l-4 border-[#FF4D00] p-6 md:p-8 font-mono text-[13px] md:text-[14px] leading-relaxed text-[#aaa]">
                                {renderMarkdown(iteration.results.marketEvaluation)}
                              </div>
                            </section>

                            {/* 2. Top Matches */}
                            <section>
                              <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                                <span className="w-8 h-[4px] bg-[#FF4D00]" />
                                {t.topMatches}
                              </h3>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {iteration.results.topMatches.map((dp, i) => {
                                  const statusKey = dp.status.toUpperCase() as keyof typeof statusConfig
                                  const config = statusConfig[statusKey] || statusConfig.DEAD
                                  return (
                                    <div key={i} className="bg-[#050505] border-2 border-[#1a1a1a] hover:border-[#FF4D00] p-6 transition-colors flex flex-col">
                                      <div className="flex items-start justify-between mb-6 border-b border-[#1a1a1a] pb-4">
                                        <div>
                                          <h4 className="font-sans font-black text-2xl md:text-3xl tracking-tight text-[#e5e5e5] mb-2 uppercase break-words">{dp.name}</h4>
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
                                                <li key={idx} className="font-mono text-[12px] text-[#ccc] leading-relaxed break-words">{reason}</li>
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
                                                <li key={idx} className="font-mono text-[12px] text-[#ccc] leading-relaxed break-words">{win}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {/* Unit Economics */}
                                        {dp.unitEconomics && (
                                          <div>
                                            <p className="font-mono text-[9px] text-[#666] tracking-widest uppercase mb-1">{t.unitEcon}</p>
                                            <p className="font-mono text-[13px] text-[#aaa] border-l-2 border-[#333] pl-3 py-1 break-words">{dp.unitEconomics}</p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                                        <p className="font-mono text-[10px] text-[#FF4D00] tracking-widest uppercase mb-2 font-bold">{t.keyLesson}</p>
                                        <p className="font-sans text-[14px] md:text-[15px] font-medium text-[#e5e5e5] leading-snug break-words">{dp.keyLesson}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </section>

                            {/* 3. Radar Alternatives */}
                            {iteration.results.radarAlternatives && iteration.results.radarAlternatives.length > 0 && (
                              <section>
                                <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                                  <span className="w-8 h-[4px] bg-[#FF4D00]" />
                                  {t.radar}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                  {iteration.results.radarAlternatives.map((alt, i) => (
                                    <div key={i} className="bg-[#050505] border border-[#1a1a1a] p-5">
                                      <p className="font-sans font-bold text-lg text-[#FF4D00] uppercase tracking-tight mb-2 break-words">{alt.name}</p>
                                      <p className="font-mono text-[12px] text-[#888] leading-relaxed break-words">{alt.focus}</p>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}

                            {/* 4. The Verdict */}
                            <section>
                              <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                                <span className="w-8 h-[4px] bg-[#FF4D00]" />
                                {t.verdict}
                              </h3>
                              <div className="border-4 border-[#FF4D00] p-6 md:p-12 relative bg-[#050505] shadow-[0_0_50px_rgba(255,77,0,0.1)]">
                                <h2 className="relative font-sans font-black text-3xl md:text-5xl lg:text-7xl tracking-tighter leading-[0.9] mb-8 text-[#e5e5e5] uppercase break-words">
                                  {iteration.results.verdict.title}
                                </h2>
                                <div className="relative font-mono text-[14px] md:text-[16px] text-[#aaa] max-w-3xl leading-relaxed verdict-content">
                                  {renderMarkdown(iteration.results.verdict.strategy)}
                                </div>
                              </div>
                            </section>

                            {/* 5. Pivot Options (Branching) & Custom Pivot */}
                            <section>
                              <h3 className="font-sans text-xl md:text-2xl font-black tracking-tighter text-[#e5e5e5] mb-6 flex items-center gap-4 uppercase">
                                <span className="w-8 h-[4px] bg-[#FF4D00]" />
                                {t.pivotTree}
                              </h3>
                              
                              <div className="flex flex-col gap-4">
                                {iteration.results.pivotOptions?.map((pivot, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      const baseIdea = iterations[0]?.idea || idea
                                      const newIdea = `Idea Original: ${baseIdea}\n\nPivote Seleccionado: ${pivot.title} - ${pivot.description}`
                                      handleSubmit(newIdea, pivot.title)
                                    }}
                                    className="group relative bg-[#050505] border-2 border-[#1a1a1a] hover:border-[#FF4D00] p-5 md:p-6 text-left transition-all hover:pl-6 md:hover:pl-8 overflow-hidden flex flex-col items-start w-full"
                                  >
                                    <div className="absolute inset-y-0 left-0 w-2 bg-[#FF4D00] transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                                    <h4 className="font-sans font-black text-xl md:text-2xl text-[#e5e5e5] mb-2 uppercase tracking-tight group-hover:text-[#FF4D00] transition-colors break-words w-full">{pivot.title}</h4>
                                    <p className="font-mono text-[12px] md:text-[13px] text-[#888] leading-relaxed break-words w-full">{pivot.description}</p>
                                  </button>
                                ))}
                                
                                {/* Custom Pivot Input */}
                                <div className="mt-4 p-5 md:p-6 bg-[#0a0a0a] border-2 border-dashed border-[#333] hover:border-[#FF4D00] transition-colors">
                                  <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <input
                                      type="text"
                                      value={customPivot}
                                      onChange={(e) => setCustomPivot(e.target.value)}
                                      placeholder={t.customPivotPlaceholder}
                                      className="flex-1 w-full bg-transparent border-b border-[#333] focus:border-[#FF4D00] outline-none text-[#e5e5e5] font-mono text-[14px] pb-2 px-2"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleCustomPivot()
                                      }}
                                    />
                                    <button 
                                      onClick={handleCustomPivot}
                                      disabled={!customPivot.trim()}
                                      className="w-full md:w-auto px-6 py-2 bg-[#1a1a1a] hover:bg-[#FF4D00] hover:text-black font-bold tracking-widest font-mono text-[12px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                                    >
                                      {t.iterateBtn}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </section>

                            {/* 6. Sources */}
                            {iteration.results.sources && iteration.results.sources.length > 0 && (
                              <section>
                                 <h3 className="font-mono text-[11px] tracking-widest text-[#666] mb-4 uppercase">
                                  {t.sources}
                                </h3>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                  {iteration.results.sources.map((src, i) => (
                                    <a 
                                      key={i} 
                                      href={src.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#FF4D00] hover:text-black text-[#888] font-mono text-[9px] md:text-[10px] transition-colors max-w-full"
                                    >
                                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M6 3H3v10h10v-3M9 3h4v4M14 2L7 9"/></svg>
                                      <span className="truncate max-w-[150px] md:max-w-[200px]">{src.title}</span>
                                    </a>
                                  ))}
                                </div>
                              </section>
                            )}

                            {/* EXPORT ACTION */}
                            <div className="pt-8 border-t border-[#1a1a1a] mt-8 flex flex-col gap-4">
                              <label className="font-mono text-[11px] tracking-widest text-[#666] uppercase">
                                {t.reportContextLabel}
                              </label>
                              <textarea
                                value={reportContext}
                                onChange={(e) => setReportContext(e.target.value)}
                                placeholder={t.reportContextPlaceholder}
                                className="w-full bg-[#050505] border-2 border-[#1a1a1a] focus:border-[#FF4D00] p-4 text-[#e5e5e5] font-mono text-[13px] resize-none outline-none transition-colors"
                                rows={2}
                              />
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => generateFinalReport(iteration.idea)}
                                  disabled={isGeneratingReport}
                                  className="bg-[#FF4D00] text-black font-black font-sans text-lg md:text-xl px-8 py-4 hover:bg-white transition-colors uppercase shadow-[0_0_20px_rgba(255,77,0,0.4)] flex items-center gap-3 disabled:opacity-50 disabled:animate-pulse"
                                >
                                  {isGeneratingReport ? t.generatingReport : t.keepThisIdea}
                                </button>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Loading state when fetching a new iteration from a pivot */}
                {phase === "loading" && iterations.length > 0 && (
                  <div className="relative pt-8">
                    <div className="absolute -top-8 left-6 w-[2px] h-8 bg-[#FF4D00]/30 animate-pulse" />
                    <div className="w-full flex items-center p-4 md:p-6 border-2 border-[#1a1a1a] bg-[#000] border-dashed">
                      <span className="font-sans text-xl md:text-3xl font-black text-[#666] shrink-0 mr-4">
                        v{iterations.length}
                      </span>
                      <span className="font-mono text-[12px] md:text-[14px] text-[#FF4D00] animate-pulse">
                        {t.iterating}
                      </span>
                    </div>
                  </div>
                )}

                {/* End Action (Reset) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center pt-12 pb-24 border-t border-[#1a1a1a] mt-4"
                >
                  <button
                    onClick={reset}
                    className="w-full sm:w-auto font-mono text-[11px] font-bold tracking-[0.2em] border-2 border-[#333] px-10 py-4 hover:border-[#FF4D00] hover:text-[#FF4D00] transition-all uppercase"
                  >
                    {t.newSearch}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* --- REPORT EXPORT MODAL --- */}
      <AnimatePresence>
        {showReportModal && reportData && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] bg-white text-black overflow-y-auto print:static print:inset-auto print:h-auto print:overflow-visible print:bg-white"
          >
            {/* Modal Actions (Hidden on Print) */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center z-10 print:hidden shadow-sm">
              <button 
                onClick={() => setShowReportModal(false)}
                className="font-mono text-sm px-4 py-2 border border-gray-300 hover:bg-gray-100 font-bold"
              >
                {t.closeReport}
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setPrintMode("all"); setTimeout(() => window.print(), 100); }}
                  className="font-mono text-sm px-4 py-2 bg-[#FF4D00] text-black font-bold hover:bg-black hover:text-white transition-colors border border-transparent"
                >
                  {t.printAll}
                </button>
                <button 
                  onClick={() => { setPrintMode("swot"); setTimeout(() => window.print(), 100); }}
                  className="font-mono text-sm px-4 py-2 bg-black text-white font-bold hover:bg-[#FF4D00] hover:text-black transition-colors"
                >
                  {t.printSwot}
                </button>
                <button 
                  onClick={() => { setPrintMode("gtm"); setTimeout(() => window.print(), 100); }}
                  className="font-mono text-sm px-4 py-2 bg-black text-white font-bold hover:bg-[#FF4D00] hover:text-black transition-colors"
                >
                  {t.printGtm}
                </button>
              </div>
            </div>

            {/* Print Document Content */}
            <div className="max-w-4xl mx-auto p-8 md:p-16 font-sans">
              
              <div className="border-b-4 border-black pb-8 mb-8 break-inside-avoid">
                <div className="mb-4">
                  <span className="font-mono text-xs md:text-sm font-bold tracking-widest uppercase bg-[#FF4D00] text-black px-3 py-1">
                    {lang === 'es' ? 'Generado por Doppelganger' : 'Generated by Doppelganger'}
                  </span>
                </div>
                <h1 className="font-black text-4xl md:text-6xl uppercase tracking-tighter mb-4">
                  {lang === 'es' ? 'INFORME FINAL DE' : 'FINAL REPORT FOR'} <span className="text-[#FF4D00]">{reportData.companyName}</span>
                </h1>
                {reportData.companySummary && (
                  <p className="text-lg md:text-xl text-gray-700 font-mono mb-6 border-l-4 border-gray-300 pl-4 py-2">
                    {reportData.companySummary}
                  </p>
                )}
                <div className="flex justify-between items-end font-mono text-gray-500 text-sm">
                  <span>GENERATED: {new Date().toLocaleDateString()}</span>
                  <span>v4.1_DEEP_MCP</span>
                </div>
              </div>

              <div className="mb-12 break-inside-avoid">
                <p className="text-xl md:text-2xl leading-relaxed font-medium">{reportData.executiveSummary}</p>
              </div>

              {/* SWOT */}
              <div className={`mb-16 print:break-inside-avoid print:mb-8 ${printMode === 'gtm' ? 'print:hidden' : ''}`}>
                <h2 className="text-3xl font-black uppercase mb-6 border-b-2 border-black pb-2 break-after-avoid print:mb-4">{t.swotAnalysis}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4 print:grid-cols-2">
                  {/* Strengths */}
                  <div className="bg-gray-50 p-6 print:p-4 border-l-4 border-green-500 break-inside-avoid h-full shadow-sm border border-gray-100">
                    <h3 className="font-black text-xl uppercase mb-4 print:mb-2 text-green-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 text-green-700 flex items-center justify-center rounded-full text-sm font-bold print:w-5 print:h-5 print:text-xs">S</span>
                      {t.strengths}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 print:space-y-1 print:text-sm text-gray-800">
                      {reportData.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  {/* Weaknesses */}
                  <div className="bg-gray-50 p-6 print:p-4 border-l-4 border-orange-500 break-inside-avoid h-full shadow-sm border border-gray-100">
                    <h3 className="font-black text-xl uppercase mb-4 print:mb-2 text-orange-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-700 flex items-center justify-center rounded-full text-sm font-bold print:w-5 print:h-5 print:text-xs">W</span>
                      {t.weaknesses}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 print:space-y-1 print:text-sm text-gray-800">
                      {reportData.swot.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  {/* Opportunities */}
                  <div className="bg-gray-50 p-6 print:p-4 border-l-4 border-blue-500 break-inside-avoid h-full shadow-sm border border-gray-100">
                    <h3 className="font-black text-xl uppercase mb-4 print:mb-2 text-blue-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full text-sm font-bold print:w-5 print:h-5 print:text-xs">O</span>
                      {t.opportunities}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 print:space-y-1 print:text-sm text-gray-800">
                      {reportData.swot.opportunities.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  {/* Threats */}
                  <div className="bg-gray-50 p-6 print:p-4 border-l-4 border-red-500 break-inside-avoid h-full shadow-sm border border-gray-100">
                    <h3 className="font-black text-xl uppercase mb-4 print:mb-2 text-red-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-100 text-red-700 flex items-center justify-center rounded-full text-sm font-bold print:w-5 print:h-5 print:text-xs">T</span>
                      {t.threats}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 print:space-y-1 print:text-sm text-gray-800">
                      {reportData.swot.threats.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Attack Plan */}
              <div className={`mb-16 ${printMode === 'swot' ? 'print:hidden' : ''}`}>
                <h2 className="text-3xl font-black uppercase mb-6 border-b-2 border-black pb-2 break-after-avoid">{t.attackPlan}</h2>
                <div className="space-y-6">
                  {reportData.attackPlan.map((step, i) => (
                    <div key={i} className="flex gap-6 items-start break-inside-avoid">
                      <div className="text-4xl font-black text-gray-300">0{i + 1}</div>
                      <div>
                        <h3 className="text-xl font-bold uppercase mb-2">{step.phase}</h3>
                        <p className="text-gray-700 text-lg">{step.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Advice */}
              <div className="bg-black text-white p-8 md:p-12 break-inside-avoid print:border-4 print:border-black print:text-black print:bg-white print:break-inside-avoid">
                <h2 className="text-2xl font-black uppercase mb-4 text-[#FF4D00] print:text-black">{t.finalAdvice}</h2>
                <p className="text-xl md:text-2xl leading-relaxed italic">{reportData.finalAdvice}</p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
