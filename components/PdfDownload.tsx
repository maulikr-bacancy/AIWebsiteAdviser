'use client'

import { useState } from 'react'
import type { Report } from '@/lib/types'

export default function PdfDownload({ report }: { report: Report }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentW = pageW - margin * 2
    let y = 0

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageH - margin) {
        doc.addPage()
        y = margin
      }
    }

    const drawHeader = () => {
      // Dark header bar
      doc.setFillColor(2, 2, 10)
      doc.rect(0, 0, pageW, 32, 'F')

      // Pink accent line
      doc.setFillColor(236, 72, 153)
      doc.rect(0, 32, pageW, 1.5, 'F')

      // Title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('AI Website Advisor', margin, 13)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      doc.text('Powered by Claude AI', margin, 21)

      // Date top-right
      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      const dateStr = new Date(report.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
      doc.text(dateStr, pageW - margin, 13, { align: 'right' })

      y = 44
    }

    const drawSectionTitle = (title: string) => {
      checkPageBreak(16)
      doc.setFillColor(15, 15, 30)
      doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F')
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(236, 72, 153)
      doc.text(title, margin + 4, y + 7)
      y += 16
    }

    const drawBodyText = (text: string, color: [number, number, number] = [51, 65, 85]) => {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...color)
      const lines = doc.splitTextToSize(text, contentW)
      checkPageBreak(lines.length * 6 + 2)
      doc.text(lines, margin, y)
      y += lines.length * 6 + 2
    }

    const drawBullet = (text: string, bulletColor: [number, number, number], bgColor: [number, number, number]) => {
      const lines = doc.splitTextToSize(text, contentW - 12)
      const blockH = lines.length * 6 + 6
      checkPageBreak(blockH + 4)

      doc.setFillColor(...bgColor)
      doc.roundedRect(margin, y, contentW, blockH, 1.5, 1.5, 'F')

      doc.setFillColor(...bulletColor)
      doc.circle(margin + 5, y + blockH / 2, 1.5, 'F')

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(203, 213, 225)
      doc.text(lines, margin + 11, y + 5)

      y += blockH + 3
    }

    // ── PAGE 1: Header ──
    drawHeader()

    // URL + meta card
    doc.setFillColor(15, 15, 30)
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F')
    doc.setDrawColor(255, 255, 255, 0.06)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text('WEBSITE ANALYZED', margin + 6, y + 8)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    const urlLines = doc.splitTextToSize(report.url, contentW - 12)
    doc.text(urlLines[0], margin + 6, y + 16)

    // Score badge
    const score = report.clarity_score ?? 0
    const scoreColor: [number, number, number] = score >= 70
      ? [34, 197, 94]
      : score >= 40
      ? [234, 179, 8]
      : [239, 68, 68]

    doc.setFillColor(...scoreColor)
    doc.roundedRect(pageW - margin - 30, y + 5, 30, 18, 2, 2, 'F')
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(`${score}`, pageW - margin - 15, y + 16, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('/100', pageW - margin - 15, y + 21, { align: 'center' })

    y += 36

    // Score label
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text('CLARITY SCORE', pageW - margin - 15, y - 4, { align: 'center' })

    y += 6

    // ── ROAST ──
    if (report.roast) {
      drawSectionTitle('The Roast')
      doc.setFillColor(30, 15, 15)
      const roastLines = doc.splitTextToSize(`"${report.roast}"`, contentW - 8)
      const roastH = roastLines.length * 6.5 + 8
      checkPageBreak(roastH)
      doc.roundedRect(margin, y, contentW, roastH, 2, 2, 'F')
      doc.setFillColor(239, 68, 68)
      doc.rect(margin, y, 2.5, roastH, 'F')
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bolditalic')
      doc.setTextColor(254, 202, 202)
      doc.text(roastLines, margin + 7, y + 7)
      y += roastH + 8
    }

    // ── UX ISSUES ──
    if (report.ux_suggestions?.length) {
      drawSectionTitle('UX Issues')
      report.ux_suggestions.forEach((s: string) => {
        drawBullet(s, [239, 68, 68], [30, 10, 10])
      })
      y += 4
    }

    // ── CRO RECOMMENDATIONS ──
    if (report.cro_recommendations?.length) {
      drawSectionTitle('Conversion Recommendations')
      report.cro_recommendations.forEach((s: string) => {
        drawBullet(s, [34, 197, 94], [10, 30, 15])
      })
      y += 4
    }

    // ── HOMEPAGE REWRITE ──
    if (report.homepage_rewrite) {
      drawSectionTitle('AI-Suggested Homepage Copy')
      doc.setFillColor(15, 15, 30)
      const copyLines = doc.splitTextToSize(report.homepage_rewrite, contentW - 8)
      const copyH = copyLines.length * 6 + 8
      checkPageBreak(copyH)
      doc.roundedRect(margin, y, contentW, copyH, 2, 2, 'F')
      doc.setFillColor(168, 85, 247)
      doc.rect(margin, y, 2.5, copyH, 'F')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(196, 181, 253)
      doc.text(copyLines, margin + 7, y + 7)
      y += copyH + 8
    }

    // ── FOOTER on every page ──
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const ph = doc.internal.pageSize.getHeight()
      doc.setFillColor(2, 2, 10)
      doc.rect(0, ph - 12, pageW, 12, 'F')
      doc.setFillColor(236, 72, 153)
      doc.rect(0, ph - 12, pageW, 0.8, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text('AI Website Advisor · ai-powered analysis', margin, ph - 4)
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, ph - 4, { align: 'right' })
    }

    const hostname = (() => {
      try { return new URL(report.url).hostname.replace('www.', '') } catch { return 'report' }
    })()
    doc.save(`${hostname}-advisor-report.pdf`)
    setLoading(false)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="group w-full glass hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <span className="text-lg leading-none">📄</span>
          Download PDF Report
          <span className="ml-auto flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 group-hover:bg-pink-500/20 transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-pink-400 transition-colors">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </span>
        </>
      )}
    </button>
  )
}
