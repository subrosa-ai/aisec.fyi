import { promises as fs } from "fs"
import path from "path"
import { Metadata } from "next"
import Image from "next/image"
import { z } from "zod"

import { columns } from "@/components/parts/columns"
import { DataTable } from "@/components/parts/data-table"
import { aiSecNewschema, aiSecNewschemaType } from "@/data/schema"
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
              Here&apos;s a list of AI security, privacy breach, data leak and other related information
            </p>
            <Button asChild variant="link" className="p-0 h-auto underline">
              <Link href='wip' target="_blank" rel="noopener">
                Submit AI Security Issue
              </Link>
            </Button>
          </div>
        </div>
        <DataTable data={data} columns={columns} />
      </div>
    </>
  )
}
