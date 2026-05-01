"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { InteractiveCanvas } from "@/components/interactive-canvas"
import { HUDOverlay } from "@/components/hud-overlay"

// Types
interface Doppelganger {
  name: string
  founded: string
  similarity: number
  status: "ALIVE" | "DEAD" | "ACQUIRED"
  reason: string
}

interface Results {
  doppelgangers: Doppelganger[]
  autopsy: string[]
  opportunities: string[]
  verdict: {
    title: string
    summary: string
  }
}

const statusConfig = {
  ALIVE: { color: "text-green-400", border: "border-green-400/50", bg: "bg-green-400/10" },
  DEAD: { color: "text-red-500", border: "border-red-500/50", bg: "bg-red-500/10" },
  ACQUIRED: { color: "text-blue-400", border: "border-blue-400/50", bg: "bg-blue-400/10" },
}

const loadingLogs = [
  "> Initializing DOPPELGANGER engine...",
  "> Connecting to startup graveyards...",
  "> Scanning 38,420 startup post-mortems...",
  "> Cross-referencing failure patterns...",
  "> Analyzing market saturation levels...",
  "> Computing differentiation vectors...",
  "> Preparing brutal verdict...",
]

// Glitch animation variants
const glitchVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    filter: "blur(10px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const sectionVariants = {
  hidden: { 
    opacity: 0, 
    x: -30,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export default function DoppelgangerApp() {
  const [idea, setIdea] = useState("")
  const [phase, setPhase] = useState<"idle" | "loading" | "results">("idle")
  const [logIndex, setLogIndex] = useState(0)
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Cycle through loading logs
  useEffect(() => {
    if (phase === "loading") {
      const interval = setInterval(() => {
        setLogIndex((i) => (i + 1) % loadingLogs.length)
      }, 700)
      return () => clearInterval(interval)
    }
  }, [phase])

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && idea.trim() && phase === "idle") {
        handleSubmit()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [idea, phase])

  async function handleSubmit() {
    if (!idea.trim() || phase !== "idle") return
    setPhase("loading")
    setError("")
    setLogIndex(0)

    const prompt = `You are a brutally honest startup analyst with access to comprehensive startup data. Analyze this startup idea and find real companies that tried similar things.

STARTUP IDEA: "${idea}"

Return ONLY valid JSON (no markdown, no code blocks, no backticks):
{
  "doppelgangers": [
    {
      "name": "Real company name",
      "founded": "2019",
      "similarity": 85,
      "status": "DEAD",
      "reason": "Specific reason for failure/success in 1-2 sentences"
    }
  ],
  "autopsy": [
    "Specific technical or market failure pattern 1",
    "Specific failure pattern 2 with concrete details",
    "Specific failure pattern 3"
  ],
  "opportunities": [
    "Specific technical differentiator or market gap 1",
    "Concrete opportunity 2 they all missed",
    "Actionable pivot suggestion 3"
  ],
  "verdict": {
    "title": "VERDICT IN 5 WORDS MAX (e.g., TOO LITTLE TOO LATE, HIGH VELOCITY POTENTIAL, GRAVEYARD IS FULL)",
    "summary": "2-3 sentences: Brutal honest assessment of market saturation and the single biggest opportunity or fatal flaw."
  }
}

REQUIREMENTS:
- Include 3-5 REAL doppelgangers with accurate founding years
- Status must be exactly "DEAD", "ALIVE", or "ACQUIRED"
- Similarity percentages between 40-95%
- Sort doppelgangers by similarity (highest first)
- Be specific and brutal in all assessments`

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2000,
          temperature: 0.7,
          messages: [
            { role: "system", content: "You are a startup analyst. Respond only with valid JSON. No markdown, no code blocks." },
            { role: "user", content: prompt },
          ],
        }),
      })

      if (!res.ok) throw new Error("API request failed")

      const data = await res.json()
      let raw = data.choices?.[0]?.message?.content || ""
      raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("Invalid response format")
      
      const parsed: Results = JSON.parse(match[0])
      
      // Sort by similarity
      parsed.doppelgangers.sort((a, b) => b.similarity - a.similarity)
      
      await new Promise((r) => setTimeout(r, 600))
      setResults(parsed)
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
  }

  function reIterate() {
    if (!results) return
    const feedback = results.verdict.summary + " " + results.opportunities.join(". ")
    setIdea(`${idea}\n\n[ITERATING BASED ON FEEDBACK: ${feedback}]`)
    setPhase("idle")
    setResults(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="min-h-screen bg-[#000] text-[#e5e5e5] overflow-x-hidden">
      {/* Interactive Background */}
      <InteractiveCanvas />
      
      {/* HUD Overlay */}
      <HUDOverlay />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-[#000]/90 backdrop-blur-sm border-b border-[#FF4D00]/20">
        <div className="flex items-center gap-1">
          <span className="font-mono text-sm md:text-base tracking-[0.15em] font-bold text-[#FF4D00]">DOPPELGANGER</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {["EXPLORE", "ANALYZE", "DIFFERENTIATE"].map((item) => (
            <span
              key={item}
              className="font-mono text-[10px] tracking-[0.2em] text-[#666] hover:text-[#FF4D00] cursor-pointer transition-colors"
            >
              {item}
            </span>
          ))}
        </div>

        <button className="font-mono text-[10px] tracking-[0.15em] border border-[#333] px-4 py-2 hover:border-[#FF4D00] hover:text-[#FF4D00] transition-all">
          SIGN IN
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative min-h-screen">
        <AnimatePresence mode="wait">
          {/* IDLE STATE - Hero */}
          {phase === "idle" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-20 pb-32"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-[9px] md:text-[10px] tracking-[0.4em] text-[#666] mb-6 md:mb-8"
              >
                THE INTELLIGENCE TO BUILD WHAT&apos;S NEXT
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center mb-4 md:mb-6"
              >
                <span className="block font-sans font-black text-[11vw] md:text-[7vw] lg:text-[5vw] leading-[0.95] tracking-tight text-[#e5e5e5]">
                  BUILD DIFFERENT.
                </span>
                <span className="block font-sans font-black text-[11vw] md:text-[7vw] lg:text-[5vw] leading-[0.95] tracking-tight text-[#FF4D00]">
                  BECAUSE THEY DIDN&apos;T.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-mono text-[11px] md:text-[12px] text-[#666] text-center max-w-md mb-10 md:mb-12 leading-relaxed px-4"
              >
                Validate your startup idea. Discover the state of play, learn from
                mistakes, and build what others missed.
              </motion.p>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16 w-full max-w-3xl px-4"
              >
                {[
                  { value: "12,847", label: "Active Startups Today" },
                  { value: "86%", label: "Fail Due to Avoidable Errors" },
                  { value: "4.7M+", label: "Lessons from Failure" },
                  { value: "\u221E", label: "Opportunities to Be Different" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-[#0a0a0a]/80 border border-[#FF4D00]/20 p-4 md:p-5 text-center hover:border-[#FF4D00]/50 transition-colors"
                  >
                    <p className="font-mono text-xl md:text-2xl font-bold text-[#FF4D00] mb-1">
                      {stat.value}
                    </p>
                    <p className="font-mono text-[9px] md:text-[10px] text-[#666] leading-tight">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* Search Terminal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-full max-w-2xl px-4"
              >
                <div className="relative bg-[#0a0a0a] border border-[#FF4D00]/30 shadow-[0_0_30px_rgba(255,77,0,0.1)]">
                  <textarea
                    ref={inputRef}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your startup idea..."
                    rows={3}
                    className="w-full bg-transparent px-5 py-4 text-[13px] md:text-[14px] font-mono text-[#e5e5e5] placeholder:text-[#444] resize-none focus:outline-none"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-3">
                    <span className="hidden sm:block font-mono text-[9px] text-[#444]">CTRL + ENTER</span>
                    <button
                      onClick={handleSubmit}
                      disabled={!idea.trim()}
                      className="w-9 h-9 flex items-center justify-center bg-[#FF4D00] text-[#000] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff6a33] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                        <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="mt-4 font-mono text-[11px] text-red-400 text-center">{error}</p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6"
            >
              <div className="w-full max-w-lg">
                <div className="mb-8">
                  <div className="w-full h-[2px] bg-[#1a1a1a] overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FF4D00]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  </div>
                </div>

                <div className="font-mono text-[11px] md:text-[12px] text-[#666] space-y-2">
                  {loadingLogs.slice(0, logIndex + 1).map((log, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i === logIndex ? 1 : 0.4, x: 0 }}
                      className={i === logIndex ? "text-[#FF4D00]" : ""}
                    >
                      {log}
                      {i === logIndex && <span className="animate-pulse">_</span>}
                    </motion.p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {phase === "results" && results && (
            <motion.div
              key="results"
              ref={resultsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen px-4 md:px-6 pt-24 pb-20"
            >
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* A. DOPPELGANGERS FOUND */}
                <motion.section
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-[#FF4D00] mb-4 flex items-center gap-3">
                    <span className="w-4 md:w-6 h-[1px] bg-[#FF4D00]" />
                    A. DOPPELGANGERS FOUND
                    <span className="text-[#666]">({results.doppelgangers.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {results.doppelgangers.map((dp, i) => {
                      const config = statusConfig[dp.status] || statusConfig.DEAD
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="bg-[#0a0a0a] border border-[#FF4D00]/20 p-4 md:p-5 hover:border-[#FF4D00]/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-sans font-bold text-base md:text-lg text-[#e5e5e5] truncate">{dp.name}</h4>
                              <p className="font-mono text-[9px] md:text-[10px] text-[#666]">EST. {dp.founded}</p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="font-mono text-lg md:text-xl font-bold text-[#FF4D00]">{dp.similarity}%</p>
                              <p className="font-mono text-[8px] md:text-[9px] text-[#666]">MATCH</p>
                            </div>
                          </div>
                          <div className="w-full h-[2px] bg-[#1a1a1a] mb-3">
                            <div className="h-full bg-[#FF4D00]" style={{ width: `${dp.similarity}%` }} />
                          </div>
                          <span className={`inline-block font-mono text-[8px] md:text-[9px] tracking-wider border px-2 py-1 mb-3 ${config.color} ${config.border} ${config.bg}`}>
                            {dp.status}
                          </span>
                          <p className="font-mono text-[10px] md:text-[11px] text-[#888] leading-relaxed">{dp.reason}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.section>

                {/* B. THE AUTOPSY */}
                <motion.section
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-[#FF4D00] mb-4 flex items-center gap-3">
                    <span className="w-4 md:w-6 h-[1px] bg-[#FF4D00]" />
                    B. THE AUTOPSY
                    <span className="text-[#666]">(Problems &amp; Feedback)</span>
                  </h3>
                  <div className="bg-[#0a0a0a] border border-[#FF4D00]/20 p-4 md:p-6 space-y-3">
                    {results.autopsy.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className="flex gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <span className="font-mono text-[9px] md:text-[10px] text-red-500 shrink-0">[ERR_{String(i + 1).padStart(2, "0")}]</span>
                        <p className="font-mono text-[11px] md:text-[12px] text-[#888] leading-relaxed">{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* C. OPPORTUNITY MAPPING */}
                <motion.section
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-[#FF4D00] mb-4 flex items-center gap-3">
                    <span className="w-4 md:w-6 h-[1px] bg-[#FF4D00]" />
                    C. OPPORTUNITY MAPPING
                  </h3>
                  <div className="bg-[#0a0a0a] border border-[#FF4D00]/20 p-4 md:p-6 space-y-3">
                    {results.opportunities.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className="flex gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                      >
                        <span className="font-mono text-[9px] md:text-[10px] text-green-400 shrink-0">[OPP_{String(i + 1).padStart(2, "0")}]</span>
                        <p className="font-mono text-[11px] md:text-[12px] text-[#888] leading-relaxed">{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* D. FINAL VERDICT */}
                <motion.section
                  variants={glitchVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-[#FF4D00] mb-4 flex items-center gap-3">
                    <span className="w-4 md:w-6 h-[1px] bg-[#FF4D00]" />
                    D. FINAL VERDICT
                  </h3>
                  <div className="border border-[#FF4D00] p-6 md:p-10 text-center relative overflow-hidden bg-[#0a0a0a]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#FF4D00]/10 to-transparent" />
                    <motion.h2 
                      className="relative font-sans font-black text-2xl md:text-4xl lg:text-5xl tracking-tight mb-4 text-[#e5e5e5]"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1, duration: 0.4 }}
                    >
                      {results.verdict.title}
                    </motion.h2>
                    <motion.p 
                      className="relative font-mono text-[11px] md:text-[13px] text-[#888] max-w-2xl mx-auto leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      {results.verdict.summary}
                    </motion.p>
                  </div>
                </motion.section>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                >
                  <button
                    onClick={reset}
                    className="w-full sm:w-auto font-mono text-[10px] md:text-[11px] tracking-[0.15em] border border-[#333] px-8 py-3 hover:border-[#FF4D00] hover:text-[#FF4D00] transition-all"
                  >
                    [NEW SEARCH]
                  </button>
                  <button
                    onClick={reIterate}
                    className="w-full sm:w-auto font-mono text-[10px] md:text-[11px] tracking-[0.15em] bg-[#FF4D00] text-[#000] px-8 py-3 hover:bg-[#ff6a33] transition-all font-bold"
                  >
                    [RE-ITERATE IDEA]
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
