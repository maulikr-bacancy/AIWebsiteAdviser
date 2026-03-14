import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data } = await supabase
    .from('usage')
    .select('analysis_count')
    .eq('user_id', user.id)
    .eq('month_year', currentMonth)
    .single()

  return NextResponse.json({
    used: data?.analysis_count ?? 0,
    limit: 3,
    remaining: Math.max(0, 3 - (data?.analysis_count ?? 0)),
  })
}
