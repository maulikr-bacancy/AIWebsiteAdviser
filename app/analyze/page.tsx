'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  { icon: '🔍', label: 'Fetching page content' },
  { icon: '🧠', label: 'Analyzing clarity & messaging' },
  { icon: '🎨', label: 'Auditing UX & design' },
  { icon: '🔥', label: 'Writing your roast...' },
]

export default function AnalyzePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const router = useRouter()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return setError('Please enter a URL.')

    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl
    }

    setLoading(true)
    setError('')
    setActiveStep(0)

    // Cycle through steps for UX
    const stepInterval = setInterval(() => {
      setActiveStep((s) => (s < steps.length - 1 ? s + 1 : s))
    }, 4000)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl }),
      })
      const data = await res.json()
      clearInterval(stepInterval)

      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please try again.')
        setLoading(false)
        return
      }
      router.push(`/report/${data.id}`)
    } catch {
      clearInterval(stepInterval)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-pink-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-violet-500/6 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-xl text-center">
        {!loading ? (
          <>
            <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              Results in under 60 seconds
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Analyze a <span className="gradient-text">Website</span>
            </h1>
            <p className="text-slate-300 mb-10 leading-relaxed">
              Enter any public URL and get an instant AI audit with clarity score,
              UX issues, conversion tips, and a website roast.
            </p>

            <form onSubmit={handleAnalyze} className="flex flex-col gap-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-mono select-none">
                  🔗
                </div>
                <input
                  type="text"
                  placeholder="yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="glass border border-white/10 hover:border-white/20 focus:border-pink-500/60 rounded-xl pl-10 pr-4 py-4 text-white text-lg placeholder-slate-600 w-full transition-all"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-left">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/35 hover:-translate-y-0.5"
              >
                Analyze Now →
              </button>
            </form>

            <p className="text-slate-500 text-sm mt-5">
              Uses 1 of your 3 free monthly analyses
            </p>
          </>
        ) : (
          /* Loading state */
          <div className="flex flex-col items-center gap-8">
            {/* Spinner */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-violet-500 animate-spin animate-spin-slow" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                {steps[activeStep].icon}
              </div>
            </div>

            <div>
              <p className="text-white font-bold text-xl mb-1">Analyzing your website</p>
              <p className="text-slate-300 text-sm">This usually takes 20–60 seconds</p>
            </div>

            {/* Steps */}
            <div className="glass rounded-2xl p-6 w-full max-w-sm text-left space-y-4">
              {steps.map((step, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${
                  i < activeStep ? 'opacity-50' : i === activeStep ? 'opacity-100' : 'opacity-30'
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    i < activeStep
                      ? 'bg-green-500/20 text-green-400'
                      : i === activeStep
                      ? 'bg-pink-500/20 text-pink-400 ring-2 ring-pink-500/40'
                      : 'bg-white/5 text-slate-600'
                  }`}>
                    {i < activeStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm ${
                    i < activeStep ? 'text-slate-300 line-through' :
                    i === activeStep ? 'text-white font-semibold' : 'text-slate-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
