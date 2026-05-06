"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PitchDeckSlide {
  number: number
  title: string
  content: string[]
  notes?: string
}

interface PitchDeckViewerProps {
  pitchDeck: {
    companyName: string
    pitchTitle: string
    slides: PitchDeckSlide[]
  } | null
  isOpen: boolean
  onClose: () => void
  lang: "en" | "es"
}

const T = {
  en: {
    pitchDeck: "PITCH DECK",
    slide: "SLIDE",
    of: "OF",
    notes: "Speaker Notes",
    downloadPdf: "DOWNLOAD PDF",
    downloadMarkdown: "DOWNLOAD AS MARKDOWN",
    downloadJson: "DOWNLOAD AS JSON",
    copyToClipboard: "COPY SLIDE TO CLIPBOARD",
    close: "CLOSE",
  },
  es: {
    pitchDeck: "PITCH DECK",
    slide: "DIAPOSITIVA",
    of: "DE",
    notes: "Notas del Orador",
    downloadPdf: "DESCARGAR PDF",
    downloadMarkdown: "DESCARGAR COMO MARKDOWN",
    downloadJson: "DESCARGAR COMO JSON",
    copyToClipboard: "COPIAR DIAPOSITIVA",
    close: "CERRAR",
  },
}

export function PitchDeckViewer({ pitchDeck, isOpen, onClose, lang }: PitchDeckViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const t = T[lang]

  if (!pitchDeck) return null

  const slide = pitchDeck.slides[currentSlide]

  const handleNextSlide = () => {
    if (currentSlide < pitchDeck.slides.length - 1) {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
    }
  }

  const downloadAsMarkdown = () => {
    let markdown = `# ${pitchDeck.companyName} - Pitch Deck\n\n`

    pitchDeck.slides.forEach((s) => {
      markdown += `## Slide ${s.number}: ${s.title}\n\n`
      s.content.forEach((item) => {
        markdown += `- ${item}\n`
      })
      if (s.notes) {
        markdown += `\n**Speaker Notes:** ${s.notes}\n\n`
      }
      markdown += "\n---\n\n"
    })

    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${pitchDeck.companyName}-pitch-deck.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAsJson = () => {
    const json = JSON.stringify(pitchDeck, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${pitchDeck.companyName}-pitch-deck.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copySlideToClipboard = () => {
    const slideText = `${slide.title}\n\n${slide.content.join("\n")}`
    navigator.clipboard.writeText(slideText).then(() => {
      alert("Slide copied to clipboard!")
    })
  }

  const exportAsPdf = () => {
    const previousTitle = document.title
    document.title = `${pitchDeck.companyName}-pitch-deck`
    const style = document.createElement("style")
    style.id = "pitch-deck-print-page-style"
    style.textContent = "@page { size: 16in 9in; margin: 0; }"
    document.head.appendChild(style)

    const cleanup = () => {
      document.getElementById("pitch-deck-print-page-style")?.remove()
      document.title = previousTitle
      window.removeEventListener("afterprint", cleanup)
    }

    window.addEventListener("afterprint", cleanup)
    window.print()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 print:hidden"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-cyan-400/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-cyan-400/20 p-6 bg-slate-800/50 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400 mb-2">{pitchDeck.pitchTitle}</h2>
                  <p className="text-sm text-slate-300">
                    {t.slide} {currentSlide + 1} {t.of} {pitchDeck.slides.length}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Slide Content */}
              <div className="flex-1 overflow-y-auto p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {/* Slide Title */}
                    <div>
                      <h3 className="text-5xl font-bold text-cyan-400 mb-4">{slide.title}</h3>
                      <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-transparent"></div>
                    </div>

                    {/* Slide Content */}
                    <div className="space-y-4">
                      {slide.content.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-4 text-lg text-slate-200"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Speaker Notes */}
                    {slide.notes && (
                      <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                        <p className="text-sm text-slate-400 font-semibold mb-2">
                          {t.notes}
                        </p>
                        <p className="text-slate-300 italic">{slide.notes}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer with Controls */}
              <div className="border-t border-cyan-400/20 p-6 bg-slate-800/50">
                <div className="flex flex-col gap-4">
                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handlePrevSlide}
                      disabled={currentSlide === 0}
                      className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-400/30 disabled:opacity-50"
                    >
                      <ChevronLeft size={18} className="mr-2" />
                      PREV
                    </Button>

                    <div className="flex gap-2">
                      {pitchDeck.slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentSlide ? "bg-cyan-400" : "bg-slate-600"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        ></button>
                      ))}
                    </div>

                    <Button
                      onClick={handleNextSlide}
                      disabled={currentSlide === pitchDeck.slides.length - 1}
                      className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-400/30 disabled:opacity-50"
                    >
                      NEXT
                      <ChevronRight size={18} className="ml-2" />
                    </Button>
                  </div>

                  {/* Download Options */}
                  <div className="flex gap-2 justify-end flex-wrap">
                    <Button
                      onClick={copySlideToClipboard}
                      size="sm"
                      className="text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600"
                    >
                      {t.copyToClipboard}
                    </Button>
                    <Button
                      onClick={exportAsPdf}
                      size="sm"
                      className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-300 font-black"
                    >
                      <Download size={14} className="mr-2" />
                      {t.downloadPdf}
                    </Button>
                    <Button
                      onClick={downloadAsMarkdown}
                      size="sm"
                      className="text-sm bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-400/30"
                    >
                      <Download size={14} className="mr-2" />
                      {t.downloadMarkdown}
                    </Button>
                    <Button
                      onClick={downloadAsJson}
                      size="sm"
                      className="text-sm bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-400/30"
                    >
                      <Download size={14} className="mr-2" />
                      {t.downloadJson}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="hidden print:block pitch-deck-print-root">
            {pitchDeck.slides.map((printedSlide, index) => (
              <section className="pitch-deck-print-page" key={printedSlide.number}>
                <div className="pitch-deck-print-meta">
                  <span>{pitchDeck.companyName}</span>
                  <span>{String(index + 1).padStart(2, "0")} / {String(pitchDeck.slides.length).padStart(2, "0")}</span>
                </div>

                {index === 0 ? (
                  <div className="pitch-deck-print-cover">
                    <p className="pitch-deck-print-kicker">{t.pitchDeck}</p>
                    <h1>{pitchDeck.companyName}</h1>
                    <h2>{pitchDeck.pitchTitle}</h2>
                    <ul>
                      {printedSlide.content.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="pitch-deck-print-content">
                    <p className="pitch-deck-print-kicker">{t.slide} {printedSlide.number}</p>
                    <h1>{printedSlide.title}</h1>
                    <ul>
                      {printedSlide.content.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {printedSlide.notes && (
                  <aside className="pitch-deck-print-notes">
                    <strong>{index === 0 ? pitchDeck.pitchTitle : t.notes}</strong>
                    <p>{printedSlide.notes}</p>
                  </aside>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
