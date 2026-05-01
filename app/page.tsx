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
  status: "alive" | "dead" | "acquired" | "pivot"
  reason: string
}

interface Results {
  doppelgangers: Doppelganger[]
  autopsy: string[]
  pivot: string[]
  verdict: {
    title: string
    summary: string
  }
}

const statusColors: Record<string, string> = {
  alive: "text-green-400 border-green-400/30",
  dead: "text-red-400 border-red-400/30",
  acquired: "text-blue-400 border-blue-400/30",
  pivot: "text-[#ffb347] border-[#ffb347]/30",
}

const loadingLogs = [
  "> Initializing DOPPELGANGER engine...",
  "> Querying MCP tools...",
  "> Scraping web graveyards...",
  "> Analyzing startup post-mortems...",
  "> Cross-referencing failure patterns...",
  "> Computing differentiation vectors...",
  "> Generating survival strategies...",
]

export default function DoppelgangerApp() {
  const [idea, setIdea] = useState("")
  const [phase, setPhase] = useState<"idle" | "loading" | "results">("idle")
  const [logIndex, setLogIndex] = useState(0)
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Cycle through loading logs
  useEffect(() => {
    if (phase === "loading") {
      const interval = setInterval(() => {
        setLogIndex((i) => (i + 1) % loadingLogs.length)
      }, 600)
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

    const prompt = `You are a brutally honest startup analyst. Analyze this startup idea and find similar companies that tried before.

STARTUP IDEA: "${idea}"

Return ONLY valid JSON (no markdown, no backticks):
{
  "doppelgangers": [
    {
      "name": "Real company name",
      "founded": "2019",
      "similarity": 85,
      "status": "dead",
      "reason": "Why they failed or succeeded in 1 sentence"
    }
  ],
  "autopsy": [
    "Critical mistake 1 that killed similar startups",
    "Critical mistake 2",
    "Critical mistake 3"
  ],
  "pivot": [
    "Technical differentiator 1 to survive",
    "Technical differentiator 2",
    "Technical differentiator 3"
  ],
  "verdict": {
    "title": "BRUTAL VERDICT IN 5 WORDS OR LESS",
    "summary": "2 sentences: honest market assessment and the single biggest opportunity"
  }
}

Include 3-5 real doppelgangers with accurate data. Be specific and brutal.`

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
            { role: "system", content: "Respond only with valid JSON. No markdown." },
            { role: "user", content: prompt },
          ],
        }),
      })

      if (!res.ok) throw new Error("API request failed")

      const data = await res.json()
      let raw = data.choices?.[0]?.message?.content || ""
      raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("Invalid response")
      
      const parsed: Results = JSON.parse(match[0])
      
      // Add delay for dramatic effect
      await new Promise((r) => setTimeout(r, 800))
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

  return (
    <div className="min-h-screen bg-[#000] text-[#e5e5e5] overflow-x-hidden">
      {/* Interactive Background */}
      <InteractiveCanvas />
      
      {/* HUD Overlay */}
      <HUDOverlay />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#000]/80 backdrop-blur-sm border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tracking-[0.2em] font-bold text-[#ff6b35]">BASEMENT</span>
          <span className="text-[#333]">·</span>
          <span className="font-mono text-sm tracking-[0.2em] text-[#666]">LAB</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {["EXPLORE", "ANALYZE", "DIFFERENTIATE", "INSIGHTS"].map((item) => (
            <span
              key={item}
              className="font-mono text-[11px] tracking-[0.15em] text-[#666] hover:text-[#e5e5e5] cursor-pointer transition-colors"
            >
              {item}
            </span>
          ))}
        </div>

        <button
          onClick={phase === "results" ? reset : undefined}
          className="font-mono text-[11px] tracking-[0.15em] border border-[#333] px-5 py-2.5 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all"
        >
          {phase === "results" ? "NEW ANALYSIS" : "SIGN IN"}
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
              exit={{ opacity: 0, y: -50 }}
              className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-32"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-[10px] tracking-[0.4em] text-[#666] mb-8"
              >
                THE INTELLIGENCE TO BUILD WHAT&apos;S NEXT
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center mb-6"
              >
                <span className="block font-sans font-black text-[12vw] md:text-[8vw] lg:text-[6vw] leading-[0.9] tracking-tight text-[#e5e5e5]">
                  BUILD DIFFERENT.
                </span>
                <span 
                  className="block font-sans font-black text-[12vw] md:text-[8vw] lg:text-[6vw] leading-[0.9] tracking-tight bg-gradient-to-r from-[#FF4D00] to-[#8B0000] bg-clip-text text-transparent"
                >
                  BECAUSE THEY DIDN&apos;T.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-mono text-[12px] text-[#666] text-center max-w-lg mb-12 leading-relaxed"
              >
                Validate your startup idea. Discover the state of play, learn from
                mistakes, and build what others missed.
              </motion.p>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 w-full max-w-3xl"
              >
                {[
                  { value: "12,847", label: "Active Startups Today" },
                  { value: "86%", label: "Fail Due to Avoidable Errors" },
                  { value: "4.7M+", label: "Lessons from Failure" },
                  { value: "\u221E", label: "Opportunities to Be Different" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-[#0a0a0a]/80 border border-[#1a1a1a] p-5 text-center hover:border-[#ff6b35]/30 transition-colors"
                  >
                    <p className="font-mono text-2xl md:text-3xl font-bold text-[#ff6b35] mb-1">
                      {stat.value}
                    </p>
                    <p className="font-mono text-[10px] text-[#666] leading-tight">
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
                className="w-full max-w-2xl"
              >
                <div className="relative bg-[#0a0a0a] border border-[#1a1a1a] shadow-[inset_0_0_60px_rgba(255,77,0,0.05)]">
                  <textarea
                    ref={inputRef}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your startup idea..."
                    rows={3}
                    className="w-full bg-transparent px-6 py-5 text-[14px] font-mono text-[#e5e5e5] placeholder:text-[#444] resize-none focus:outline-none"
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-4">
                    <span className="font-mono text-[10px] text-[#444]">CTRL + ENTER</span>
                    <button
                      onClick={handleSubmit}
                      disabled={!idea.trim()}
                      className="w-10 h-10 flex items-center justify-center bg-[#ff6b35] text-[#000] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff8c5a] transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
              className="min-h-screen flex flex-col items-center justify-center px-6"
            >
              <div className="w-full max-w-lg">
                <div className="mb-8">
                  <div className="w-full h-[2px] bg-[#1a1a1a] overflow-hidden">
                    <motion.div
                      className="h-full bg-[#ff6b35]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4, ease: "linear" }}
                    />
                  </div>
                </div>

                <div className="font-mono text-[12px] text-[#666] space-y-2">
                  {loadingLogs.slice(0, logIndex + 1).map((log, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i === logIndex ? 1 : 0.4, x: 0 }}
                      className={i === logIndex ? "text-[#ff6b35]" : ""}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen px-6 pt-28 pb-20"
            >
              <div className="max-w-5xl mx-auto">
                {/* Verdict Banner */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-16 border border-[#ff6b35] p-8 md:p-12 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#ff6b35]/5 to-transparent" />
                  <p className="relative font-mono text-[10px] tracking-[0.3em] text-[#ff6b35] mb-4">
                    FINAL VERDICT
                  </p>
                  <h2 className="relative font-sans font-black text-3xl md:text-5xl tracking-tight mb-4 text-[#e5e5e5]">
                    {results.verdict.title}
                  </h2>
                  <p className="relative font-mono text-[13px] text-[#888] max-w-2xl mx-auto leading-relaxed">
                    {results.verdict.summary}
                  </p>
                </motion.div>

                {/* Grid Layout */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* A. DOPPELGANGERS */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-2"
                  >
                    <h3 className="font-mono text-[11px] tracking-[0.2em] text-[#ff6b35] mb-4 flex items-center gap-3">
                      <span className="w-6 h-[1px] bg-[#ff6b35]" />
                      A. DOPPELGANGERS FOUND
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.doppelgangers.map((dp, i) => (
                        <div
                          key={i}
                          className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 hover:border-[#ff6b35]/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-sans font-bold text-lg text-[#e5e5e5]">{dp.name}</h4>
                              <p className="font-mono text-[10px] text-[#666]">EST. {dp.founded}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-xl font-bold text-[#ff6b35]">{dp.similarity}%</p>
                              <p className="font-mono text-[9px] text-[#666]">MATCH</p>
                            </div>
                          </div>
                          <div className="w-full h-[2px] bg-[#1a1a1a] mb-3">
                            <div className="h-full bg-[#ff6b35]" style={{ width: `${dp.similarity}%` }} />
                          </div>
                          <span className={`inline-block font-mono text-[9px] tracking-wider border px-2 py-1 mb-3 ${statusColors[dp.status]}`}>
                            {dp.status.toUpperCase()}
                          </span>
                          <p className="font-mono text-[11px] text-[#888] leading-relaxed">{dp.reason}</p>
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {/* B. THE AUTOPSY */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-mono text-[11px] tracking-[0.2em] text-[#ff6b35] mb-4 flex items-center gap-3">
                      <span className="w-6 h-[1px] bg-[#ff6b35]" />
                      B. THE AUTOPSY
                    </h3>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 space-y-3">
                      {results.autopsy.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="font-mono text-[10px] text-red-400 shrink-0">[{String(i + 1).padStart(2, "0")}]</span>
                          <p className="font-mono text-[12px] text-[#888] leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {/* C. THE PIVOT */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-mono text-[11px] tracking-[0.2em] text-[#ff6b35] mb-4 flex items-center gap-3">
                      <span className="w-6 h-[1px] bg-[#ff6b35]" />
                      C. THE PIVOT
                    </h3>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 space-y-3">
                      {results.pivot.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="font-mono text-[10px] text-green-400 shrink-0">[{String(i + 1).padStart(2, "0")}]</span>
                          <p className="font-mono text-[12px] text-[#888] leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                </div>

                {/* New Analysis Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-16 text-center"
                >
                  <button
                    onClick={reset}
                    className="font-mono text-[11px] tracking-[0.15em] border border-[#333] px-8 py-3 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all"
                  >
                    ANALYZE ANOTHER IDEA
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
