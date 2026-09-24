// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { promises as fs } from "fs"
import path from "path"
import { Metadata } from "next"

import { z } from "zod"

import { columns } from "@/components/parts/columns"
import { DataTable } from "@/components/parts/data-table"
import { aiSecNewschema, aiSecNewschemaType } from "@/data/schema"
import { getLastUpdated } from "@/lib/last-updated"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/parts/theme-toggle"
import { Logo } from "@/components/parts/logo"
import { Insights } from "@/components/parts/insights"
import { NewsletterSignup } from "@/components/parts/newsletter-signup"
import { SubscribeBanner } from "@/components/parts/subscribe-banner"
import { buildInsights } from "@/lib/insights"


const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function monthKey(date: string) {
  const [month, year] = String(date).split(" ")
  return Number(year) * 12 + MONTHS.indexOf(month)
}

async function getaiSecNews() {
  const data = await fs.readFile(
    path.join(process.cwd(), "src/data/updates.json")
  )

  const aiSecNews = JSON.parse(data.toString())
  // "Month YYYY" is not a format Date() is required to understand, so order on
  // the parsed month rather than leaving it to the engine's date heuristics.
  const dataInOrder = aiSecNews.sort(
    (a: aiSecNewschemaType, b: aiSecNewschemaType) => monthKey(b.date) - monthKey(a.date)
  )

  return z.array(aiSecNewschema).parse(dataInOrder)
}

export default async function LeakPage() {
  const data = await getaiSecNews()
  const lastUpdated = await getLastUpdated()
  // The build month is what marks the trend's final point as incomplete.
  const buildMonth = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  })
  const insights = buildInsights(data, buildMonth)

  return (
    <>
      <SubscribeBanner />
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <h2 className="text-2xl font-bold tracking-tight">AISec.fyi</h2>
            </div>

            <p className="text-muted-foreground">
              Here&apos;s a list of AI security incidents, privacy breaches, data leaks and other related information
            </p>
            <Button asChild variant="link" className="p-0 h-auto underline">
              <Link href='https://github.com/subrosa-ai/aisec.fyi/pulls' target="_blank" rel="noopener">
                Submit an AI Security Issue
              </Link>
            </Button>
          </div>
          <ThemeToggle />
        </div>
        <Insights insights={insights} />
        {/* Static export: this is read at BUILD time, so changing it in
            Netlify needs a redeploy. Unset means the form is not rendered at
            all, which keeps the build green before Kit is configured. */}
        {process.env.NEXT_PUBLIC_KIT_FORM_ACTION && (
          <NewsletterSignup
            action={process.env.NEXT_PUBLIC_KIT_FORM_ACTION}
          />
        )}
        <DataTable data={data} columns={columns} lastUpdated={lastUpdated} />
      </div>
    </>
  )
}
