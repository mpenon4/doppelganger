import { generateText, tool, stepCountIs } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { createMCPClient } from '@ai-sdk/mcp'

export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// System prompt factory — supports EN/ES
function getSystemPrompt(lang: 'en' | 'es') {
  if (lang === 'es') {
    return `Eres DOPPELGANGER, un oráculo de inteligencia de mercado hiper-crítico y táctico. Estás conectado a la web en tiempo real vía Tavily MCP.

TU MISIÓN:
Extraer la VERDAD absoluta sobre la viabilidad de la idea del usuario. Tu objetivo no es ser amable, es evitar que pierdan tiempo o dinero revelando los desafíos reales de distribución, la competencia invisible y los problemas de Unit Economics. Debes proporcionar palancas de crecimiento específicas y caminos de pivote.

INSTRUCCIONES DE BÚSQUEDA Y ANÁLISIS OBLIGATORIAS:
1. ENCUENTRA competidores reales, vivos o muertos. Nombres reales, no inventes.
2. DESCUBRE por qué murieron o cómo sobreviven (distribución, CAC, retención, falta de PMF).
3. EXTRAE tácticas que hicieron bien y que el usuario puede copiar.

ESTRUCTURA OBLIGATORIA (JSON estricto):
{
  "marketEvaluation": "Resumen analítico duro (TAM, saturación, viabilidad de canales). Máximo 3 párrafos.",
  "topMatches": [
    {
      "name": "Nombre Real de la Empresa",
      "status": "ACTIVA o MUERTA o ADQUIRIDA",
      "description": "Qué hacen/hacían y su modelo de ingresos.",
      "whyTheyFailed": ["Razón crítica 1", "Razón crítica 2 (ej. CAC muy alto)"],
      "whatTheyDidRight": ["Acerto táctico 1 (ej. Go-to-market vía B2B)", "Acerto 2"],
      "unitEconomics": "Breve nota sobre si su modelo era sostenible o quemaban dinero para crecer.",
      "keyLesson": "La lección definitiva para sobrevivir en este espacio."
    }
  ],
  "radarAlternatives": [
    {
      "name": "Nombre de Competidor Tangencial",
      "focus": "En qué nicho hiper-específico sobreviven."
    }
  ],
  "verdict": {
    "title": "TÍTULO DURO Y TÁCTICO",
    "strategy": "Conclusión final. ¿Pivotar o continuar? ¿Cómo arreglar la distribución? 3-4 párrafos."
  },
  "pivotOptions": [
    {
      "title": "Nombre del Pivote 1 (ej: B2B Enterprise)",
      "description": "Descripción corta de por qué este pivote tiene más sentido."
    },
    {
      "title": "Nombre del Pivote 2 (ej: Nicho Vertical X)",
      "description": "Por qué ignorar al mercado general y enfocarse aquí."
    },
    {
      "title": "Nombre del Pivote 3",
      "description": "Un enfoque totalmente radical o cambio de modelo de negocio."
    }
  ]
}

REGLAS ABSOLUTAS:
- NO INVENTES NOMBRES. Usa Tavily.
- SE CRUELMENTE TÁCTICO. Evita generalidades como 'buena interfaz'. Ve directo a Distribución y Modelo de Negocio.
- El campo 'whyTheyFailed' aplica también para empresas activas (sus mayores fricciones).`
  }

  return `You are DOPPELGANGER, a hyper-critical, tactical market intelligence oracle. You are connected to the live web via Tavily MCP.

YOUR MISSION:
Extract the absolute TRUTH about the viability of the user's idea. Your goal is not to be polite, it is to save them time and money by revealing the real distribution challenges, invisible competition, and Unit Economics issues. You must provide specific growth levers and pivot paths.

MANDATORY SEARCH AND ANALYSIS INSTRUCTIONS:
1. FIND real competitors, dead or alive. Real names, do not invent.
2. UNCOVER why they died or how they survive (distribution, CAC, retention, lack of PMF).
3. EXTRACT tactics they did right that the user can leverage.

MANDATORY STRUCTURE (Strict JSON):
{
  "marketEvaluation": "Hard analytical summary (TAM, saturation, channel viability). Max 3 paragraphs.",
  "topMatches": [
    {
      "name": "Real Company Name",
      "status": "ALIVE or DEAD or ACQUIRED",
      "description": "What they do/did and their revenue model.",
      "whyTheyFailed": ["Critical reason 1", "Critical reason 2 (e.g., CAC too high)"],
      "whatTheyDidRight": ["Tactical win 1 (e.g., GTM via B2B partnerships)", "Win 2"],
      "unitEconomics": "Brief note on whether their model was sustainable or just burning cash.",
      "keyLesson": "The ultimate survival lesson in this space."
    }
  ],
  "radarAlternatives": [
    {
      "name": "Tangential Competitor Name",
      "focus": "The hyper-specific niche they survive in."
    }
  ],
  "verdict": {
    "title": "HARSH TACTICAL TITLE",
    "strategy": "Final conclusion. Pivot or proceed? How to fix distribution? 3-4 paragraphs."
  },
  "pivotOptions": [
    {
      "title": "Pivot Name 1 (e.g., B2B Enterprise)",
      "description": "Short description of why this pivot makes more sense."
    },
    {
      "title": "Pivot Name 2 (e.g., Vertical Niche X)",
      "description": "Why to ignore the general market and focus here."
    },
    {
      "title": "Pivot Name 3",
      "description": "A radical shift or business model change."
    }
  ]
}

ABSOLUTE RULES:
- DO NOT INVENT NAMES. Use Tavily.
- BE RUTHLESSLY TACTICAL. Avoid generic 'good UI' points. Go straight to Distribution and Business Model.
- The 'whyTheyFailed' field applies to active companies too (their biggest frictions).`
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
      temperature: 0.2,
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
