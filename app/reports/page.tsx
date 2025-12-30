"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Calendar,
  TrendingDown,
  Leaf,
  Award,
  Share2,
  Eye,
} from "lucide-react";

import { useEffect, useState } from "react";

function stringifyId(id: any) {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    if ("$oid" in id && typeof id.$oid === "string") return id.$oid;
    if ("toHexString" in id && typeof id.toHexString === "function") {
      try {
        return id.toHexString();
      } catch (e) {
        /* ignore */
      }
    }
    if (typeof id.toString === "function") {
      const s = id.toString();
      if (s && s !== "[object Object]") return s;
    }
  }
  return null;
}

type Report = {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: string;
  status: string;
  metrics: any;
  color?: string;
};

const reportsInitial: Report[] = [];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(reportsInitial);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        if (mounted) setReports(data);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function downloadReportAsCSV(report: any) {
    const headers = [
      "id",
      "title",
      "date",
      "type",
      "avgPm25",
      "reduction",
      "trips",
    ];
    const row = [
      report.id,
      report.title,
      report.date,
      report.type,
      report.metrics.avgPm25,
      report.metrics.reduction,
      String(report.metrics.trips),
    ];
    const csv = [headers.join(","), row.map(String).join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]+/gi, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function generateNewReport() {
    const mock = {
      id: Date.now(),
      title: `New Report ${new Date().toISOString()}`,
      date: new Date().toLocaleString(),
      type: "Ad-hoc",
      metrics: { avgPm25: "N/A", reduction: "0%", trips: 0 },
    };
    downloadReportAsCSV(mock);
  }
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Reports
              </h1>
              <p className="text-muted-foreground">
                Generate and download emission reports
              </p>
            </div>
            <Button onClick={generateNewReport}>
              <FileText className="mr-2 h-4 w-4" />
              Generate New Report
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Reports
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {reports.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-foreground">3</p>
                </div>
                <Calendar className="h-8 w-8 text-accent" />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Shared Reports
                  </p>
                  <p className="text-3xl font-bold text-foreground">8</p>
                </div>
                <Share2 className="h-8 w-8 text-success" />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-foreground">142</p>
                </div>
                <Eye className="h-8 w-8 text-warning" />
              </div>
            </Card>
          </div>

          {/* Recent Reports */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Available Reports
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report, index) => {
                const raw = (report as any)?.id ?? (report as any)?._id;
                const idStr = stringifyId(raw) ?? `report-${index}`;
                return (
                  <Card
                    key={idStr}
                    className="p-6 bg-card border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-14 w-14 rounded-xl ${report.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <FileText className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {report.title}
                          </h3>
                          <Badge className="bg-success/10 text-success border-success/20 flex-shrink-0">
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {report.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <Calendar className="h-3 w-3" />
                          <span>{report.date}</span>
                          <span>•</span>
                          <span>{report.type}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Metric
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                              {report.metrics.avgPm25}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Change
                            </div>
                            <div className="text-sm font-semibold text-success">
                              ↓ {report.metrics.reduction}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Trips
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                              {report.metrics.trips}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/reports/${idStr}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-transparent"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => downloadReportAsCSV(report)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Report Templates */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Report Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  Emission Summary
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete overview of emission levels, trends, and comparisons
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  Generate Report
                </Button>
              </div>

              <div className="p-4 border border-border rounded-lg hover:border-accent transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <Award className="h-5 w-5 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  Compliance Report
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Regulatory compliance data for environmental authorities
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  Generate Report
                </Button>
              </div>

              <div className="p-4 border border-border rounded-lg hover:border-success transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
                  <Leaf className="h-5 w-5 text-success" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  Environmental Impact
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Carbon footprint reduction and SDG contribution analysis
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </Card>

          {/* Export Options */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Export Formats Available
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Download your reports in multiple formats for easy sharing and
                  compliance submissions
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-card text-foreground border-border">
                    PDF
                  </Badge>
                  <Badge className="bg-card text-foreground border-border">
                    CSV
                  </Badge>
                  <Badge className="bg-card text-foreground border-border">
                    Excel
                  </Badge>
                  <Badge className="bg-card text-foreground border-border">
                    JSON
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
