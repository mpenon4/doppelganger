interface RealCompetitor {
  name: string
  founded: string
  funding: string
  status: "active" | "dead" | "pivoted"
  description: string
  url: string
}

interface PdlCompany {
  name?: string
  founded?: number | string
  website?: string
  summary?: string
  headline?: string
  industry?: string
  type?: string
  status?: string
  total_funding_raised?: number
  latest_funding_stage?: string
  tags?: string[]
}

interface PdlSearchResponse {
  status?: number
  data?: PdlCompany[]
  error?: string
}

const PDL_COMPANY_SEARCH_URL = "https://api.peopledatalabs.com/v5/company/search"

function sanitizeIdeaForSql(idea: string) {
  return idea
    .replace(/['"\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
}

function extractSearchTerms(idea: string) {
  const stopWords = new Set([
    "the", "and", "for", "with", "that", "this", "from", "into", "para", "con", "una", "uno",
    "los", "las", "del", "que", "por", "como", "startup", "empresa", "app", "idea",
  ])

  return sanitizeIdeaForSql(idea)
    .toLowerCase()
    .split(" ")
    .map((word) => word.replace(/[^a-z0-9]/g, ""))
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 6)
}

function formatFunding(company: PdlCompany) {
  if (typeof company.total_funding_raised !== "number" || company.total_funding_raised <= 0) {
    return company.latest_funding_stage || "Unknown"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(company.total_funding_raised)
}

function mapStatus(company: PdlCompany): RealCompetitor["status"] {
  const rawStatus = `${company.status || ""} ${company.type || ""}`.toLowerCase()

  if (rawStatus.includes("inactive") || rawStatus.includes("closed") || rawStatus.includes("dead")) {
    return "dead"
  }

  if (rawStatus.includes("pivot")) {
    return "pivoted"
  }

  return "active"
}

function mapPdlCompany(company: PdlCompany): RealCompetitor | null {
  if (!company.name) return null

  const url = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : ""

  return {
    name: company.name,
    founded: company.founded ? String(company.founded) : "Unknown",
    funding: formatFunding(company),
    status: mapStatus(company),
    description: company.summary || company.headline || company.industry || "No description available",
    url,
  }
}

export async function fetchRealCompetitors(idea: string): Promise<RealCompetitor[]> {
  const apiKey = process.env.PEOPLE_DATA_LABS_API_KEY

  if (!apiKey) {
    console.warn("[CompetitorData] PEOPLE_DATA_LABS_API_KEY is not set; returning empty competitor list.")
    return []
  }

  const terms = extractSearchTerms(idea)
  if (terms.length === 0) return []

  const sqlClauses = terms.flatMap((term) => [
    `summary LIKE '%${term}%'`,
    `industry LIKE '%${term}%'`,
    `tags = '${term}'`,
  ])

  const params = new URLSearchParams({
    sql: `SELECT * FROM company WHERE ${sqlClauses.join(" OR ")}`,
    size: "5",
    titlecase: "true",
  })

  try {
    const response = await fetch(`${PDL_COMPANY_SEARCH_URL}?${params.toString()}`, {
      headers: {
        "Accept": "application/json",
        "X-Api-Key": apiKey,
      },
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!response.ok) {
      console.warn(`[CompetitorData] People Data Labs request failed: ${response.status} ${response.statusText}`)
      return []
    }

    const payload = (await response.json()) as PdlSearchResponse
    if (!Array.isArray(payload.data)) {
      if (payload.error) console.warn(`[CompetitorData] People Data Labs error: ${payload.error}`)
      return []
    }

    return payload.data
      .map(mapPdlCompany)
      .filter((company): company is RealCompetitor => Boolean(company))
  } catch (error) {
    console.warn("[CompetitorData] Failed to fetch People Data Labs competitors:", error)
    return []
  }
}
