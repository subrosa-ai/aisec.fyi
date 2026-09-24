// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { promises as fs } from "fs"
import path from "path"
import { Metadata } from "next"
import Image from "next/image"
import { z } from "zod"

import { columns } from "@/components/parts/columns"
import { DataTable } from "@/components/parts/data-table"
import { aiSecNewschema, aiSecNewschemaType } from "@/data/schema"
import { getLastUpdated } from "@/lib/last-updated"
import logo from '@/app/logo.png'
import Link from "next/link"
import { Button } from "@/components/ui/button"


async function getaiSecNews() {
  const data = await fs.readFile(
    path.join(process.cwd(), "src/data/updates.json")
  )

  const aiSecNews = JSON.parse(data.toString())
  const dataInOrder = aiSecNews.sort((a: aiSecNewschemaType, b: aiSecNewschemaType) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return z.array(aiSecNewschema).parse(dataInOrder)
}

export default async function LeakPage() {
  const data = await getaiSecNews()
  const lastUpdated = await getLastUpdated()

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <Image src={logo} alt="logo" width={32} height={32} />
              <h2 className="text-2xl font-bold tracking-tight">AISec.fyi</h2>
            </div>

            <p className="text-muted-foreground">
              Here&apos;s a list of AI security incidents, privacy breaches, data leaks and other related information
            </p>
            <Button asChild variant="link" className="p-0 h-auto underline">
              <Link href='https://github.com/subrosa-ai/aisec.fyi/pulls' target="_blank" rel="noopener">
                Submit AI Security Issue
              </Link>
            </Button>
          </div>
        </div>
        <DataTable data={data} columns={columns} lastUpdated={lastUpdated} />
      </div>
    </>
  )
}
