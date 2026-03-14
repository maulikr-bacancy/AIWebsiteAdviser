-- =============================================================
-- AI Website Advisor — Demo Seed Data
-- =============================================================
-- Run this once in your Supabase project:
--   Dashboard → SQL Editor → paste → Run
--
-- Rows with user_id = NULL appear as demo reports on the homepage.
-- =============================================================

INSERT INTO analyses (
  id,
  user_id,
  url,
  clarity_score,
  ux_suggestions,
  cro_recommendations,
  homepage_rewrite,
  roast,
  raw_report,
  created_at
) VALUES

-- Demo 1: Notion (score 72 — Good)
(
  gen_random_uuid(),
  NULL,
  'https://notion.so',
  72,
  ARRAY[
    'Hero section targets 5 different user types at once (students, teams, devs, designers) with no clear primary audience',
    'Top navigation has 8+ items creating cognitive overload on first visit',
    'No social proof or user count visible above the fold despite having 30M+ users',
    'Three CTAs compete for attention with equal visual weight — the eye has no clear next step'
  ],
  ARRAY[
    'Add a sticky social proof bar ("Join 30M+ teams") directly below the hero CTA to neutralize hesitation',
    'A/B test a single-persona landing page (e.g. "For teams") vs the current catch-all approach',
    'Move the template gallery above the fold — it''s the fastest way to show value to first-time visitors',
    'Add a 60-second product demo video — tool complexity is the #1 objection and video reduces drop-off by 30%'
  ],
  'Stop juggling everything. Notion is the one workspace where your team''s notes, tasks, and wikis actually live together — and stay that way. Start free, no credit card needed.',
  'Notion''s homepage is an identity crisis wrapped in beautiful UI. It''s trying to be a Swiss Army knife but showing every blade at once — by the time you figure out what it does, you''ve already opened a Trello tab.',
  '{
    "clarity_score": 72,
    "ux_suggestions": [
      "Hero section targets 5 different user types simultaneously with no clear primary audience",
      "Top navigation has 8+ items creating cognitive overload",
      "No social proof visible above the fold",
      "Three CTAs compete with equal visual weight"
    ],
    "cro_recommendations": [
      "Add sticky social proof bar below hero CTA",
      "A/B test single-persona landing page vs catch-all",
      "Move template gallery above the fold",
      "Add 60-second product demo video"
    ],
    "homepage_rewrite": "Stop juggling everything. Notion is the one workspace where your team''s notes, tasks, and wikis actually live together — and stay that way. Start free, no credit card needed.",
    "roast": "Notion''s homepage is an identity crisis wrapped in beautiful UI. It''s trying to be a Swiss Army knife but showing every blade at once — by the time you figure out what it does, you''ve already opened a Trello tab."
  }'::jsonb,
  NOW() - INTERVAL '3 days'
),

-- Demo 2: Mailchimp (score 44 — Poor)
(
  gen_random_uuid(),
  NULL,
  'https://mailchimp.com',
  44,
  ARRAY[
    'Headline "Turn Emails Into Revenue" is generic — every email tool makes the same claim',
    'Pricing section is buried 5 scrolls deep even though price is the #1 question for new visitors',
    'Mobile hamburger menu contains 20+ sub-items — completely unusable on a phone',
    'GDPR and SOC2 trust badges are hidden in the footer where anxious buyers never look',
    'Page takes 8 seconds to become interactive on a 3G connection, hurting mobile bounce rate'
  ],
  ARRAY[
    'Add "Plans from $0/month" directly under the hero CTA to immediately defuse price anxiety',
    'Surface the free tier limits (500 contacts, 1,000 emails/month) in the hero — it''s the strongest conversion hook',
    'Create a "Mailchimp vs Klaviyo" comparison page — high-intent, high-converting search traffic',
    'Move G2/Trustpilot rating and review count into the hero section for instant third-party credibility',
    'Lazy-load all below-fold images to cut time-to-interactive under 3 seconds on mobile'
  ],
  'Send smarter emails. Grow faster. Mailchimp gives small businesses the same automation and analytics as Fortune 500 marketing teams — starting completely free for up to 500 contacts.',
  'Mailchimp''s homepage is a used-car salesman who won''t reveal the price until you''ve sat through the whole pitch. You''re hiding your free plan like it''s an embarrassing secret — newsflash, it''s your best feature. Lead with it.',
  '{
    "clarity_score": 44,
    "ux_suggestions": [
      "Generic headline that every competitor also uses",
      "Pricing buried 5 scrolls deep",
      "Mobile hamburger menu with 20+ items is unusable",
      "Trust badges hidden in footer",
      "8-second mobile load time"
    ],
    "cro_recommendations": [
      "Add price hint directly under hero CTA",
      "Surface free tier benefits in the hero",
      "Create competitor comparison page",
      "Move G2 rating into hero section",
      "Lazy-load below-fold images"
    ],
    "homepage_rewrite": "Send smarter emails. Grow faster. Starting completely free for up to 500 contacts.",
    "roast": "Mailchimp''s homepage hides its free plan like an embarrassing secret — newsflash, it''s your best feature. Lead with it."
  }'::jsonb,
  NOW() - INTERVAL '7 days'
),

-- Demo 3: Linear (score 85 — Good)
(
  gen_random_uuid(),
  NULL,
  'https://linear.app',
  85,
  ARRAY[
    'Dark-mode-only design can alienate enterprise buyers who expect light-mode dashboards in procurement demos',
    '"Built for modern teams" tagline is vague — "modern" doesn''t differentiate from Jira, Asana, or any competitor',
    'No interactive demo or product tour available — visitors must create an account to see the actual UI',
    'Keyboard shortcut showcase in the hero is developer-targeted and may confuse non-technical PMs evaluating the tool'
  ],
  ARRAY[
    'Add a no-signup interactive product tour to cut friction for enterprise evaluators and procurement teams',
    'Build a dedicated "Linear vs Jira" page — this is the #1 branded search and highest-converting comparison traffic',
    'Place recognizable customer logos (Vercel, Loom, Raycast) above the fold to accelerate enterprise trust',
    'Test a speed-focused headline variant: "Ship 3x faster. Your team will thank you."'
  ],
  'The project tracker that doesn''t slow you down. Linear is keyboard-first, ruthlessly fast, and opinionated enough to actually work. Used by the teams building the products you use every day. Free for small teams.',
  'Linear''s homepage is so aesthetically perfect it almost makes you forget to ask what it actually does. It''s like a luxury watch ad that never shows the time — breathtakingly confident, slightly smug, and weirdly effective.',
  '{
    "clarity_score": 85,
    "ux_suggestions": [
      "Dark-mode-only may alienate enterprise buyers",
      "Vague tagline does not differentiate from competitors",
      "No interactive demo without signing up",
      "Developer-focused hero may confuse non-technical PMs"
    ],
    "cro_recommendations": [
      "Add no-signup interactive product tour",
      "Create Linear vs Jira comparison page",
      "Add recognizable logos above the fold",
      "Test speed-focused headline variant"
    ],
    "homepage_rewrite": "The project tracker that doesn''t slow you down. Keyboard-first, fast, and used by the teams building the products you use every day. Free for small teams.",
    "roast": "Linear''s homepage is so aesthetically perfect it almost makes you forget to ask what it does — like a luxury watch ad that never shows the time."
  }'::jsonb,
  NOW() - INTERVAL '1 day'
);
