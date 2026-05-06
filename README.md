# doppelganger

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_ybukLeiig2sPr42Re6gOaRgco2Te)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Real competitor data

DPLGNGR can enrich the AI competitor analysis with structured startup/company data. The current implementation uses People Data Labs as the default provider because it has a self-serve API, free monthly credits, company search, founding dates, company descriptions, websites, and some funding-related fields.

### Provider comparison

| Provider | Free tier / cost | Data quality | Integration fit |
| --- | --- | --- | --- |
| People Data Labs | Free plan with monthly credits; Pro starts around usage-based company API pricing | Good company search/enrichment, founded year, website, summaries, tags, employee size, and funding fields when available | Best fit for this app. Simple REST API and server-side API key. |
| Product Hunt | Developer token / OAuth; public GraphQL data | Good for product launches, makers, votes, topics; weak for funding, legal company status, shutdowns | Useful secondary signal, but not enough for startup competitor intelligence by itself. |
| Crunchbase | Enterprise/API packages through sales | Excellent startup, funding, investor, acquisition and status data | Strongest data, but not a low-cost self-serve option. |
| Harmonic | API access is sales-led / add-on | Strong startup discovery and people/company graph | High-quality but less suitable for quick low-cost integration. |
| Dealroom | Premium plans/API are sales-led and expensive | Strong venture/startup data, especially Europe, funding, ecosystem coverage | Good enterprise option, not practical for a small self-serve integration. |
| OpenCorporates / Companies House | Free or low-cost registry APIs | Strong legal registry status and incorporation data; weak product/funding context | Useful for legal verification, not enough for startup-market similarity. |

### Required API keys

Copy `.env.example` to `.env.local` and add:

```bash
GROQ_API_KEY=your_groq_key_here
TAVILY_API_KEY=your_tavily_key_here
PEOPLE_DATA_LABS_API_KEY=your_people_data_labs_key_here
```

`PEOPLE_DATA_LABS_API_KEY` is optional. If it is missing, `/lib/competitorDataService.ts` logs a warning and returns an empty competitor array so the app still works with Tavily/LLM-only analysis.

### How to get API keys

- People Data Labs: create a free account from the People Data Labs API dashboard, then copy an API key from the API Keys page. Use `PEOPLE_DATA_LABS_API_KEY` in Vercel.
- Groq: create an API key in the Groq console and set `GROQ_API_KEY`.
- Tavily: create a Tavily API key and set `TAVILY_API_KEY` to enable MCP-backed web research.
- Product Hunt alternative: create a Product Hunt developer app, generate a developer token or OAuth client credentials, and use its GraphQL API if you later add it as a secondary launch-signal provider.
- Crunchbase, Harmonic, and Dealroom: contact sales for API access; these are better enterprise upgrades than default free-tier providers.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/mpenon4/doppelganger" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
