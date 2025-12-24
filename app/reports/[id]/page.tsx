"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download } from "lucide-react"

export default function ReportDetailPage() {
  const params = useParams()
  const id = params?.id ?? ""

  const report = {
    id,
    title: `Report #${id}`,
    date: new Date().toLocaleString(),
    type: "Generated",
    description: "Detailed report for selected period.",
    metrics: { avgPm25: "32.5 μg/m³", reduction: "28%", trips: 245 },
  }

  function downloadCSV() {
    const headers = ["id", "title", "date", "type", "avgPm25", "reduction", "trips"]
    const row = [report.id, report.title, report.date, report.type, report.metrics.avgPm25, report.metrics.reduction, String(report.metrics.trips)]
    const csv = [headers.join(','), row.map(String).join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.replace(/[^a-z0-9]+/gi,'_')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{report.title}</h1>
          </div>

          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-4">{report.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="font-medium text-foreground">{report.date}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-medium text-foreground">{report.type}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Trips</div>
                <div className="font-medium text-foreground">{report.metrics.trips}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadCSV}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
              <Button variant="outline">Share</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
