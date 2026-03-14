import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai'
import * as cheerio from 'cheerio'
import { z } from 'zod'

const RequestSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required.')
    .url('Invalid URL format.')
    .max(2048, 'URL is too long.')
    .refine((u) => ['http:', 'https:'].includes(new URL(u).protocol), {
      message: 'Only HTTP/HTTPS URLs are allowed.',
    }),
})

const AIResponseSchema = z.object({
  clarity_score: z.number().min(0).max(100),
  ux_suggestions: z.array(z.string()).min(1).max(10),
  cro_recommendations: z.array(z.string()).min(1).max(10),
  homepage_rewrite: z.string().min(1),
  roast: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid request.'
      return NextResponse.json({ error: message }, { status: 400 })
    }
    const { url } = parsed.data

    // Block SSRF: reject private/internal hostnames
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.toLowerCase()
    const isPrivate =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('169.254.') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    if (isPrivate) {
      return NextResponse.json({ error: 'Private or internal URLs are not allowed.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to analyze websites.' }, { status: 401 })
    }

    // Check usage limit
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: usage } = await supabase
      .from('usage')
      .select('analysis_count')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .single()

    if (usage && usage.analysis_count >= 3) {
      return NextResponse.json({ error: 'Monthly limit reached. You have used all 3 free analyses this month.' }, { status: 429 })
    }

    // Scrape website
    let pageContent = ''
    let pageTitle = ''
    let metaDescription = ''
    let headings = ''

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIWebsiteAdvisor/1.0)' },
        signal: AbortSignal.timeout(15000),
      })
      const html = await response.text()
      const $ = cheerio.load(html)

      pageTitle = $('title').text().trim()
      metaDescription = $('meta[name="description"]').attr('content') || ''

      const h1 = $('h1').map((_, el) => $(el).text().trim()).get().join(' | ')
      const h2 = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 5).join(' | ')
      headings = [h1, h2].filter(Boolean).join('\n')

      $('script, style, nav, footer, head').remove()
      pageContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000)
    } catch {
      return NextResponse.json({ error: 'Could not fetch the website. Please check the URL and try again.' }, { status: 422 })
    }

    // Call Claude API
    const prompt = `You are an expert website conversion consultant and UX auditor.

Analyze this website content and return a JSON report with this EXACT structure (no markdown, no explanation, just JSON):

{
  "clarity_score": <number 0-100>,
  "ux_suggestions": [<3-5 specific UX problems as strings>],
  "cro_recommendations": [<3-5 specific conversion tips as strings>],
  "homepage_rewrite": "<rewritten homepage headline + subheadline + CTA, max 100 words>",
  "roast": "<a sharp, funny, brutally honest 2-3 sentence roast of the website's biggest messaging problem>"
}

Website URL: ${url}
Page Title: ${pageTitle}
Meta Description: ${metaDescription}
Headings: ${headings}
Content: ${pageContent}

Rules:
- clarity_score: 0 = completely unclear, 100 = crystal clear value proposition
- ux_suggestions: be specific, reference actual elements you found
- cro_recommendations: actionable, specific improvements
- roast: be funny and memorable — reference specific bad copy or design choices you actually found
- Return ONLY valid JSON`

    let rawText: string
    try {
      rawText = await callAI(prompt)
    } catch (aiErr: unknown) {
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr)
      console.error('[analyze] AI call failed:', msg)
      return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 })
    }

    let reportData: z.infer<typeof AIResponseSchema>
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      const raw = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
      const validated = AIResponseSchema.safeParse(raw)
      if (!validated.success) {
        console.error('[analyze] AI response failed schema validation:', validated.error.issues)
        return NextResponse.json({ error: 'AI returned an unexpected response format. Please try again.' }, { status: 500 })
      }
      reportData = validated.data
    } catch {
      console.error('[analyze] JSON parse failed. Raw AI response:', rawText)
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
    }

    // Save to database
    const { data: analysis, error: dbError } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        url,
        clarity_score: reportData.clarity_score,
        ux_suggestions: reportData.ux_suggestions,
        cro_recommendations: reportData.cro_recommendations,
        homepage_rewrite: reportData.homepage_rewrite,
        roast: reportData.roast,
        raw_report: reportData,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[analyze] DB insert failed:', dbError)
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    }

    // Update usage count
    await supabase.from('usage').upsert(
      { user_id: user.id, month_year: currentMonth, analysis_count: (usage?.analysis_count ?? 0) + 1 },
      { onConflict: 'user_id,month_year' }
    )

    return NextResponse.json({ id: analysis.id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
    console.error('[analyze] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
