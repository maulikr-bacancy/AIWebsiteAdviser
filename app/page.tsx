import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ReportCard from '@/components/ReportCard'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: demoReports } = await supabase
    .from('analyses')
    .select('*')
    .is('user_id', null)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[80px] animate-float" />
      </div>

      {/* ── HERO ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          AI-Powered Website Analysis — Free to Start
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
          Get Your Website{' '}
          <span className="gradient-text">Roasted</span>
          <br />
          <span className="text-slate-300">by AI in 60 Seconds</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Paste any URL and get an instant AI audit — clarity score, UX issues,
          conversion tips, a homepage rewrite, and a brutally honest roast.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/analyze"
            className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5"
          >
            Analyze My Website Free
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 text-lg px-8 py-4 rounded-xl transition-all"
          >
            Create Free Account
          </Link>
        </div>
        <p className="text-sm text-slate-400">No credit card required · 3 free analyses/month</p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 mt-14">
          {[
            { value: '60s', label: 'Analysis time' },
            { value: '5', label: 'Report sections' },
            { value: '100%', label: 'AI-powered' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <p className="text-pink-500 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Three steps to clarity</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: '🔗',
              title: 'Paste your URL',
              desc: 'Enter any public website URL. We handle the rest automatically.',
            },
            {
              step: '02',
              icon: '🤖',
              title: 'AI analyzes it',
              desc: 'Our AI scrapes and analyzes your content, messaging, and structure.',
            },
            {
              step: '03',
              icon: '📊',
              title: 'Get your report',
              desc: 'Receive a detailed report with scores, fixes, and a rewritten homepage.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative glass rounded-2xl p-6 hover:border-pink-500/20 transition-all group"
            >
              <div className="text-xs font-black text-slate-500 mb-4 tracking-wider">{item.step}</div>
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/0 to-violet-500/0 group-hover:from-pink-500/5 group-hover:to-violet-500/5 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <p className="text-pink-500 text-sm font-semibold uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything in one report</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: '🎯',
              title: 'Clarity Score',
              desc: 'A 0–100 score measuring how clearly you communicate your value proposition.',
              color: 'from-pink-500/10 to-pink-500/0',
              border: 'hover:border-pink-500/30',
            },
            {
              icon: '🔥',
              title: 'Website Roast',
              desc: 'Brutal, funny, and unforgettable. AI calls out your biggest messaging fail.',
              color: 'from-orange-500/10 to-orange-500/0',
              border: 'hover:border-orange-500/30',
            },
            {
              icon: '📈',
              title: 'CRO Tips',
              desc: 'Specific, actionable conversion rate improvements you can implement today.',
              color: 'from-green-500/10 to-green-500/0',
              border: 'hover:border-green-500/30',
            },
            {
              icon: '✏️',
              title: 'Copy Rewrite',
              desc: 'AI-rewritten homepage headline, subheadline, and CTA that actually converts.',
              color: 'from-blue-500/10 to-blue-500/0',
              border: 'hover:border-blue-500/30',
            },
            {
              icon: '🎨',
              title: 'UX Audit',
              desc: 'Real design and navigation problems found with specific suggestions to fix them.',
              color: 'from-violet-500/10 to-violet-500/0',
              border: 'hover:border-violet-500/30',
            },
            {
              icon: '📄',
              title: 'PDF Report',
              desc: 'Download and share your full report as a professional PDF document.',
              color: 'from-slate-500/10 to-slate-500/0',
              border: 'hover:border-slate-500/30',
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`glass rounded-2xl p-5 border border-white/5 ${f.border} transition-all hover:-translate-y-0.5 group`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl mb-4 border border-white/5`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO REPORTS ── */}
      {demoReports && demoReports.length > 0 && (
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-24">
          <div className="text-center mb-12">
            <p className="text-pink-500 text-sm font-semibold uppercase tracking-widest mb-3">Live examples</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">See it in action</h2>
            <p className="text-slate-300 mt-3">Real AI-generated reports from real websites</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {demoReports.map((report: any) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-violet-600/15 to-transparent" />
          <div className="absolute inset-0 border border-pink-500/20 rounded-3xl" />
          <div className="relative px-8 py-14 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to get roasted?
            </h2>
            <p className="text-slate-300 mb-8 max-w-md mx-auto">
              Find out what's killing your conversions — before your competitors do.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-pink-500/30 hover:-translate-y-0.5"
            >
              Analyze My Website — It's Free →
            </Link>
            <p className="text-slate-400 text-sm mt-4">3 free analyses every month. No card needed.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold">
              A
            </div>
            <span className="text-slate-400 text-sm">AI Website Advisor</span>
          </div>
          <p className="text-slate-500 text-xs">
            Built with Next.js · Supabase · Claude AI
          </p>
        </div>
      </footer>
    </div>
  )
}
