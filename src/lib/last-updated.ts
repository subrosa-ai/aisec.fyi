// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { execFile } from "child_process"
import { promises as fs } from "fs"
import path from "path"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

const REPO_OWNER = "subrosa-ai"
const REPO_NAME = "aisec.fyi"
const FILE_PATH = "src/data/updates.json"

/**
 * Resolves when the news data was last changed.
 *
 * This runs at BUILD time, not request time: the site is a static export
 * (`output: "export"`), so there is no server to call.
 *
 * Three sources are tried in order, most precise and cheapest first:
 *
 *   1. `git log` on the checkout   — exact day, no network, no rate limit.
 *   2. the GitHub commits API      — exact day, but needs network and shares
 *                                    the unauthenticated 60-req/hour/IP budget.
 *   3. the newest entry date       — month only; updates.json has no day
 *                                    component, so this is the one case where
 *                                    day precision is not available.
 *
 * Every path is funnelled through the formatters below so the rendered string
 * is consistent no matter which one wins.
 */
export async function getLastUpdated(): Promise<string> {
  const fromGit = await gitCommitDate()
  if (fromGit) return formatExactDay(fromGit)

  const fromApi = await fetchLatestCommitDate()
  if (fromApi) return formatExactDay(fromApi)

  return newestEntryDate()
}

/**
 * Formats a precise instant (a commit timestamp) as e.g. "16 October 2024".
 *
 * Pinned to UTC so the rendered day does not shift with the build machine's
 * timezone — a commit at 23:30Z would otherwise render as the next day on any
 * build agent east of Greenwich.
 */
function formatExactDay(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/**
 * Formats a month-only value as e.g. "October 2024".
 *
 * Deliberately NOT pinned to UTC. Strings like "October 2024" parse as local
 * midnight on the 1st, so forcing a UTC rendering would report the previous
 * month on any build agent ahead of UTC. Parsing and formatting both in local
 * time keeps the label stable.
 */
function formatMonthOnly(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })
}

/** Latest commit touching the data file, read straight from the checkout. */
async function gitCommitDate(): Promise<Date | null> {
  try {
    // `-c safe.directory=*` is required because build agents frequently run as a
    // different uid than the one that owns the checkout, and git then refuses
    // with "detected dubious ownership". Without it this call fails on some
    // build workers but not others, so the rendered date would flip between
    // day precision and month precision from one build to the next.
    // Scoped to this invocation only — it writes nothing to any git config.
    const { stdout } = await execFileAsync(
      "git",
      ["-c", "safe.directory=*", "log", "-1", "--format=%cI", "--", FILE_PATH],
      { cwd: process.cwd(), timeout: 5000 }
    )

    const iso = stdout.trim()
    if (!iso) return null // shallow clone, or the file has no history here

    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? null : date
  } catch {
    // Not a git checkout, or git is unavailable — fall through to the API.
    return null
  }
}

async function fetchLatestCommitDate(): Promise<Date | null> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?path=${FILE_PATH}&per_page=1`

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": `${REPO_OWNER}/${REPO_NAME}`,
  }
  // Optional: lifts the build off the shared unauthenticated rate limit.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      console.warn(`last-updated: GitHub API returned ${response.status}, using fallback`)
      return null
    }

    const commits = await response.json()
    const iso = commits?.[0]?.commit?.committer?.date
    if (!iso) return null

    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? null : date
  } catch (error) {
    console.warn(`last-updated: GitHub API unreachable, using fallback (${error})`)
    return null
  }
}

/** Month-precision last resort, derived from the data file itself. */
async function newestEntryDate(): Promise<string> {
  const raw = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8")
  const entries: Array<{ date: string }> = JSON.parse(raw)

  const newest = entries
    .map((entry) => new Date(entry.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  return newest ? formatMonthOnly(newest) : ""
}
