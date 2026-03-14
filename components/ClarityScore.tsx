export default function ClarityScore({ score }: { score: number }) {
  const isGood = score >= 70
  const isMid = score >= 40

  const color = isGood ? '#22c55e' : isMid ? '#f59e0b' : '#ef4444'
  const label = isGood ? 'Good' : isMid ? 'Needs Work' : 'Poor'
  const bgColor = isGood ? 'rgba(34,197,94,0.1)' : isMid ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'
  const borderColor = isGood ? 'rgba(34,197,94,0.2)' : isMid ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
  const message = isGood
    ? 'Strong messaging. Focus on conversion optimizations.'
    : isMid
    ? 'Your message needs clarification. Visitors may be confused about what you offer.'
    : 'Critical: Visitors cannot tell what you offer or who it\'s for.'

  // SVG ring
  const radius = 52
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">🎯</span>
        <h2 className="text-lg font-bold text-white">Clarity Score</h2>
      </div>

      <div className="flex items-center gap-8">
        {/* SVG Ring */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={stroke}
            />
            {/* Progress */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black" style={{ color }}>{score}</span>
            <span className="text-xs text-slate-600 font-medium">/100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold mb-3"
            style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">{message}</p>

          {/* Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-700 mb-1.5">
              <span>0 — Unclear</span>
              <span>100 — Crystal Clear</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${score}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
