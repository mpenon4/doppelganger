"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { WireframeGlobeSVG } from "@/components/wireframe-globe-svg"
import { DataFunnel } from "@/components/data-funnel"
import { TerrainGrid } from "@/components/terrain-grid"

// Types
interface Doppelganger {
  name: string
  founded: string
  similarity: number
  status: "alive" | "dead" | "acquired" | "pivot"
  tags: string[]
  journey: string
}

interface Difference {
  dimension: string
  they_did: string
  you_could: string
}

interface Results {
  doppelgangers: Doppelganger[]
  differences: Difference[]
  fatal_mistakes: string[]
  winning_moves: string[]
  verdict: {
    headline: string
    summary: string
  }
}

const statusStyles: Record<string, string> = {
  alive: "border-[#ff6b35]/40 text-[#ff6b35]",
  dead: "border-red-500/40 text-red-400",
  acquired: "border-green-500/40 text-green-400",
  pivot: "border-[#ffb347]/40 text-[#ffb347]",
}

const statusCards = [
  { key: "SCAN_INDEX", value: "1.2M+", label: "Repositories" },
  { key: "FAILURE_LOGS", value: "45k", label: "Post-mortems" },
  { key: "MARKET_SAT", value: "86.4%", label: "Saturation" },
  { key: "MATCH_ENGINE", value: "Active", label: "Status" },
]

const loadingPhrases = [
  "SCANNING GLOBAL DATABASES",
  "CROSS-REFERENCING PATTERNS",
  "ANALYZING MARKET SIGNALS",
  "DECODING STARTUP DNA",
  "MAPPING TRAJECTORIES",
  "COMPUTING SIMILARITIES",
]

