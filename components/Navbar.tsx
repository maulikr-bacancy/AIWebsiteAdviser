'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#02020a]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-pink-500/25">
            A
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            AI <span className="gradient-text">Advisor</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 sm:gap-2 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/analyze"
                className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30"
              >
                Analyze URL
              </Link>
              <button
                onClick={handleSignOut}
                className="text-slate-500 hover:text-slate-300 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
