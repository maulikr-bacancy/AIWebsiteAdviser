# AI Website Advisor — Hackathon Build Plan
> Project #18 | AI Mahakurukshetra Hackathon | March 14, 2026

---

## 1. Project Summary

A SaaS tool where users paste any website URL and receive an AI-generated audit report in under 60 seconds. The report covers clarity score, UX issues, CRO recommendations, homepage copy rewrite, and a viral "website roast". Built on Next.js + Supabase + Claude API + Vercel.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | UI + API routes |
| Database | Supabase (PostgreSQL) | Data storage |
| Auth | Supabase Auth | Login / Signup |
| AI | Claude API (claude-sonnet-4-6) | Website analysis |
| Scraping | node-fetch + cheerio | Extract website text |
| PDF | jsPDF | Downloadable report |
| Styling | Tailwind CSS | UI + mobile responsive |
| Deploy | Vercel | Hosting |

---

## 3. Pages & Routes

### Pages
| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero + URL input + example report (seed data) |
| `/login` | Login | Supabase email/password login |
| `/signup` | Signup | New account registration |
| `/dashboard` | Dashboard | User's past analyses list |
| `/analyze` | Analyze Page | URL input + loading state |
| `/report/[id]` | Report Page | Full AI-generated report |

### API Routes (Next.js Route Handlers)
| Route | Method | Description |
|---|---|---|
| `/api/analyze` | POST | Scrape URL + call Claude + save to DB |
| `/api/report/[id]` | GET | Fetch report from DB |
| `/api/usage` | GET | Get user's monthly usage count |

---

## 4. Database Schema (Supabase)

```sql
-- Run this in Supabase SQL Editor

-- Analyses table
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  clarity_score INTEGER,         -- 0-100
  ux_suggestions TEXT[],         -- array of UX issues
  cro_recommendations TEXT[],    -- array of CRO tips
  homepage_rewrite TEXT,         -- rewritten homepage copy
  roast TEXT,                    -- funny roast of the website
  raw_report JSONB,              -- full Claude response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,      -- format: "2026-03"
  analysis_count INTEGER DEFAULT 0,
  UNIQUE(user_id, month_year)
);

-- Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage
  FOR ALL USING (auth.uid() = user_id);
```

---

## 5. Seed Data (Demo Reports)

Pre-load 3 example analyses so the app looks populated on first visit.

```sql
-- Insert demo user analyses (use a fixed demo UUID)
INSERT INTO analyses (id, user_id, url, clarity_score, ux_suggestions, cro_recommendations, homepage_rewrite, roast, created_at)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  NULL, -- public demo data, no user
  'https://example-startup.com',
  42,
  ARRAY[
    'Navigation has 9 items — reduce to 5 maximum',
    'No clear visual hierarchy on homepage',
    'CTA button blends into background color'
  ],
  ARRAY[
    'Add a headline that states the specific outcome you deliver',
    'Place testimonials above the fold, not at the bottom',
    'Add urgency to your primary CTA (free trial, limited spots)'
  ],
  'Stop guessing. Start growing. [Product] helps [target audience] achieve [specific outcome] in [timeframe] — without [pain point]. Join 2,000+ teams already winning.',
  'Your homepage says "We deliver innovative solutions for tomorrow''s challenges." That''s 7 words that mean absolutely nothing. My grandma''s fridge magnet has more clarity than your value proposition.',
  NOW() - INTERVAL '2 days'
),
(
  'a1b2c3d4-0000-0000-0000-000000000002',
  NULL,
  'https://saas-demo-app.io',
  67,
  ARRAY[
    'Mobile menu is broken on iOS Safari',
    'Font size too small on feature section (10px)',
    'No loading states on form submission'
  ],
  ARRAY[
    'Your pricing page has no FAQ — add one to reduce friction',
    'Free trial CTA should be visible without scrolling',
    'Add a comparison table vs competitors'
  ],
  'The fastest way to [outcome]. [Product] gives [audience] everything they need to [goal] — set up in 5 minutes, results in 30 days.',
  'You have 4 different shades of blue on your homepage. It looks like a Picasso painting if Picasso only knew one color. Pick one blue. Commit to it.',
  NOW() - INTERVAL '1 day'
),
(
  'a1b2c3d4-0000-0000-0000-000000000003',
  NULL,
  'https://agency-website-example.com',
  78,
  ARRAY[
    'Page load time exceeds 4 seconds',
    'Contact form has 11 fields — reduce to 3',
    'No social proof visible on homepage'
  ],
  ARRAY[
    'Add client logos above the fold',
    'Reduce contact form to Name + Email + Message only',
    'Add a case study with specific numbers (e.g., 300% ROI)'
  ],
  'We help [niche] businesses grow revenue with [service]. In the last 12 months, our clients averaged [specific result]. Ready to be next?',
  'Your hero image is a stock photo of people in a meeting, smiling at a laptop. We have seen this image 10,000 times. Those people are not your clients. They are models who have never heard of you.',
  NOW() - INTERVAL '3 hours'
);
```

---

## 6. Claude AI Prompt Design

```
POST /api/analyze

1. Fetch URL with node-fetch
2. Parse HTML with cheerio → extract: title, meta description, h1-h3 tags, body text (first 3000 chars)
3. Send to Claude API with this prompt:
```

