import { generateText, tool, stepCountIs } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { createMCPClient } from '@ai-sdk/mcp'
import { z } from 'zod'

export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// System prompt factory — supports EN/ES
function getSystemPrompt(lang: 'en' | 'es') {
  if (lang === 'es') {
    return `Eres DOPPELGANGER, un analista de venture capital y estrategia de mercado extremadamente riguroso y brutalmente honesto. Estás operando en un entorno Next.js con acceso a internet en tiempo real vía Tavily MCP.

TU MISIÓN:
Destrozar las ilusiones del usuario con DATOS DUROS, pero reconstruir su idea dándole un PIVOTE accionable basado en por qué fallaron otros. No uses descripciones genéricas ni lenguaje de marketing. Escribe como si le estuvieras entregando un reporte a la junta directiva.

INSTRUCCIONES DE BÚSQUEDA Y ANÁLISIS (Usa las herramientas de búsqueda web obligatoriamente):
1. INVESTIGA la idea de forma hiper-específica. Encuentra nombres reales de startups que hacen o intentaron hacer exactamente lo mismo.
2. BUSCA post-mortems y artículos sobre por qué fracasaron (distribución, CAC, retención, falta de PMF, unit economics).
3. BUSCA datos duros del mercado (tamaño real, barreras de entrada reales).

ESTRUCTURA OBLIGATORIA DE TU RESPUESTA:
Debes devolver la información en formato JSON válido (sin markdown fuera de los valores, sin bloques de código):

{
  "marketEvaluation": "Escribe 3-4 párrafos densos. Menciona el TAM (Total Addressable Market) real. Destroza o valida la idea basándote en la saturación del mercado, la viabilidad de los canales de distribución, los problemas de retención inherentes a este modelo y los unit economics. Usa Markdown interno (negritas, listas cortas) para que sea legible.",
  "topMatches": [
    {
      "name": "Nombre Real de Empresa",
      "status": "ACTIVA o MUERTA o ADQUIRIDA",
      "description": "Qué hacían exactamente, cuál era su modelo de negocio y canal de adquisición principal.",
      "analysis": "Un análisis profundo y despiadado de su Product-Market Fit. Por qué murieron o por qué sobrevivieron. Habla de su CAC, LTV o problemas operativos específicos que sufrieron. NADA de respuestas genéricas.",
      "keyLesson": "Una instrucción directa y accionable (ej: 'No intentes adquirir usuarios por B2C orgánico, ve directamente B2B corporativo vendiendo a RRHH')."
    }
  ],
  "radarAlternatives": [
    {
      "name": "Nombre Real",
      "focus": "En qué nicho hiper-específico se enfocaron para no morir."
    }
  ],
  "verdict": {
    "title": "TÍTULO CONSTRUCTIVO PERO DURO (5-8 palabras)",
    "strategy": "Escribe 4-5 párrafos. ¿Debería el usuario abandonar la idea? ¿Debería pivotar a un nicho B2B? ¿Cómo soluciona el problema de distribución que mató a los demás? Dale una estrategia de Go-To-Market detallada y realista. Usa Markdown (negritas) para enfatizar."
  }
}

REGLAS ABSOLUTAS:
- INVENTAR DATOS ES INACEPTABLE. Si no encuentras algo, búscalo con la herramienta MCP o usa modelos análogos reales.
- El JSON debe ser perfecto.
- Exige profundidad. Evita frases como 'ofrece una buena experiencia de usuario'. Habla de CAC, retención, Go-to-Market y fricción operacional.`
  }

  return `You are DOPPELGANGER, an extremely rigorous and brutally honest venture capital analyst and market strategist. You operate in a Next.js environment with real-time internet access via Tavily MCP.

YOUR MISSION:
Destroy the user's illusions with HARD DATA, but reconstruct their idea by giving them an actionable PIVOT based on why others failed. Do not use generic descriptions or marketing speak. Write as if you are delivering a report to a board of directors.

SEARCH AND ANALYSIS INSTRUCTIONS (You MUST use the web search tools):
1. RESEARCH the idea hyper-specifically. Find real names of startups that do or tried to do exactly the same thing.
2. SEARCH for post-mortems and articles about why they failed (distribution, CAC, retention, lack of PMF, unit economics).
3. SEARCH for hard market data (real TAM, real barriers to entry).

MANDATORY RESPONSE STRUCTURE:
Return information as valid JSON (no markdown outside the values, no code blocks):

{
  "marketEvaluation": "Write 3-4 dense paragraphs. Mention the real TAM. Destroy or validate the idea based on market saturation, viability of distribution channels, inherent retention problems, and unit economics. Use internal Markdown (bolding, short lists) for readability.",
  "topMatches": [
    {
      "name": "Real Company Name",
      "status": "ALIVE or DEAD or ACQUIRED",
      "description": "Exactly what they did, their business model, and primary acquisition channel.",
      "analysis": "A deep, ruthless analysis of their Product-Market Fit. Why they died or survived. Talk about their CAC, LTV, or specific operational problems they suffered. NO generic answers.",
      "keyLesson": "A direct, actionable instruction (e.g., 'Do not try to acquire users via organic B2C, go straight B2B corporate selling to HR')."
    }
  ],
  "radarAlternatives": [
    {
      "name": "Real Name",
      "focus": "Which hyper-specific niche they focused on to avoid dying."
    }
  ],
  "verdict": {
    "title": "CONSTRUCTIVE BUT HARSH TITLE (5-8 words)",
    "strategy": "Write 4-5 paragraphs. Should the user abandon the idea? Should they pivot to a B2B niche? How do they solve the distribution problem that killed the others? Give them a detailed, realistic Go-To-Market strategy. Use Markdown (bolding) for emphasis."
  }
}

ABSOLUTE RULES:
- INVENTING DATA IS UNACCEPTABLE. If you can't find something, search for it using the MCP tool or use real analogous models.
- JSON must be perfect.
- Demand depth. Avoid phrases like 'offers a good user experience'. Talk about CAC, retention, Go-to-Market, and operational friction.`
}

