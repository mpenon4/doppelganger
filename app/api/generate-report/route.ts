import { generateText, stepCountIs } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { createMCPClient } from '@ai-sdk/mcp'

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
  "companyName": "El nombre de la empresa/startup (invéntalo si no está explícito).",
  "companySummary": "Un resumen claro de lo que hace tu empresa, destacando cómo utiliza la IA.",
  "executiveSummary": "Un resumen ejecutivo contundente de 2 párrafos sobre por qué esta versión de la idea tiene potencial de mercado si se ejecuta correctamente.",
  "swot": {
    "strengths": ["Fuerza 1", "Fuerza 2", "Fuerza 3"],
    "weaknesses": ["Debilidad 1", "Debilidad 2", "Debilidad 3"],
    "opportunities": ["Oportunidad 1", "Oportunidad 2", "Oportunidad 3"],
    "threats": ["Amenaza 1", "Amenaza 2", "Amenaza 3"]
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
- **REGLA DE IDIOMA**: ABSOLUTAMENTE TODOS LOS TEXTOS DENTRO DEL JSON DEBEN ESTAR EN ESPAÑOL (SPANISH). SIN EXCEPCIONES.
- **REGLA DE FODA**: DEBES INCLUIR UN MÍNIMO DE 3 ELEMENTOS EN CADA CATEGORÍA DEL FODA (strengths, weaknesses, opportunities, threats).`
  }

  return `You are DOPPELGANGER, a Go-to-Market strategy analyst and business structuring expert.
Your task is to generate a Final Executive Report and Attack Plan for a startup, based on the iterated idea the user has selected as the winner.

MANDATORY FORMAT (STRICT JSON):
{
  "companyName": "The proposed name for the startup (invent one if not explicit).",
  "companySummary": "A clear summary of what the company does, highlighting how it uses AI.",
  "executiveSummary": "A punchy 2-paragraph executive summary on why this version of the idea has market potential if executed correctly.",
  "swot": {
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
    "threats": ["Threat 1", "Threat 2", "Threat 3"]
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
- **LANGUAGE RULE**: ABSOLUTELY ALL TEXT INSIDE THE JSON MUST BE IN ENGLISH. NO EXCEPTIONS.
- **SWOT RULE**: YOU MUST INCLUDE A MINIMUM OF 3 ITEMS IN EACH SWOT CATEGORY (strengths, weaknesses, opportunities, threats).`
}

export async function POST(request: Request) {
  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null

  try {
    const { idea, lang = 'en', context } = await request.json()

    if (!idea || typeof idea !== 'string') {
      return Response.json({ error: 'Idea is required' }, { status: 400 })
    }

    let mcpTools: Record<string, any> = {}
    const tavilyApiKey = process.env.TAVILY_API_KEY

    if (tavilyApiKey) {
      try {
        mcpClient = await createMCPClient({
          transport: {
            type: 'sse',
            url: `https://mcp.tavily.com/mcp/?tavilyApiKey=${tavilyApiKey}`,
          },
        })
        mcpTools = await mcpClient.tools()
      } catch (mcpError) {
        console.warn('[Report MCP] Failed to connect to Tavily MCP:', mcpError)
      }
    }

    const systemPrompt = getSystemPrompt(lang as 'en' | 'es')
    const searchInstruction = Object.keys(mcpTools).length > 0
      ? (lang === 'es' 
          ? '\n\nOBLIGATORIO: Utiliza la herramienta tavily_search para investigar profundamente la idea actual en el mercado y fundamentar el análisis FODA con datos, tendencias y competidores reales antes de escribir la respuesta.'
          : '\n\nMANDATORY: Use the tavily_search tool to deeply investigate the current idea in the market and back the SWOT analysis with real data, trends, and actual competitors before writing the response.')
      : ''

    const basePrompt = lang === 'es' ? 'Investiga y genera el reporte final para esta idea' : 'Research and generate the final report for this idea'
    const contextPrompt = context 
      ? (lang === 'es' 
          ? `\n\nEl usuario también proporcionó este nombre tentativo o contexto adicional sobre cómo lo quiere ejecutar: "${context}"` 
          : `\n\nThe user also provided this tentative name or additional context on how they want to execute it: "${context}"`) 
      : ''

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      tools: mcpTools,
      stopWhen: stepCountIs(5),
      maxOutputTokens: 6000,
      temperature: 0.2,
      system: systemPrompt,
      prompt: `${basePrompt}: "${idea}"${contextPrompt}${searchInstruction}`,
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
  } finally {
    if (mcpClient) {
      try {
        await mcpClient.close()
      } catch {}
    }
  }
}