```text
You are an expert website conversion consultant and UX auditor.

Analyze this website content and return a JSON report with this exact structure:

{
  "clarity_score": <number 0-100>,
  "ux_suggestions": [<3-5 specific UX problems as strings>],
  "cro_recommendations": [<3-5 specific conversion tips as strings>],
  "homepage_rewrite": "<rewritten homepage headline + subheadline + CTA, max 100 words>",
  "roast": "<a sharp, funny, brutally honest 2-3 sentence roast of the website's biggest messaging problem>"
}

Website URL: {url}
Page Title: {title}
Meta Description: {meta_description}
Headings: {headings}
Content: {content}

Rules:
- clarity_score: 0 = completely unclear, 100 = crystal clear value proposition
- ux_suggestions: be specific (mention actual elements you see, not generic advice)
- roast: be funny and memorable — this is the viral hook. Reference specific bad copy or design choices you actually found.
- Return ONLY valid JSON, no markdown, no explanation.
```

---

## 7. Usage Limit Logic

```
Free tier: 3 analyses per month
Pro tier: unlimited (future — skip for hackathon, just show upgrade modal)

Logic in /api/analyze:
1. Get current month_year (e.g., "2026-03")
2. Query usage table for user_id + month_year
3. If count >= 3 → return 429 error "Monthly limit reached"
4. If count < 3 → proceed + increment count
```

---

## 8. Key Components to Build

```
app/
├── layout.tsx                  # Root layout with nav
├── page.tsx                    # Landing page + demo report
├── login/page.tsx              # Login form
├── signup/page.tsx             # Signup form
├── dashboard/page.tsx          # Past analyses list
├── analyze/page.tsx            # URL input + loading
├── report/[id]/page.tsx        # Full report display
└── api/
    ├── analyze/route.ts        # Main analysis endpoint
    ├── report/[id]/route.ts    # Fetch single report
    └── usage/route.ts          # Usage count check

components/
├── UrlInput.tsx                # URL input form with validation
├── ReportCard.tsx              # Summary card (dashboard)
├── ReportFull.tsx              # Full report display
├── ClarityScore.tsx            # Visual score meter (0-100)
├── RoastCard.tsx               # Styled roast section (make it fun!)
└── PdfDownload.tsx             # PDF export button
```

---

## 9. Environment Variables

```env
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_claude_api_key
```

---

## 10. Build Order Checklist

### Phase 1 — Foundation (Hours 1-2)
- [ ] `npx create-next-app@latest ai-website-advisor --typescript --tailwind --app`
- [ ] Install dependencies: `@supabase/ssr @supabase/supabase-js @anthropic-ai/sdk cheerio jspdf`
- [ ] Set up Supabase project + run schema SQL
- [ ] Configure Supabase auth + env vars
- [ ] Basic layout with nav (Login / Signup / Dashboard links)

### Phase 2 — Core Feature (Hours 3-4)
- [ ] `/api/analyze` route — fetch URL + parse HTML with cheerio
- [ ] Claude API call with prompt — parse JSON response
- [ ] Save report to Supabase `analyses` table
- [ ] `/report/[id]` page — display full report

### Phase 3 — Auth + Limits (Hour 5)
- [ ] Login page + Signup page (Supabase Auth)
- [ ] Protect `/dashboard` and `/api/analyze` routes
- [ ] Usage limit check (3/month free tier)

### Phase 4 — UI Polish (Hours 6-7)
- [ ] Landing page with hero + URL input + demo report visible
- [ ] Insert seed data into Supabase
- [ ] Dashboard page with past analyses
- [ ] ClarityScore visual component (progress bar/circle)
- [ ] RoastCard with styled fun design
- [ ] Mobile responsive check on all pages
- [ ] PDF download button

### Phase 5 — Ship (Hours 8-10)
- [ ] Deploy to Vercel + set env vars in Vercel dashboard
- [ ] Test live URL end-to-end
- [ ] Record 5-min demo video (use seed data!)
- [ ] Product Hunt listing
- [ ] Run `/hackathon-check`
- [ ] Submit all links

---

## 11. Demo Video Script (5 min)

| Time | Content |
|---|---|
| 0:00–0:30 | "Most websites lose customers in the first 5 seconds. AI Website Advisor tells you exactly why — in 60 seconds." |
| 0:30–2:30 | Live demo: paste a URL → show loading → reveal report (clarity score + roast + suggestions) → show PDF download |
| 2:30–3:30 | Tech stack: Next.js App Router, Supabase auth + DB, Claude AI, deployed on Vercel |
| 3:30–4:30 | "Unlike hiring a $5000 UX consultant — this takes 60 seconds and costs nothing on the free plan" |
| 4:30–5:00 | Bacancy branding + CTA |

---

## 12. Product Hunt Tips

- Launch title: **"AI Website Advisor — Get your website roasted by AI in 60 seconds"**
- The word "roasted" = curiosity = clicks = upvotes
- Share your own website's roast result on LinkedIn/Twitter on launch day
- Reply to every comment within 10 minutes

---

*Keep this file open while building. Check off items as you go.*
