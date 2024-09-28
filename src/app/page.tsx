import { promises as fs } from "fs"
import path from "path"
import { Metadata } from "next"
import Image from "next/image"
import { z } from "zod"

import { columns } from "@/components/parts/columns"
import { DataTable } from "@/components/parts/data-table"
import { aiSecNewschema } from "@/data/schema"
import { Toaster } from "@/components/ui/toaster"


async function getaiSecNews() {
  const data = await fs.readFile(
    path.join(process.cwd(), "src/data/updates.json")
  )

  const aiSecNews = JSON.parse(data.toString())

  return z.array(aiSecNewschema).parse(aiSecNews)
}

export default async function LeakPage() {
  const data = await getaiSecNews()

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">AISec.fyi</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of AI security, privacy breach, data leak and other related information
            </p>
          </div>
        </div>
        <DataTable data={data} columns={columns} />
        <Toaster/>
      </div>
    </>
  )
}
