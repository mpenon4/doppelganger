"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LogEntry {
  id: string
  timestamp: string
  type: "system" | "mcp" | "query" | "result" | "error"
  message: string
  source?: string
}

interface SystemLogProps {
  isActive: boolean
  phase: "idle" | "loading" | "results"
  lang?: "en" | "es"
  onClose?: () => void
}

export function SystemLog({ isActive, phase, lang = "en", onClose }: SystemLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const logIndexRef = useRef(0)

  const mcpLogs = lang === 'es' ? [
    { type: "system", message: "DOPPELGANGER v3.0 inicializado" },
    { type: "system", message: "Estableciendo conexión segura..." },
    { type: "mcp", message: "> Iniciando Handshake MCP", source: "tavily-mcp" },
    { type: "mcp", message: "> Protocolo: SSE HTTP" },
    { type: "query", message: "> Consultando Índice Web Tavily...", source: "tavily-search" },
    { type: "query", message: "> Escaneando bases de datos de startups..." },
    { type: "query", message: "> Analizando post-mortems..." },
    { type: "result", message: "> Patrones de fracaso cruzados" },
    { type: "result", message: "> Vectores de mercado computados" },
    { type: "mcp", message: "> Inyectando contexto a LLM", source: "groq-llama-3.3" },
    { type: "result", message: "> Generando matriz de diferenciación" },
    { type: "system", message: "> Compilando veredicto final..." },
  ] as Omit<LogEntry, "id" | "timestamp">[] : [
    { type: "system", message: "DOPPELGANGER v3.0 initialized" },
    { type: "system", message: "Establishing secure connection..." },
    { type: "mcp", message: "> Initiating MCP Handshake", source: "tavily-mcp" },
    { type: "mcp", message: "> Protocol: SSE HTTP" },
    { type: "query", message: "> Querying Tavily Web Index...", source: "tavily-search" },
    { type: "query", message: "> Scanning startup databases..." },
    { type: "query", message: "> Analyzing post-mortems..." },
    { type: "result", message: "> Cross-referencing failure patterns" },
    { type: "result", message: "> Computing market vectors" },
    { type: "mcp", message: "> Injecting context to LLM", source: "groq-llama-3.3" },
    { type: "result", message: "> Generating differentiation matrix" },
    { type: "system", message: "> Compiling final verdict..." },
  ] as Omit<LogEntry, "id" | "timestamp">[]

  useEffect(() => {
    const idleLogs = lang === 'es' ? [
      { type: "system", message: "Sistema listo" },
      { type: "system", message: "Esperando input..." },
    ] : [
      { type: "system", message: "System ready" },
      { type: "system", message: "Awaiting input..." },
    ]
    const initialLogs = idleLogs.map((log, i) => ({
      ...log,
      id: `idle-${i}`,
      timestamp: formatTime(new Date()),
    })) as LogEntry[]
    setLogs(initialLogs)
  }, [lang])

  useEffect(() => {
    if (phase === "loading") {
      logIndexRef.current = 0
      setLogs([{
        id: "start",
        timestamp: formatTime(new Date()),
        type: "system",
        message: lang === "es" ? "Análisis iniciado" : "Analysis initiated"
      }])

      const interval = setInterval(() => {
        if (logIndexRef.current < mcpLogs.length) {
          const newLog = {
            ...mcpLogs[logIndexRef.current],
            id: `log-${logIndexRef.current}`,
            timestamp: formatTime(new Date()),
          }
          setLogs(prev => [...prev, newLog])
          logIndexRef.current++
        }
      }, 400)

      return () => clearInterval(interval)
    }

    if (phase === "results") {
      setLogs(prev => [...prev, {
        id: "complete",
        timestamp: formatTime(new Date()),
        type: "result",
        message: lang === "es" ? "> Análisis completo. Mostrando resultados." : "> Analysis complete. Displaying results."
      }])
    }
  }, [phase, lang])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  function formatTime(date: Date) {
    return date.toTimeString().slice(0, 8)
  }

  const typeColors = {
    system: "text-[#666]",
    mcp: "text-[#00d4ff]",
    query: "text-[#FF4D00]",
    result: "text-green-400",
    error: "text-red-500",
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed top-20 right-4 z-40 font-mono text-[9px] tracking-wider bg-[#050505] border border-[#FF4D00]/30 px-3 py-1.5 text-[#FF4D00] hover:border-[#FF4D00] transition-colors flex items-center gap-2 uppercase"
      >
        <span className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-pulse" />
        TELEMETRY
        <span className="text-[#666]">({logs.length})</span>
      </button>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block fixed top-20 right-4 bottom-4 w-80 z-40"
      >
        <div className="h-full bg-[#050505] border border-[#1a1a1a] flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${phase === "loading" ? "bg-[#FF4D00] animate-pulse" : "bg-green-400"}`} />
              <span className="font-mono text-[10px] tracking-[0.15em] text-[#666]">SYSTEM LOG</span>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="font-mono text-[9px] text-[#444] hover:text-[#FF4D00] transition-colors uppercase"
            >
              [{lang === 'es' ? 'MINIMIZAR' : 'MINIMIZE'}]
            </button>
          </div>

          <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin"
          >
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 font-mono text-[10px] leading-relaxed"
                >
                  <span className="text-[#333] shrink-0">{log.timestamp}</span>
                  <span className={typeColors[log.type]}>
                    {log.message}
                    {log.source && (
                      <span className="ml-1 text-[#444]">[{log.source}]</span>
                    )}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {phase === "loading" && (
              <span className="inline-block font-mono text-[10px] text-[#FF4D00] animate-pulse">_</span>
            )}
          </div>

          <div className="px-4 py-2 border-t border-[#1a1a1a] flex items-center justify-between">
            <span className="font-mono text-[8px] text-[#333] uppercase">
              TAVILY MCP ACTIVE
            </span>
            <span className="font-mono text-[8px] text-[#444] uppercase">
              {logs.length} {lang === 'es' ? 'ENTRADAS' : 'ENTRIES'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(false)}
          className="fixed top-20 right-4 z-40 font-mono text-[9px] tracking-wider bg-[#0a0a0a] border border-[#FF4D00]/30 px-3 py-1.5 text-[#FF4D00] hover:border-[#FF4D00] transition-colors flex items-center gap-2 uppercase"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${phase === "loading" ? "bg-[#FF4D00] animate-pulse" : "bg-green-400"}`} />
          TELEMETRY
          <span className="text-[#666]">({logs.length})</span>
        </button>
      </div>
    </>
  )
}
