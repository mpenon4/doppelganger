"use client"

import { useState } from "react"

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

// Status styles
const statusStyles: Record<string, string> = {
  alive:    "border-teal-500/40 text-teal-400",
  dead:     "border-rose-500/40 text-rose-400",
  acquired: "border-amber-500/40 text-amber-400",
  pivot:    "border-purple-500/40 text-purple-400",
}

// Component
export default function DoppelgangerApp() {
  const [idea, setIdea] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [results, setResults] = useState<Results | null>(null)

  // Groq call
  async function findDoppelganger() {
    if (!idea.trim()) return
    setLoading(true)
    setError("")
    setProgress(0)

    // Fake progress ticker
    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 9, 88))
    }, 300)

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
              content:
                "You are a startup analyst. Always respond with ONLY valid JSON, no markdown formatting, no backticks, no extra text.",
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
      }, 400)
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

  // HERO
  if (!results) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-mono flex flex-col">
        {/* Nav */}
        <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center text-base font-bold">
              D
            </div>
            <span className="font-sans font-black text-lg tracking-tight">Doppelganger</span>
          </div>
          <span className="text-[10px] tracking-widest text-white/40 border border-white/15 px-2.5 py-1 rounded">
            BETA
          </span>
        </nav>

        {/* Stars */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px rounded-full bg-white/40 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Hero */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/30 mb-5">
            startup intelligence engine
          </p>
          <h1 className="font-sans font-black text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-5">
            <span className="text-purple-400">Find</span>{" "}
            <span>the</span>{" "}
            <span className="text-rose-400">startup</span>{" "}
            <span>that</span>{" "}
            <span className="text-teal-400">walked</span>
            <br />
            <span>your</span>{" "}
            <span>path</span>{" "}
            <span>before</span>{" "}
            <span className="text-amber-400">you.</span>
          </h1>
          <p className="text-sm text-white/50 mb-12 tracking-wide">
            Learn from their journey. Avoid their mistakes.
          </p>

          <div className="w-full max-w-2xl">
            <textarea
              className="w-full bg-white/5 border border-white/15 rounded-lg px-5 py-4 text-sm text-white placeholder-white/25 font-mono resize-none focus:outline-none focus:border-purple-500/50 transition-colors min-h-[100px] leading-relaxed italic"
              placeholder="Describe your startup idea... e.g. an app where freelancers compete in real-time challenges to get hired"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) findDoppelganger()
              }}
            />

            {error && (
              <div className="mt-3 px-4 py-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={findDoppelganger}
              disabled={loading || !idea.trim()}
              className="mt-4 w-full py-4 font-sans font-bold text-base tracking-wide rounded-lg bg-gradient-to-r from-purple-600 to-rose-500 text-white hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Scanning the multiverse..." : "Find My Doppelganger"}
            </button>

            {loading && (
              <div className="mt-5">
                <p className="text-xs text-teal-400 tracking-widest animate-pulse mb-3">
                  scanning the startup universe...
                </p>
                <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-rose-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // RESULTS
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center text-base font-bold">
            D
          </div>
          <span className="font-sans font-black text-lg tracking-tight">Doppelganger</span>
        </div>
        <button
          onClick={reset}
          className="text-[11px] tracking-widest text-white/40 border border-white/15 px-3 py-1.5 rounded hover:border-purple-500/50 hover:text-purple-400 transition-colors"
        >
          new search
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-24 space-y-16">

        {/* Doppelgangers */}
        <section>
          <SectionLabel>known doppelgangers</SectionLabel>
          <div className="space-y-4">
            {results.doppelgangers.map((dp, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-purple-500 via-rose-500 to-teal-400 opacity-60" />
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="font-sans font-black text-2xl bg-gradient-to-r from-purple-400 via-rose-400 to-teal-400 bg-clip-text text-transparent">
                    {dp.name}
                  </span>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-white/30">{dp.founded}</span>
                    <span className="text-[11px] font-bold text-teal-400">{dp.similarity}% match</span>
                  </div>
                </div>
                {/* Similarity bar */}
                <div className="w-full h-[3px] bg-white/10 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-rose-500 to-teal-400"
                    style={{ width: `${dp.similarity}%` }}
                  />
                </div>
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className={`text-[10px] border px-2.5 py-0.5 rounded ${statusStyles[dp.status] ?? statusStyles.alive}`}>
                    {dp.status}
                  </span>
                  {dp.tags.map((t, j) => (
                    <span key={j} className="text-[10px] border border-white/10 text-white/40 px-2.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{dp.journey}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Differences */}
        <section>
          <SectionLabel>them vs. you</SectionLabel>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="text-[10px] tracking-widest uppercase text-white/30 font-normal text-left px-4 py-3 border-b border-white/10">dimension</th>
                  <th className="text-[10px] tracking-widest uppercase text-white/30 font-normal text-left px-4 py-3 border-b border-white/10">they did</th>
                  <th className="text-[10px] tracking-widest uppercase text-white/30 font-normal text-right px-4 py-3 border-b border-white/10">you could</th>
                </tr>
              </thead>
              <tbody>
                {results.differences.map((d, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-[11px] tracking-wide text-white/25 uppercase">{d.dimension}</td>
                    <td className="px-4 py-3 text-white/50 leading-relaxed">{d.they_did}</td>
                    <td className="px-4 py-3 text-teal-400 leading-relaxed text-right">{d.you_could}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fatal mistakes */}
        <section>
          <SectionLabel>fatal mistakes to avoid</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.fatal_mistakes.map((m, i) => (
              <div key={i} className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4">
                <div className="text-rose-400 text-sm mb-2">X</div>
                <p className="text-sm text-white/55 leading-relaxed">{m}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Winning moves */}
        <section>
          <SectionLabel>your winning moves</SectionLabel>
          <ul className="space-y-3">
            {results.winning_moves.map((m, i) => (
              <li key={i} className="grid grid-cols-[48px_1fr] gap-4 items-start bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 hover:border-white/15 transition-colors">
                <span className="font-sans font-black text-3xl bg-gradient-to-b from-purple-400 to-rose-500 bg-clip-text text-transparent leading-none pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-white leading-relaxed">{m}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Verdict */}
        <section>
          <div className="relative bg-white/[0.03] border border-white/12 rounded-2xl p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.07)_0%,transparent_70%)]" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4">final verdict</p>
            <p className="relative font-sans font-black text-2xl sm:text-3xl bg-gradient-to-r from-purple-400 via-rose-400 to-teal-400 bg-clip-text text-transparent leading-snug mb-4">
              {results.verdict.headline}
            </p>
            <p className="relative text-sm text-white/50 leading-relaxed max-w-xl mx-auto">
              {results.verdict.summary}
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}

// Small helpers
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 border-b border-white/10 pb-2 mb-5">
      {children}
    </p>
  )
}
