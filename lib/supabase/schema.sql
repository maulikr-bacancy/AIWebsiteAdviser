-- =============================================
-- AI Website Advisor — Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Analyses table
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  clarity_score INTEGER,
  ux_suggestions TEXT[],
  cro_recommendations TEXT[],
  homepage_rewrite TEXT,
  roast TEXT,
  raw_report JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  analysis_count INTEGER DEFAULT 0,
  UNIQUE(user_id, month_year)
);

-- Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view demo analyses" ON analyses
  FOR SELECT USING (user_id IS NULL);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own usage" ON usage
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Seed Data — 3 Demo Analyses (public, no user)
-- =============================================

INSERT INTO analyses (id, user_id, url, clarity_score, ux_suggestions, cro_recommendations, homepage_rewrite, roast, created_at)
VALUES
(
  'a1b2c3d4-0000-0000-0000-000000000001',
  NULL,
  'https://example-startup.com',
  42,
  ARRAY[
    'Navigation has 9 items — reduce to 5 maximum',
    'No clear visual hierarchy on homepage',
    'CTA button blends into the background color',
    'Hero section has no specific outcome stated'
  ],
  ARRAY[
    'Add a headline that states the specific outcome you deliver',
    'Place testimonials above the fold, not at the bottom',
    'Add urgency to your primary CTA (free trial, limited spots)',
    'Remove stock photos — use real product screenshots'
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
    'No loading states on form submission',
    'Pricing page missing FAQ section'
  ],
  ARRAY[
    'Your pricing page has no FAQ — add one to reduce friction',
    'Free trial CTA should be visible without scrolling',
    'Add a comparison table vs competitors',
    'Show the number of active users as social proof'
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
    'No social proof visible on homepage',
    'Blog posts have no clear CTA at the end'
  ],
  ARRAY[
    'Add client logos above the fold',
    'Reduce contact form to Name + Email + Message only',
    'Add a case study with specific numbers (e.g., 300% ROI)',
    'Add live chat widget — visitors leave without contacting'
  ],
  'We help [niche] businesses grow revenue with [service]. In the last 12 months, our clients averaged [specific result]. Ready to be next?',
  'Your hero image is a stock photo of people in a meeting, smiling at a laptop. We have seen this image 10,000 times. Those people are not your clients. They are models who have never heard of you.',
  NOW() - INTERVAL '3 hours'
);
