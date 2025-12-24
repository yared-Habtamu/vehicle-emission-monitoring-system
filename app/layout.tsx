import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VEM - Vehicle Emission Monitoring",
  description:
    "Real-time vehicle emission monitoring platform. Track, analyze, and reduce your carbon footprint with smart sensor technology.",
  keywords: [
    "emission monitoring",
    "air quality",
    "vehicle sensors",
    "environmental data",
    "PM2.5",
    "pollution tracking",
  ],
  // No icons specified to avoid favicon being set
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
