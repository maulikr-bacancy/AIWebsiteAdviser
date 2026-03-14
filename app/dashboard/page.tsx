import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReportCard from '@/components/ReportCard'
import type { Report } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: usage } = await supabase
    .from('usage')
    .select('analysis_count')
    .eq('user_id', user.id)
    .eq('month_year', currentMonth)
    .single()

  const usedCount = usage?.analysis_count ?? 0
  const remaining = Math.max(0, 3 - usedCount)
  const usagePct = Math.min(100, (usedCount / 3) * 100)

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Dashboard</h1>
            <p className="text-slate-400 text-sm">
              {user.email}
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 hover:-translate-y-0.5"
          >
            + New Analysis
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {/* Usage card */}
          <div className="col-span-2 sm:col-span-1 glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Monthly Usage</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                usedCount >= 3
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
              }`}>
                {usedCount}/3
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${usedCount >= 3 ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-violet-500'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {remaining > 0 ? `${remaining} free ${remaining === 1 ? 'analysis' : 'analyses'} remaining` : 'Monthly limit reached'}
            </p>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Total Analyses</p>
            <p className="text-3xl font-black text-white">{analyses?.length ?? 0}</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Avg. Score</p>
            <p className="text-3xl font-black gradient-text">
              {analyses && analyses.length > 0
                ? Math.round(analyses.reduce((sum: number, a: Report) => sum + (a.clarity_score ?? 0), 0) / analyses.length)
                : '—'}
            </p>
          </div>
        </div>

        {/* Analyses grid */}
        {analyses && analyses.length > 0 ? (
          <>
            <h2 className="text-lg font-bold text-white mb-4">Your Reports</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {analyses.map((report: Report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl mx-auto mb-5">
              🔍
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No analyses yet</h3>
            <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
              Paste a URL and get your first AI website audit in under 60 seconds.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-pink-500/20 hover:-translate-y-0.5"
            >
              Analyze Your First Website →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
