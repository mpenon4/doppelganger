import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const doppelgangerSchema = z.object({
  companyName: z.string().describe('The name of the matched company'),
  description: z.string().describe('A one-line description of what the company did'),
  foundingYear: z.number().describe('The year the company was founded'),
  timeline: z.array(
    z.object({
      month: z.string().describe('The time period, e.g., "Month 1", "Month 3", "Month 6", "Month 12", "Year 2"'),
      title: z.string().describe('A short title for this milestone'),
      description: z.string().describe('What happened at this stage'),
      type: z.enum(['milestone', 'warning', 'failure', 'success']).describe('The nature of this event'),
    })
  ).describe('5-6 key events in the company timeline'),
  outcome: z.enum(['alive', 'dead', 'acquired']).describe('The final outcome of the company'),
  wrongMoves: z.array(z.string()).describe('2-3 brutal lessons about what they did wrong'),
  recommendations: z.array(z.string()).describe('3 concrete actions the user should do differently'),
  similarityScore: z.number().min(0).max(100).describe('How similar this company is to the described startup (0-100)'),
  confidence: z.number().min(0).max(100).describe('How confident you are in this match (0-100)'),
})

export async function POST(request: Request) {
  try {
    const { description } = await request.json()

    if (!description || typeof description !== 'string') {
      return Response.json({ error: 'Description is required' }, { status: 400 })
    }

    // Check for easter egg
    if (description.toLowerCase().includes('my startup is dead')) {
      return Response.json({
        easterEgg: true,
        message: "🪦 We know. That's why you're here.",
      })
    }

    const result = await generateObject({
      model: 'anthropic/claude-sonnet-4-20250514',
      schema: doppelgangerSchema,
      tools: {
        webSearch: {
          type: 'webSearch' as const,
        },
      },
      maxSteps: 5,
      system: `You are Doppelganger, an AI that finds startup "twins" - companies that attempted similar ideas in the past.
      
Your job is to:
1. Analyze the user's startup description
2. Search for real startups that attempted something similar (focus on failed or acquired startups for maximum learning value)
3. Provide a detailed, BRUTALLY HONEST analysis of that company's journey

When searching, look for:
- Companies from Product Hunt, TechCrunch, Crunchbase
- Failed startups in the same space
- Acquired companies that pivoted or died
- Historical attempts at similar problems

Be specific with dates, events, and lessons. The user wants REAL insights, not generic advice.
Make the wrongMoves section brutally honest - these are autopsy lessons.
Make recommendations concrete and actionable.

IMPORTANT: Find a REAL company if possible. Use web search to verify facts. If you can't find a perfect match, find the closest comparable company and explain why it's similar.`,
      prompt: `Find the startup doppelganger for this idea: "${description}"
      
Search for real companies that attempted something similar. Focus on ones that failed, pivoted dramatically, or were acquired under difficult circumstances - these provide the best lessons.

Return detailed, verified information about the matching company.`,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error('Error finding doppelganger:', error)
    return Response.json(
      { error: 'Failed to find your doppelganger. Please try again.' },
      { status: 500 }
    )
  }
}
