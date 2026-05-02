import { generateText, stepCountIs } from 'ai'
import { createGroq } from '@ai-sdk/groq'

export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

function getSystemPrompt(lang: 'en' | 'es') {
  if (lang === 'es') {
    return `Eres DOPPELGANGER, un analista de estrategia de Go-to-Market y estructuración de negocios.
Tu tarea es generar un Reporte Ejecutivo Final y un Plan de Ataque para una startup, basándote en la idea iterada que el usuario ha seleccionado como ganadora.

FORMATO OBLIGATORIO (JSON ESTRICTO):
{
  "executiveSummary": "Un resumen ejecutivo contundente de 2 párrafos sobre por qué esta versión de la idea tiene potencial de mercado si se ejecuta correctamente.",
  "swot": {
    "strengths": ["Fuerza 1", "Fuerza 2"],
    "weaknesses": ["Debilidad 1", "Debilidad 2"],
    "opportunities": ["Oportunidad 1", "Oportunidad 2"],
    "threats": ["Amenaza 1", "Amenaza 2"]
  },
  "attackPlan": [
    {
      "phase": "Fase 1: Validación y PMF",
      "action": "Lo primero que deben hacer, paso a paso."
    },
    {
      "phase": "Fase 2: Adquisición Temprana",
      "action": "Canal de distribución recomendado con el CAC más bajo posible."
    },
    {
      "phase": "Fase 3: Escalamiento",
      "action": "Cómo protegerse de la competencia y escalar."
    }
  ],
  "finalAdvice": "Un consejo crudo final de 1 párrafo."
}

REGLAS:
- EL FORMATO DEBE SER JSON PERFECTO. Todos los valores de texto DEBEN estar entre comillas dobles. Escapa las comillas internas con barra invertida (\\").
- **REGLA DE IDIOMA**: ABSOLUTAMENTE TODOS LOS TEXTOS DENTRO DEL JSON DEBEN ESTAR EN ESPAÑOL (SPANISH). SIN EXCEPCIONES.`
  }

  return `You are DOPPELGANGER, a Go-to-Market strategy analyst and business structuring expert.
Your task is to generate a Final Executive Report and Attack Plan for a startup, based on the iterated idea the user has selected as the winner.

MANDATORY FORMAT (STRICT JSON):
{
  "executiveSummary": "A punchy 2-paragraph executive summary on why this version of the idea has market potential if executed correctly.",
  "swot": {
    "strengths": ["Strength 1", "Strength 2"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "threats": ["Threat 1", "Threat 2"]
  },
  "attackPlan": [
    {
      "phase": "Phase 1: Validation & PMF",
      "action": "The very first thing they must do, step by step."
    },
    {
      "phase": "Phase 2: Early Acquisition",
      "action": "Recommended distribution channel with the lowest possible CAC."
    },
    {
      "phase": "Phase 3: Scaling",
      "action": "How to build a moat and scale."
    }
  ],
  "finalAdvice": "One raw, final piece of advice (1 paragraph)."
}

RULES:
- FORMAT MUST BE PERFECT JSON. All text values MUST be enclosed in double quotes. Escape any internal quotes with a backslash (\\").
- **LANGUAGE RULE**: ABSOLUTELY ALL TEXT INSIDE THE JSON MUST BE IN ENGLISH. NO EXCEPTIONS.`
}

export async function POST(request: Request) {
  try {
    const { idea, lang = 'en' } = await request.json()

    if (!idea || typeof idea !== 'string') {
      return Response.json({ error: 'Idea is required' }, { status: 400 })
    }

    const systemPrompt = getSystemPrompt(lang as 'en' | 'es')

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      maxTokens: 4000,
      temperature: 0.2,
      system: systemPrompt,
      prompt: `${lang === 'es' ? 'Genera el reporte final para esta idea' : 'Generate the final report for this idea'}: "${idea}"`,
    })

    let raw = text || ''
    raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const match = raw.match(/\{[\s\S]*\}/)
    
    if (!match) {
      console.error('Raw LLM Output:', raw)
      throw new Error('Invalid response format from LLM')
    }

    const parsed = JSON.parse(match[0])
    return Response.json(parsed)

  } catch (error: any) {
    console.error('Error generating report:', error)
    return Response.json(
      { error: error?.message || 'Failed to generate report.' },
      { status: 500 }
    )
  }
}
