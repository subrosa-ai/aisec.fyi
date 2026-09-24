#!/usr/bin/env node
// Validates src/data/updates.json against the conventions in README.md.
// Usage: node scripts/validate-data.mjs   (exit code 1 on any error)
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const entries = JSON.parse(readFileSync(path.join(root, "src/data/updates.json"), "utf8"))
const dataTsx = readFileSync(path.join(root, "src/data/data.tsx"), "utf8")

// Pull the `value` strings out of the `category` and `regions` arrays in data.tsx.
const valuesOf = (name) => {
  const m = dataTsx.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\n\\]`))
  if (!m) throw new Error(`could not find "export const ${name}" in src/data/data.tsx`)
  return new Set([...m[1].matchAll(/value: "([^"]+)"/g)].map((x) => x[1]))
}
const categories = valuesOf("category")
const regions = valuesOf("regions")

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const FIELDS = ["id", "title", "region", "date", "link", "summary", "category"]
const errors = []
const seenIds = new Set()
const seenLinks = new Map()

entries.forEach((e, i) => {
  const where = `entry #${i + 1} (${e.id ?? "no id"})`
  const keys = Object.keys(e)
  for (const f of FIELDS) if (typeof e[f] !== "string" || !e[f].trim()) errors.push(`${where}: missing or empty "${f}"`)
  for (const k of keys) if (!FIELDS.includes(k)) errors.push(`${where}: unexpected field "${k}"`)
  if (typeof e.id === "string") {
    if (!/^aisec-\d+$/.test(e.id)) errors.push(`${where}: id must look like aisec-123`)
    if (seenIds.has(e.id)) errors.push(`${where}: duplicate id`)
    seenIds.add(e.id)
  }
  if (typeof e.date === "string") {
    const [month, year, ...rest] = e.date.split(" ")
    if (rest.length || !MONTHS.includes(month) || !/^\d{4}$/.test(year ?? "")) errors.push(`${where}: date must be "Month YYYY", got "${e.date}"`)
  }
  if (typeof e.link === "string") {
    if (!/^https?:\/\/\S+$/.test(e.link)) errors.push(`${where}: link is not a URL`)
    if (seenLinks.has(e.link)) errors.push(`${where}: link already used by ${seenLinks.get(e.link)} (merge the entries or pick a different source)`)
    else seenLinks.set(e.link, e.id)
  }
  if (typeof e.category === "string" && !categories.has(e.category)) errors.push(`${where}: unknown category "${e.category}" (add it to src/data/data.tsx)`)
  if (typeof e.region === "string" && !regions.has(e.region)) errors.push(`${where}: unknown region "${e.region}" (add it to src/data/data.tsx)`)
  if (typeof e.title === "string" && e.title.length > 140) errors.push(`${where}: title longer than 140 characters`)
  if (typeof e.summary === "string" && e.summary.length < 60) errors.push(`${where}: summary is too short to be useful`)
})

// The last entry's numeric id should be the highest, so contributors can just increment it.
const nums = entries.map((e) => Number(String(e.id).replace("aisec-", ""))).filter(Number.isFinite)
if (nums.length && Math.max(...nums) !== nums[nums.length - 1]) errors.push("the last entry should carry the highest id")

if (errors.length) {
  console.error(`updates.json: ${errors.length} problem(s)\n- ` + errors.join("\n- "))
  process.exit(1)
}
console.log(`updates.json OK: ${entries.length} entries, ${categories.size} categories, ${regions.size} regions`)