export async function POST(request: Request) {
  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null

  try {
    const { description, lang = 'en' } = await request.json()

    if (!description || typeof description !== 'string') {
      return Response.json({ error: 'Description is required' }, { status: 400 })
    }

    if (description.toLowerCase().includes('my startup is dead') || description.toLowerCase().includes('mi startup está muerta')) {
      return Response.json({
        easterEgg: true,
        message: lang === 'es' ? "Lo sabemos. Por eso estás aquí." : "We know. That's why you're here.",
      })
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
        console.log('[MCP] Connected to Tavily MCP. Tools:', Object.keys(mcpTools))
      } catch (mcpError) {
        console.warn('[MCP] Failed to connect to Tavily MCP, falling back to LLM-only:', mcpError)
      }
    } else {
      console.warn('[MCP] No TAVILY_API_KEY set, running in LLM-only mode')
    }

    const systemPrompt = getSystemPrompt(lang as 'en' | 'es')
    
    const searchInstruction = Object.keys(mcpTools).length > 0
      ? `\n\nIMPORTANT: You have web search tools available. USE THEM to perform a deep, rigorous investigation about this idea BEFORE generating your response. Search for:
1. "${description}" exact competitors and similar startups
2. Specific distribution channels and unit economics challenges for "${description}"
3. "${description}" startup post-mortems and specific reasons why they failed (distribution, CAC, retention, etc.)

You must base your analysis on REAL data, REAL companies, and REAL sources. Do not hallucinate.`
      : ''

    const { text, steps } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      tools: mcpTools,
      stopWhen: stepCountIs(6),
      maxTokens: 6000,
      temperature: 0.3, // Lower temperature for more analytical/factual output
      system: systemPrompt,
      prompt: `${lang === 'es' ? 'Analiza rigurosamente esta idea de startup' : 'Rigorously analyze this startup idea'}: "${description}"${searchInstruction}`,
    })

    const sources: Array<{ title: string; url: string }> = []
    if (steps) {
      for (const step of steps) {
        if (step.toolResults) {
          for (const result of step.toolResults) {
            try {
              const parsed = typeof result.result === 'string' ? JSON.parse(result.result) : result.result
              if (parsed?.results) {
                for (const r of parsed.results) {
                  if (r.url && r.title) {
                    sources.push({ title: r.title, url: r.url })
                  }
                }
              }
            } catch {
              // skip
            }
          }
        }
      }
    }

    let raw = text || ''
    raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error('Invalid response format from LLM')
    }

    const parsed = JSON.parse(match[0])

    return Response.json({
      ...parsed,
      sources: sources.slice(0, 10),
      mcpConnected: Object.keys(mcpTools).length > 0,
    })

  } catch (error) {
    console.error('Error finding doppelganger:', error)
    return Response.json(
      { error: 'Failed to analyze your idea. Please try again.' },
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