export default function DoppelgangerApp() {
  const [idea, setIdea] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loadingPhrase, setLoadingPhrase] = useState(0)
  const [error, setError] = useState("")
  const [results, setResults] = useState<Results | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingPhrase(p => (p + 1) % loadingPhrases.length)
      }, 800)
      return () => clearInterval(interval)
    }
  }, [loading])

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current.querySelectorAll("span"),
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "power4.out" }
      )
    }
  }, [])

  async function findDoppelganger() {
    if (!idea.trim()) return
    setLoading(true)
    setError("")
    setProgress(0)

    const ticker = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 8, 90))
    }, 200)

    const prompt = `You are a world-class startup analyst with deep knowledge of the global startup ecosystem.

The user has this startup idea: "${idea}"

Find their doppelganger startups, analyze differences, and give winning strategies.

Return ONLY a valid JSON object. No markdown, no backticks, no extra text.

{
  "doppelgangers": [
    {
      "name": "Real company name",
      "founded": "Year",
      "similarity": 82,
      "status": "alive|dead|acquired|pivot",
      "tags": ["tag1", "tag2", "tag3"],
      "journey": "3 sentences: how they started, what happened, current status and key lesson."
    },
    {
      "name": "Second real company",
      "founded": "Year",
      "similarity": 67,
      "status": "alive|dead|acquired|pivot",
      "tags": ["tag1", "tag2"],
      "journey": "3 sentences about their journey and lesson."
    },
    {
      "name": "Third real company",
      "founded": "Year",
      "similarity": 55,
      "status": "alive|dead|acquired|pivot",
      "tags": ["tag1", "tag2"],
      "journey": "3 sentences about their journey and lesson."
    }
  ],
  "differences": [
    { "dimension": "target market", "they_did": "what they targeted", "you_could": "how you could target differently" },
    { "dimension": "business model", "they_did": "their model", "you_could": "your potential model" },
    { "dimension": "go-to-market", "they_did": "their GTM", "you_could": "your GTM angle" },
    { "dimension": "technology", "they_did": "their tech approach", "you_could": "your tech advantage" },
    { "dimension": "pricing", "they_did": "their pricing", "you_could": "your pricing edge" }
  ],
  "fatal_mistakes": [
    "Specific mistake these companies made that you must avoid",
    "Second critical mistake",
    "Third critical mistake",
    "Fourth critical mistake"
  ],
  "winning_moves": [
    "Specific actionable move with concrete detail",
    "Second specific move",
    "Third specific move",
    "Fourth specific move",
    "Fifth specific move"
  ],
  "verdict": {
    "headline": "Short bold verdict headline (max 10 words)",
    "summary": "2-3 sentences: honest assessment of the opportunity, the crowdedness of the space, and the single biggest lever the user has."
  }
}`

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2500,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: "You are a startup analyst. Always respond with ONLY valid JSON, no markdown formatting, no backticks, no extra text.",
            },
            { role: "user", content: prompt },
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: { message?: string } }).error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      let raw: string = data.choices?.[0]?.message?.content ?? ""
      raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("Invalid response format")
      const parsed: Results = JSON.parse(match[0])

      clearInterval(ticker)
      setProgress(100)
      setTimeout(() => {
        setResults(parsed)
        setLoading(false)
        setProgress(0)
      }, 500)
    } catch (e: unknown) {
      clearInterval(ticker)
      setLoading(false)
      setProgress(0)
      setError(e instanceof Error ? e.message : "Failed to find your doppelganger. Please try again.")
    }
  }

  function reset() {
    setResults(null)
    setIdea("")
    setError("")
  }

  // HERO VIEW
  if (!results) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col relative overflow-hidden dot-matrix">
        {/* Header */}
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm tracking-[0.2em] font-bold text-[#ff6b35]">BASEMENT</span>
            <span className="text-[#666]">·</span>
            <span className="font-mono text-sm tracking-[0.2em] text-[#ffb347]">LAB</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <span className="font-mono text-[11px] tracking-widest text-[#666] hover:text-[#e5e5e5] cursor-pointer transition-colors">EXPLORE</span>
            <span className="font-mono text-[11px] tracking-widest text-[#666] hover:text-[#e5e5e5] cursor-pointer transition-colors">ANALYZE</span>
            <span className="font-mono text-[11px] tracking-widest text-[#666] hover:text-[#e5e5e5] cursor-pointer transition-colors">DIFFERENTIATE</span>
            <span className="font-mono text-[11px] tracking-widest text-[#666] hover:text-[#e5e5e5] cursor-pointer transition-colors">INSIGHTS</span>
          </nav>
          <button className="font-mono text-[11px] tracking-widest border border-[#333] px-4 py-2 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-colors">
            SIGN IN
          </button>
        </header>

        {/* Main content */}
        <main className="relative flex-1 flex items-center justify-center px-6 pt-24 pb-32">
          {/* Globe - Left Side */}
          <div className="absolute left-0 top-20 bottom-32 w-[35%] hidden lg:block">
            <WireframeGlobeSVG />
          </div>

          {/* Funnel - Right Side */}
          <div className="absolute right-0 top-20 bottom-32 w-[25%] hidden lg:block">
            <DataFunnel />
          </div>

          {/* Center Content */}
          <div className="relative z-10 w-full max-w-3xl text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-[10px] tracking-[0.4em] text-[#666] mb-6"
            >
              THE INTELLIGENCE TO BUILD WHAT&apos;S NEXT
            </motion.p>

            <h1 
              ref={titleRef}
              className="font-sans font-black text-[8vw] md:text-[6vw] lg:text-[4.5vw] leading-[0.95] tracking-tight mb-4 overflow-hidden"
            >
              <span className="inline-block text-[#e5e5e5]">BUILD DIFFERENT.</span>
              <br />
              <span className="inline-block text-[#ff6b35] glitch-text" data-text="BECAUSE THEY DIDN'T.">BECAUSE THEY DIDN&apos;T.</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-mono text-[12px] text-[#666] mb-10 max-w-lg mx-auto leading-relaxed"
            >
              Validate your startup idea. Discover the state of play, learn from
              mistakes, and build what others missed.
            </motion.p>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => document.getElementById("input-section")?.scrollIntoView({ behavior: "smooth" })}
              className="font-mono text-[11px] tracking-widest border border-[#ff6b35] text-[#ff6b35] px-8 py-3 hover:bg-[#ff6b35] hover:text-[#0a0a0a] transition-all mb-12 flex items-center gap-3 mx-auto"
            >
              ANALYZE MY IDEA
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </motion.button>

            {/* Status Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-16"
            >
              {statusCards.map((card, i) => (
                <div
                  key={i}
                  className="status-card bg-[#0f0f0f]/80 border border-[#1a1a1a] p-4 text-left"
                >
                  <p className="font-mono text-[10px] tracking-widest text-[#666] mb-1">
                    [{card.key}]
                  </p>
                  <p className="font-mono text-2xl font-bold text-[#ff6b35]">
                    {card.value}
                  </p>
                  <p className="font-mono text-[10px] text-[#666] mt-1">
                    {card.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Input Section */}
            <motion.div
              id="input-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="relative bg-[#0f0f0f] border border-[#1a1a1a] terminal-input">
                <textarea
                  className="w-full bg-transparent px-6 py-5 text-[13px] font-mono text-[#e5e5e5] placeholder:text-[#444] resize-none focus:outline-none min-h-[100px]"
                  placeholder="Describe your startup idea..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) findDoppelganger()
                  }}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#444]">
                    CTRL + ENTER
                  </span>
                  <button
                    onClick={findDoppelganger}
                    disabled={loading || !idea.trim()}
                    className="w-10 h-10 flex items-center justify-center bg-[#ff6b35] text-[#0a0a0a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffb347] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono">
                  {error}
                </div>
              )}

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <div className="w-full h-[2px] bg-[#1a1a1a] overflow-hidden">
                      <motion.div
                        className="h-full bg-[#ff6b35]"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <p className="mt-3 font-mono text-[10px] tracking-widest text-[#ff6b35] text-center">
                      {loadingPhrases[loadingPhrase]} — {Math.round(progress)}%
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Terrain Grid */}
          <TerrainGrid />
        </main>
      </div>
    )
  }

  // RESULTS VIEW
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] dot-matrix">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tracking-[0.2em] font-bold text-[#ff6b35]">BASEMENT</span>
          <span className="text-[#666]">·</span>
          <span className="font-mono text-sm tracking-[0.2em] text-[#ffb347]">LAB</span>
        </div>
        <button
          onClick={reset}
          className="font-mono text-[11px] tracking-widest border border-[#333] px-4 py-2 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-colors"
        >
          NEW ANALYSIS
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-24">
        {/* Verdict - Glitch Reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 border border-[#ff6b35] p-8 md:p-12 text-center verdict-reveal relative overflow-hidden scan-line"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff6b35] mb-4">
            DIFFERENTIATION_SCORE: 78.4%
          </p>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight mb-6 leading-tight text-[#e5e5e5]">
            {results.verdict.headline}
          </h2>
          <p className="font-mono text-[12px] text-[#666] leading-relaxed max-w-2xl mx-auto">
            {results.verdict.summary}
          </p>
          <div className="absolute top-4 right-4">
            <span className="font-mono text-[10px] text-[#ff6b35]">CRITICAL_FAILURES: {results.fatal_mistakes.length}</span>
          </div>
        </motion.div>

        {/* Doppelgangers */}
        <section className="mb-20">
          <SectionLabel index="01">KNOWN DOPPELGANGERS</SectionLabel>
          <div className="space-y-4">
            {results.doppelgangers.map((dp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#0f0f0f] border border-[#1a1a1a] p-6 hover:border-[#ff6b35] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-sans font-black text-2xl md:text-3xl tracking-tight group-hover:text-[#ff6b35] transition-colors">
                      {dp.name}
                    </h3>
                    <p className="font-mono text-[10px] tracking-widest text-[#666] mt-1">
                      EST. {dp.founded}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-3xl font-bold text-[#ff6b35]">{dp.similarity}%</p>
                    <p className="font-mono text-[10px] tracking-widest text-[#666]">MATCH</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[2px] bg-[#1a1a1a] mb-4">
                  <div
                    className="h-full bg-[#ff6b35] transition-all duration-500"
                    style={{ width: `${dp.similarity}%` }}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`font-mono text-[10px] tracking-widest border px-2 py-1 ${statusStyles[dp.status]}`}>
                    {dp.status.toUpperCase()}
                  </span>
                  {dp.tags.map((t, j) => (
                    <span key={j} className="font-mono text-[10px] tracking-widest border border-[#1a1a1a] text-[#666] px-2 py-1">
                      {t.toUpperCase()}
                    </span>
                  ))}
                </div>

                <p className="font-mono text-[12px] text-[#888] leading-relaxed">
                  {dp.journey}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Differences Table */}
        <section className="mb-20">
          <SectionLabel index="02">THEM VS. YOU</SectionLabel>
          <div className="border border-[#1a1a1a] overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#0f0f0f]">
                  <th className="font-mono text-[10px] tracking-widest text-[#666] font-normal text-left px-4 py-3 border-b border-[#1a1a1a]">DIMENSION</th>
                  <th className="font-mono text-[10px] tracking-widest text-[#666] font-normal text-left px-4 py-3 border-b border-[#1a1a1a]">THEY DID</th>
                  <th className="font-mono text-[10px] tracking-widest text-[#ff6b35] font-normal text-right px-4 py-3 border-b border-[#1a1a1a]">YOU COULD</th>
                </tr>
              </thead>
              <tbody>
                {results.differences.map((d, i) => (
                  <tr key={i} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#0f0f0f] transition-colors">
                    <td className="font-mono text-[10px] tracking-widest text-[#666] px-4 py-4">{d.dimension.toUpperCase()}</td>
                    <td className="font-mono text-[12px] text-[#888] px-4 py-4">{d.they_did}</td>
                    <td className="font-mono text-[12px] text-[#ffb347] px-4 py-4 text-right">{d.you_could}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fatal Mistakes */}
        <section className="mb-20">
          <SectionLabel index="03">FATAL MISTAKES TO AVOID</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.fatal_mistakes.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-red-500/5 border border-red-500/20 p-5"
              >
                <span className="font-mono text-red-400 text-lg font-bold">X</span>
                <p className="font-mono text-[12px] text-[#888] mt-2 leading-relaxed">{m}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Winning Moves */}
        <section className="mb-20">
          <SectionLabel index="04">YOUR WINNING MOVES</SectionLabel>
          <div className="space-y-3">
            {results.winning_moves.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start bg-[#0f0f0f] border border-[#1a1a1a] p-5 hover:border-[#ff6b35] transition-colors"
              >
                <span className="font-mono text-4xl font-bold text-[#333] shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-mono text-[12px] text-[#e5e5e5] leading-relaxed pt-2">{m}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-6 px-6">
        <p className="font-mono text-[10px] tracking-widest text-[#444] text-center">
          BASEMENT·LAB — STARTUP INTELLIGENCE ENGINE V.01
        </p>
      </footer>
    </div>
  )
}

function SectionLabel({ children, index }: { children: React.ReactNode; index: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-mono text-[10px] tracking-widest text-[#ff6b35]">{index}</span>
      <div className="flex-1 h-px bg-[#1a1a1a]" />
      <span className="font-mono text-[10px] tracking-widest text-[#666]">
        {children}
      </span>
    </div>
  )
}
