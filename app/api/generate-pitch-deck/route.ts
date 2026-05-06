import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

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
  attackPlan: { phase: string; action: string }[]
  finalAdvice: string
}

interface ResearchContext {
  realCompetitors?: Array<{
    name?: string
    founded?: string
    funding?: string
    status?: string
    description?: string
    url?: string
  }>
  marketEvaluation?: string
  topMatches?: Array<{
    name?: string
    status?: string
    description?: string
    whyTheyFailed?: string[]
    whatTheyDidRight?: string[]
    unitEconomics?: string
    keyLesson?: string
  }>
  radarAlternatives?: Array<{ name?: string; focus?: string }>
  verdict?: { title?: string; strategy?: string }
  pivotOptions?: Array<{ title?: string; description?: string }>
  sources?: Array<{ title?: string; url?: string }>
}

interface PitchDeckSlide {
  number: number
  title: string
  content: string[]
  notes?: string
}

interface PitchDeckOutput {
  companyName: string
  pitchTitle: string
  slides: PitchDeckSlide[]
}

function formatResearch(research?: ResearchContext) {
  const realCompetitors = research?.realCompetitors
    ?.map((c) =>
      [
        `- ${c.name || "Unknown"} (${c.status || "unknown"})`,
        c.founded ? `  Founded: ${c.founded}` : "",
        c.funding ? `  Funding: ${c.funding}` : "",
        c.description ? `  Description: ${c.description}` : "",
        c.url ? `  URL: ${c.url}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n")
  const competitors = research?.topMatches
    ?.map((c) =>
      [
        `- ${c.name || "Unknown"} (${c.status || "unknown"})`,
        c.description ? `  Description: ${c.description}` : "",
        c.unitEconomics ? `  Unit economics: ${c.unitEconomics}` : "",
        c.keyLesson ? `  Key lesson: ${c.keyLesson}` : "",
        c.whyTheyFailed?.length ? `  Frictions: ${c.whyTheyFailed.join("; ")}` : "",
        c.whatTheyDidRight?.length ? `  Tactical wins: ${c.whatTheyDidRight.join("; ")}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n")

  return {
    realCompetitors: realCompetitors || "Not provided",
    competitors: competitors || "Not provided",
    radar: research?.radarAlternatives?.map((r) => `- ${r.name}: ${r.focus}`).join("\n") || "Not provided",
    pivots: research?.pivotOptions?.map((p) => `- ${p.title}: ${p.description}`).join("\n") || "Not provided",
    sources: research?.sources?.map((s) => `- ${s.title}: ${s.url}`).join("\n") || "Not provided",
    marketEvaluation: research?.marketEvaluation || "Not provided",
    verdict: `${research?.verdict?.title || ""} ${research?.verdict?.strategy || ""}`.trim() || "Not provided",
  }
}

function getPitchDeckPrompt(report: FinalReport, research: ResearchContext | undefined, lang: "en" | "es") {
  const gtmPlan = report.attackPlan.map((p) => `${p.phase}: ${p.action}`).join("\n")
  const researchText = formatResearch(research)

  if (lang === "en") {
    return `You are a senior pitch deck strategist for venture fundraising.

Create a polished investor pitch deck from the executive report and market research. The output will be exported as a PDF, one slide per page, so every slide must feel complete and presentation-ready.

EXECUTIVE REPORT:
Company: ${report.companyName}
Summary: ${report.companySummary}
Executive summary: ${report.executiveSummary}

SWOT:
Strengths: ${report.swot.strengths.join(", ")}
Weaknesses: ${report.swot.weaknesses.join(", ")}
Opportunities: ${report.swot.opportunities.join(", ")}
Threats: ${report.swot.threats.join(", ")}

GTM plan:
${gtmPlan}

Final advice: ${report.finalAdvice}

MARKET RESEARCH CONTEXT:
Market evaluation: ${researchText.marketEvaluation}
Structured company data:
${researchText.realCompetitors}
Competitors and lessons:
${researchText.competitors}
Radar alternatives:
${researchText.radar}
Verdict: ${researchText.verdict}
Pivot options:
${researchText.pivots}
Sources:
${researchText.sources}

MANDATORY INSTRUCTIONS:
1. Generate 8 to 10 slides unless the material truly supports only 5 to 7. Never generate fewer than 5.
2. Use a professional pitch deck sequence: cover, problem, market/research insight, solution, product/value proposition, evidence, business model, go-to-market, competition/positioning, ask/next steps.
3. Every slide must be information-rich: 4 to 6 concise bullets, each up to 18 words.
4. Use research in the deck: competitors, unit economics, market evaluation, tactical lessons, threats, sources, and GTM evidence.
5. Speaker notes must be 1 to 2 complete sentences explaining what the presenter should say with research context.
6. Do not invent exact metrics unless they are explicitly in the report. If no metric exists, phrase it as a hypothesis or validation target.
7. Do not include founder names, team members, dates, current date, funding amount, revenue, users, or traction unless explicitly provided.
8. Never use placeholders like [Founder Name], [Current Date], TBD, N/A, or "to be defined". Omit missing information instead.
9. Make the deck feel like a software product pitch: emphasize workflows, product capabilities, market intelligence, automation, outputs, and investor value.
10. Return valid parseable JSON only.

JSON structure:
{
  "companyName": "name",
  "pitchTitle": "presentation title",
  "slides": [
    {
      "number": 1,
      "title": "short title",
      "content": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
      "notes": "speaker notes"
    }
  ]
}

All text values must be in English.`
  }

  return `Eres un estratega senior de pitch decks para fundraising venture.

Crea un pitch deck profesional para inversores a partir del informe ejecutivo y el research de mercado. El resultado se exportara como PDF, una filmina por pagina, asi que cada slide debe quedar completo y listo para presentar.

REPORTE EJECUTIVO:
Nombre: ${report.companyName}
Resumen: ${report.companySummary}
Resumen ejecutivo: ${report.executiveSummary}

FODA:
Fortalezas: ${report.swot.strengths.join(", ")}
Debilidades: ${report.swot.weaknesses.join(", ")}
Oportunidades: ${report.swot.opportunities.join(", ")}
Amenazas: ${report.swot.threats.join(", ")}

Plan GTM:
${gtmPlan}

Consejo final: ${report.finalAdvice}

CONTEXTO DE RESEARCH DE MERCADO:
Evaluacion del mercado: ${researchText.marketEvaluation}
Datos estructurados de companias:
${researchText.realCompetitors}
Competidores y aprendizajes:
${researchText.competitors}
Alternativas en radar:
${researchText.radar}
Veredicto: ${researchText.verdict}
Opciones de pivote:
${researchText.pivots}
Fuentes:
${researchText.sources}

INSTRUCCIONES OBLIGATORIAS:
1. Genera de 8 a 10 diapositivas salvo que el material realmente alcance solo para 5 a 7. Nunca menos de 5.
2. Usa una secuencia profesional de pitch deck: portada, problema, insight de mercado, solucion, producto/propuesta de valor, evidencia, modelo de negocio, go-to-market, competencia/posicionamiento, financiacion/proximos pasos.
3. Cada slide debe estar completo: 4 a 6 bullets sustanciosos, maximo 18 palabras cada uno.
4. Usa el research dentro del deck: competidores, unit economics, evaluacion de mercado, tacticas, amenazas, fuentes y estrategia GTM.
5. Las notas del orador deben tener 1 a 2 frases completas con contexto del research.
6. No inventes metricas exactas si no estan en el informe. Si faltan datos, formulalo como hipotesis o meta de validacion.
7. No incluyas nombres de fundadores, equipo, fecha, fecha actual, monto a levantar, revenue, usuarios o traccion salvo que esten explicitamente provistos.
8. Nunca uses placeholders como [Nombre del fundador], [Fecha actual], TBD, N/A o "por definir". Si falta informacion, omitila.
9. Hacé que el deck se sienta como pitch de producto software: enfatizá workflows, capacidades, inteligencia de mercado, automatización, outputs y valor para inversores.
10. Devuelve solo JSON valido y parseable.

Estructura JSON:
{
  "companyName": "nombre",
  "pitchTitle": "titulo de la presentacion",
  "slides": [
    {
      "number": 1,
      "title": "titulo corto",
      "content": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
      "notes": "notas del orador"
    }
  ]
}

Todos los valores de texto deben estar en ESPANOL.`
}

export async function POST(request: Request) {
  try {
    const { report, research, lang = "es" } = await request.json()

    if (!report) {
      return Response.json({ error: "Report data is required" }, { status: 400 })
    }

    const prompt = getPitchDeckPrompt(
      report as FinalReport,
      research as ResearchContext | undefined,
      lang as "en" | "es"
    )

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.55,
      maxOutputTokens: 3800,
    })

    const raw = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not parse pitch deck structure from AI response")
    }

    const pitchDeck: PitchDeckOutput = JSON.parse(jsonMatch[0])

    if (!Array.isArray(pitchDeck.slides) || pitchDeck.slides.length < 5 || pitchDeck.slides.length > 10) {
      throw new Error("Pitch deck must have between 5 and 10 slides")
    }

    return Response.json(pitchDeck)
  } catch (error) {
    console.error("Pitch deck generation error:", error)
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate pitch deck",
      },
      { status: 500 }
    )
  }
}
