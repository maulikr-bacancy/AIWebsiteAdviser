import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai'
import * as cheerio from 'cheerio'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL provided.' }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed.' }, { status: 400 })
    }

    // Block SSRF: reject private/internal hostnames
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

      const h1 = $('h1').map((_: any, el: any) => $(el).text().trim()).get().join(' | ')
      const h2 = $('h2').map((_: any, el: any) => $(el).text().trim()).get().slice(0, 5).join(' | ')
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
    } catch (aiErr: any) {
      console.error('[analyze] AI call failed:', aiErr?.message ?? aiErr)
      return NextResponse.json({ error: `AI error: ${aiErr?.message ?? 'Unknown AI error'}` }, { status: 500 })
    }

    let reportData: any
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      reportData = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
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
  } catch (err: any) {
    console.error('[analyze] Unexpected error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'An unexpected error occurred.' }, { status: 500 })
  }
}
