import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClarityScore from '@/components/ClarityScore'
import PdfDownload from '@/components/PdfDownload'
import Link from 'next/link'

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: report } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (!report) notFound()

  const hostname = (() => {
    try { return new URL(report.url).hostname.replace('www.', '') }
    catch { return report.url }
  })()

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-400 text-sm mb-8 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-6 border border-white/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-pink-500/20 flex items-center justify-center text-lg flex-shrink-0">
              🌐
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Analysis Report</p>
              <h1 className="text-xl font-black text-white break-all mb-1">{hostname}</h1>
              <p className="text-xs text-slate-400 break-all">{report.url}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-300">
                {new Date(report.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Clarity Score */}
        <div className="mb-6">
          <ClarityScore score={report.clarity_score} />
        </div>

        {/* Roast */}
        {report.roast && (
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-pink-500/10 to-violet-500/10" />
            <div className="absolute inset-0 border border-orange-500/20 rounded-2xl" />
            <div className="relative p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔥</span>
                <h2 className="text-base font-black text-orange-400 uppercase tracking-wider">The Roast</h2>
              </div>
              <blockquote className="text-slate-200 leading-relaxed text-lg italic font-medium">
                "{report.roast}"
              </blockquote>
            </div>
          </div>
        )}

        {/* UX Issues */}
        {report.ux_suggestions?.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6 border border-white/5">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">🎨</span>
              <h2 className="text-base font-black text-white">UX Issues Found</h2>
              <span className="ml-auto text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                {report.ux_suggestions.length} issues
              </span>
            </div>
            <ul className="space-y-3">
              {report.ux_suggestions.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <span className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs font-bold">✕</span>
                  </span>
                  <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CRO Recommendations */}
        {report.cro_recommendations?.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6 border border-white/5">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">📈</span>
              <h2 className="text-base font-black text-white">Conversion Recommendations</h2>
              <span className="ml-auto text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                {report.cro_recommendations.length} tips
              </span>
            </div>
            <ul className="space-y-3">
              {report.cro_recommendations.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                  <span className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">→</span>
                  </span>
                  <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Homepage Rewrite */}
        {report.homepage_rewrite && (
          <div className="glass rounded-2xl p-6 mb-6 border border-white/5">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">✏️</span>
              <h2 className="text-base font-black text-white">AI-Suggested Homepage Copy</h2>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-pink-500/5" />
              <div className="absolute inset-0 border border-violet-500/15 rounded-xl" />
              <div className="relative p-5">
                <p className="text-slate-200 leading-relaxed text-base">{report.homepage_rewrite}</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-3">
              AI-generated — customize for your brand, audience, and tone.
            </p>
          </div>
        )}

        {/* PDF Download */}
        <div className="mt-2">
          <PdfDownload report={report} />
        </div>
      </div>
    </div>
  )
}
