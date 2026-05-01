"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import dynamic from "next/dynamic"

const Globe3D = dynamic(() => import("@/components/globe-3d").then(mod => mod.Globe3D), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />
})

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
  alive: "border-white/40 text-white",
  dead: "border-accent/40 text-accent",
  acquired: "border-white/40 text-white",
  pivot: "border-white/20 text-white/60",
}

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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-widest">DPLGNGR</span>
          </div>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground border border-border px-2 py-1">
            V.01
          </span>
        </header>

        {/* Main content */}
        <main className="relative flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
          {/* 3D Globe Background */}
          <div className="absolute inset-0 opacity-30">
            <Globe3D />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-4xl text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-8"
            >
              STARTUP INTELLIGENCE ENGINE
            </motion.p>

            <h1 
              ref={titleRef}
              className="font-sans font-black text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter mb-8 overflow-hidden"
            >
              <span className="inline-block">FIND</span>{" "}
              <span className="inline-block">YOUR</span>
              <br />
              <span className="inline-block text-accent glitch-text" data-text="DOPPEL">DOPPEL</span>
              <span className="inline-block">GANGER</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-mono text-sm text-muted-foreground mb-12 max-w-xl mx-auto"
            >
              Discover the startup that walked your path before you.
              <br />
              Learn from their journey. Avoid their mistakes.
            </motion.p>

            {/* Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="relative">
                <textarea
                  className="w-full bg-secondary border border-border px-6 py-5 text-sm font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-foreground transition-colors min-h-[120px]"
                  placeholder="Describe your startup idea..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) findDoppelganger()
                  }}
                />
                <span className="absolute bottom-3 right-3 font-mono text-[10px] text-muted-foreground">
                  CMD + ENTER
                </span>
              </div>

              {error && (
                <div className="mt-4 px-4 py-3 bg-accent/10 border border-accent/30 text-accent text-xs font-mono">
                  {error}
                </div>
              )}

              <button
                onClick={findDoppelganger}
                disabled={loading || !idea.trim()}
                className="mt-4 w-full py-5 font-mono text-sm tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? loadingPhrases[loadingPhrase] : "FIND MY DOPPELGANGER"}
              </button>

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <div className="w-full h-[2px] bg-border overflow-hidden">
                      <motion.div
                        className="h-full bg-foreground"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <p className="mt-3 font-mono text-[10px] tracking-widest text-muted-foreground text-center">
                      {Math.round(progress)}% COMPLETE
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Marquee */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border py-3 overflow-hidden">
            <div className="marquee whitespace-nowrap">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                {Array(10).fill("STARTUP INTELLIGENCE • PATTERN RECOGNITION • COMPETITIVE ANALYSIS • MARKET MAPPING • ").join("")}
              </span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // RESULTS VIEW
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-widest">DPLGNGR</span>
        </div>
        <button
          onClick={reset}
          className="font-mono text-[10px] tracking-widest text-muted-foreground border border-border px-3 py-1.5 hover:border-foreground hover:text-foreground transition-colors"
        >
          NEW SEARCH
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-24">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-4">
            ANALYSIS COMPLETE
          </p>
          <h2 className="font-sans font-black text-4xl md:text-6xl tracking-tight leading-none">
            YOUR STARTUP
            <br />
            <span className="text-accent">DOPPELGANGERS</span>
          </h2>
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
                className="group bg-secondary border border-border p-6 hover:border-foreground transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-sans font-black text-2xl md:text-3xl tracking-tight group-hover:text-accent transition-colors">
                      {dp.name}
                    </h3>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground mt-1">
                      EST. {dp.founded}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-3xl font-bold">{dp.similarity}%</p>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground">MATCH</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[2px] bg-border mb-4">
                  <div
                    className="h-full bg-foreground transition-all duration-500"
                    style={{ width: `${dp.similarity}%` }}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`font-mono text-[10px] tracking-widest border px-2 py-1 ${statusStyles[dp.status]}`}>
                    {dp.status.toUpperCase()}
                  </span>
                  {dp.tags.map((t, j) => (
                    <span key={j} className="font-mono text-[10px] tracking-widest border border-border text-muted-foreground px-2 py-1">
                      {t.toUpperCase()}
                    </span>
                  ))}
                </div>

                <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                  {dp.journey}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Differences Table */}
        <section className="mb-20">
          <SectionLabel index="02">THEM VS. YOU</SectionLabel>
          <div className="border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary">
                  <th className="font-mono text-[10px] tracking-widest text-muted-foreground font-normal text-left px-4 py-3 border-b border-border">DIMENSION</th>
                  <th className="font-mono text-[10px] tracking-widest text-muted-foreground font-normal text-left px-4 py-3 border-b border-border">THEY DID</th>
                  <th className="font-mono text-[10px] tracking-widest text-muted-foreground font-normal text-right px-4 py-3 border-b border-border">YOU COULD</th>
                </tr>
              </thead>
              <tbody>
                {results.differences.map((d, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                    <td className="font-mono text-[10px] tracking-widest text-muted-foreground px-4 py-4">{d.dimension.toUpperCase()}</td>
                    <td className="font-mono text-sm text-muted-foreground px-4 py-4">{d.they_did}</td>
                    <td className="font-mono text-sm text-foreground px-4 py-4 text-right">{d.you_could}</td>
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
                className="bg-accent/5 border border-accent/20 p-5"
              >
                <span className="font-mono text-accent text-lg font-bold">X</span>
                <p className="font-mono text-sm text-muted-foreground mt-2 leading-relaxed">{m}</p>
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
                className="flex gap-6 items-start bg-secondary border border-border p-5 hover:border-foreground transition-colors"
              >
                <span className="font-mono text-4xl font-bold text-muted-foreground shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-mono text-sm text-foreground leading-relaxed pt-2">{m}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Verdict */}
        <section>
          <SectionLabel index="05">FINAL VERDICT</SectionLabel>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-foreground p-8 md:p-12 text-center"
          >
            <h3 className="font-sans font-black text-3xl md:text-5xl tracking-tight mb-6 leading-tight">
              {results.verdict.headline}
            </h3>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {results.verdict.summary}
            </p>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground text-center">
          DPLGNGR V.01 — STARTUP INTELLIGENCE ENGINE
        </p>
      </footer>
    </div>
  )
}

function SectionLabel({ children, index }: { children: React.ReactNode; index: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{index}</span>
      <div className="flex-1 h-px bg-border" />
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{children}</span>
    </div>
  )
}
