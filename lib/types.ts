export interface Report {
  id: string
  user_id: string | null
  url: string
  clarity_score: number
  ux_suggestions: string[]
  cro_recommendations: string[]
  homepage_rewrite: string
  roast: string
  raw_report: Record<string, unknown>
  created_at: string
}
