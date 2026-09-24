import { promises as fs } from "fs"
import path from "path"

const REPO_OWNER = "subrosa-ai"
const REPO_NAME = "aisec.fyi"
const FILE_PATH = "src/data/updates.json"

/**
 * Resolves when the news data was last changed.
 *
 * This runs at BUILD time, not request time: the site is a static export
 * (`output: "export"`), so there is no server to call. Doing it here also means
 * the unauthenticated GitHub API is hit once per build rather than once per
 * page view, which previously shared a 60-requests/hour/IP budget across every
 * visitor.
 *
 * Falls back to the newest entry in updates.json when the API is unreachable or
 * rate-limited, so a network blip degrades the string rather than failing the build.
 */
export async function getLastUpdated(): Promise<string> {
  return (await fetchLatestCommitDate()) ?? (await newestEntryDate())
}

async function fetchLatestCommitDate(): Promise<string | null> {
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
    const date = commits?.[0]?.commit?.committer?.date
    return date ? new Date(date).toDateString() : null
  } catch (error) {
    console.warn(`last-updated: GitHub API unreachable, using fallback (${error})`)
    return null
  }
}

async function newestEntryDate(): Promise<string> {
  const raw = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8")
  const entries: Array<{ date: string }> = JSON.parse(raw)

  const newest = entries
    .map((entry) => entry.date)
    .filter((date) => !Number.isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]

  return newest ?? ""
}
