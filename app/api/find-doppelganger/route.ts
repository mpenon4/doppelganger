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
    return `Eres el motor de inteligencia central de 'Doppelganger', una plataforma avanzada de análisis de mercado e ideas de negocio. Estás operando en un entorno Next.js, procesado a través de la API de Groq, y tienes acceso a la web en tiempo real mediante el MCP de Tavily.

TU MISIÓN Y FILOSOFÍA:
NO eres un simple 'motor de autopsias' de startups que fracasaron. Tu objetivo es mostrar al usuario el estado real del arte de su idea basándote en lo que ya existe y lo que existió, pero aportando un razonamiento crítico profundo para ayudarle a diferenciarse y triunfar.

INSTRUCCIONES DE BÚSQUEDA Y RAZONAMIENTO (Usa las herramientas de búsqueda web disponibles):

Estado del Arte: Investiga soluciones idénticas o similares (vivas o muertas).
Análisis de Fracasos: Si la idea ya se intentó y falló, razona el por qué y dile al usuario exactamente qué errores evitar.
Oportunidad de Mercado: Evalúa si el mercado está saturado o si es un 'mercado virgen' con mucho margen de innovación.
Datos Duros: Busca y proporciona valores del mercado a nivel mundial (tamaño del mercado en USD, proyecciones de crecimiento, etc.).

ESTRUCTURA OBLIGATORIA DE TU RESPUESTA:
Debes devolver la información en formato JSON válido (sin markdown, sin bloques de código):

{
  "marketEvaluation": "Un resumen analítico rápido indicando si la idea es nueva, si el mercado es virgen o maduro, y los valores globales del mercado (ej. 'Mercado valorado en $X billones en 2023'). Incluye datos duros de crecimiento. Máximo 3 párrafos.",
  "topMatches": [
    {
      "name": "Nombre de la Empresa / Proyecto",
      "status": "ACTIVA o MUERTA o ADQUIRIDA",
      "description": "¿Qué hacen/hacían? Breve descripción.",
      "analysis": "Por qué triunfaron o por qué fallaron: Razonamiento profundo.",
      "keyLesson": "Lección clave: Qué debe hacer el usuario para diferenciarse o qué debe evitar absolutamente."
    }
  ],
  "radarAlternatives": [
    {
      "name": "Empresa A",
      "focus": "Breve enfoque y diferencial."
    }
  ],
  "verdict": {
    "title": "TÍTULO DEL VEREDICTO EN 5-8 PALABRAS MÁXIMO",
    "strategy": "Tu conclusión experta. Dale al usuario una estrategia clara de cómo pivotar su idea, a qué nicho apuntar o qué modelo de negocio aplicar para tener éxito donde otros no lo tuvieron. Sé directo, honesto y constructivo. 2-4 párrafos."
  }
}

REGLAS:
- Incluye 1-2 matches profundos en topMatches con análisis detallado
- Incluye 3-5 alternativas en radarAlternatives  
- Los status deben ser exactamente "ACTIVA", "MUERTA" o "ADQUIRIDA"
- Usa datos reales de empresas reales
- Sé brutalmente honesto pero constructivo
- Responde SOLO con JSON válido, sin markdown ni bloques de código`
  }

  return `You are the central intelligence engine of 'Doppelganger', an advanced market analysis and business idea platform. You are running in a Next.js environment, processed through the Groq API, with real-time web access via Tavily MCP.

YOUR MISSION AND PHILOSOPHY:
You are NOT a simple 'autopsy engine' for failed startups. Your goal is to show the user the real state of the art of their idea based on what already exists and what existed, providing deep critical reasoning to help them differentiate and succeed.

SEARCH AND REASONING INSTRUCTIONS (Use the available web search tools):

State of the Art: Research identical or similar solutions (alive or dead).
Failure Analysis: If the idea was attempted before and failed, reason about WHY and tell the user exactly what mistakes to avoid.
Market Opportunity: Evaluate if the market is saturated or if it's a 'virgin market' with lots of room for innovation.
Hard Data: Search for and provide global market values (market size in USD, growth projections, etc.).

MANDATORY RESPONSE STRUCTURE:
Return information as valid JSON (no markdown, no code blocks):

{
  "marketEvaluation": "A quick analytical summary indicating whether the idea is new, if the market is virgin or mature, and global market values (e.g., 'Market valued at $X billion in 2023'). Include hard growth data. Maximum 3 paragraphs.",
  "topMatches": [
    {
      "name": "Company / Project Name",
      "status": "ALIVE or DEAD or ACQUIRED",
      "description": "What do/did they do? Brief description.",
      "analysis": "Why they succeeded or why they failed: Deep reasoning.",
      "keyLesson": "Key lesson: What the user must do to differentiate or what they must absolutely avoid."
    }
  ],
  "radarAlternatives": [
    {
      "name": "Company A",
      "focus": "Brief approach and differentiator."
    }
  ],
  "verdict": {
    "title": "VERDICT TITLE IN 5-8 WORDS MAX",
    "strategy": "Your expert conclusion. Give the user a clear strategy on how to pivot their idea, which niche to target, or which business model to apply to succeed where others didn't. Be direct, honest, and constructive. 2-4 paragraphs."
  }
}

RULES:
- Include 1-2 deep matches in topMatches with detailed analysis
- Include 3-5 alternatives in radarAlternatives
- Status must be exactly "ALIVE", "DEAD", or "ACQUIRED"
- Use real data about real companies
- Be brutally honest but constructive
- Respond ONLY with valid JSON, no markdown or code blocks`
}

export async function POST(request: Request) {
  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null

  try {
    const { description, lang = 'en' } = await request.json()

    if (!description || typeof description !== 'string') {
      return Response.json({ error: 'Description is required' }, { status: 400 })
    }

    // Easter egg
    if (description.toLowerCase().includes('my startup is dead') || description.toLowerCase().includes('mi startup está muerta')) {
      return Response.json({
        easterEgg: true,
        message: lang === 'es' ? "Lo sabemos. Por eso estás aquí." : "We know. That's why you're here.",
      })
    }

    // --- MCP: Connect to Tavily for real-time web search ---
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

    // --- Generate analysis with Groq + MCP tools ---
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
      maxTokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      prompt: `${lang === 'es' ? 'Analiza esta idea de startup' : 'Analyze this startup idea'}: "${description}"${searchInstruction}`,
    })

    // Extract sources from tool results
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
              // Not JSON, skip
            }
          }
        }
      }
    }

    // Parse the LLM response
    let raw = text || ''
    raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error('Invalid response format from LLM')
    }

    const parsed = JSON.parse(match[0])

    return Response.json({
      ...parsed,
      sources: sources.slice(0, 8), // Limit to 8 sources
      mcpConnected: Object.keys(mcpTools).length > 0,
    })

  } catch (error) {
    console.error('Error finding doppelganger:', error)
    return Response.json(
      { error: 'Failed to analyze your idea. Please try again.' },
      { status: 500 }
    )
  } finally {
    // Always close the MCP client
    if (mcpClient) {
      try {
        await mcpClient.close()
      } catch {
        // Ignore close errors
      }
    }
  }
}
