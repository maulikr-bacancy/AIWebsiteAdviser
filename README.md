# AI Website Advisor

Paste any public URL and get an instant AI audit — clarity score, UX issues, conversion tips, a homepage rewrite, and a brutally honest roast. Built for the AI Mahakurukshetra hackathon.

**Live demo:** https://ai-website-adviser.vercel.app/

## Tech Stack

- **Next.js 16** (App Router) — framework
- **Supabase** — database + authentication
- **Anthropic Claude** — AI analysis engine (OpenAI fallback supported)
- **Tailwind CSS v4** — styling
- **jsPDF** — PDF report generation
- **Vercel** — deployment

## Features

- Website URL analysis via AI (Claude / OpenAI)
- 5-section report: Clarity Score, Roast, UX Issues, CRO Tips, Homepage Rewrite
- PDF download
- User authentication (sign up / log in)
- Monthly usage quota (3 free analyses per user)
- Dashboard with analysis history
- Demo reports on the landing page

## Local Setup

```bash
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
```

Open http://localhost:3000.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ANTHROPIC_API_KEY` | Claude API key (primary AI provider) |
| `OPENAI_API_KEY` | OpenAI key (optional fallback) |
| `AI_PROVIDER` | `anthropic` or `openai` (default: `anthropic`) |
| `AI_MODEL` | Model override (optional) |

## Database Setup

Run `schema.sql` and then `seed.sql` in your Supabase SQL editor:

1. Supabase Dashboard → SQL Editor → paste `lib/supabase/schema.sql` → Run
2. Supabase Dashboard → SQL Editor → paste `seed.sql` → Run

The seed script inserts 3 demo reports (with `user_id = NULL`) that appear on the homepage.
