// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { aiSecNewschemaType } from "@/data/schema";
import { category as categoryTaxonomy, regions } from "@/data/data";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "Month YYYY" -> a sortable month ordinal. */
export function monthIndex(value: string) {
  const [month, year] = String(value).split(" ");
  const m = MONTHS.indexOf(month);
  if (m < 0 || !year) return Number.NaN;
  return Number(year) * 12 + m;
}

function monthLabel(index: number) {
  return `${MONTHS[index % 12]} ${Math.floor(index / 12)}`;
}

export interface MonthPoint {
  label: string;
  /** Short form for the axis, e.g. "Jan 26". */
  short: string;
  count: number;
  /**
   * True for the month the site was built in, which by definition has not
   * finished yet. Charting it as a normal point would invent a cliff or a
   * spike that is an artefact of the build date.
   */
  partial: boolean;
}

export interface Breakdown {
  label: string;
  count: number;
}

export interface Insights {
  total: number;
  monthly: MonthPoint[];
  byCategory: Breakdown[];
  byRegion: Breakdown[];
  busiestMonth: MonthPoint;
  /** Entries disclosed in the most recent complete 12 months. */
  trailingYear: number;
  /** Same window, one year earlier -- the comparison for trailingYear. */
  priorYear: number;
  lag: {
    /** Entries carrying an incidentDate. The rest cannot be measured. */
    known: number;
    medianMonths: number;
  };
}

/**
 * Every figure here is derived at build time and passed down as plain numbers,
 * so the charts render into the static HTML and the browser never re-parses
 * updates.json.
 */
export function buildInsights(
  data: aiSecNewschemaType[],
  buildMonth: string
): Insights {
  const counts = new Map<number, number>();
  for (const entry of data) {
    const index = monthIndex(entry.date);
    if (Number.isNaN(index)) continue;
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }

  const indices = [...counts.keys()].sort((a, b) => a - b);
  const first = indices[0];
  const last = indices[indices.length - 1];
  const partialIndex = monthIndex(buildMonth);

  // Walk every month in range, not just the ones with entries: a line chart
  // that skips empty months silently rescales its own x-axis.
  const monthly: MonthPoint[] = [];
  for (let i = first; i <= last; i++) {
    const label = monthLabel(i);
    const [month, year] = label.split(" ");
    monthly.push({
      label,
      short: `${month.slice(0, 3)} ${year.slice(2)}`,
      count: counts.get(i) ?? 0,
      partial: i === partialIndex,
    });
  }

  const tally = (pick: (e: aiSecNewschemaType) => string) => {
    const map = new Map<string, number>();
    for (const entry of data) {
      const key = pick(entry);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  };

  const categoryLabel = new Map(categoryTaxonomy.map((c) => [c.value, c.label]));
  const byCategory = [...tally((e) => e.category)]
    .map(([value, count]) => ({ label: categoryLabel.get(value) ?? value, count }))
    .sort((a, b) => b.count - a.count);

  // Regions have a long tail of one-offs; past the top handful they are noise
  // on a bar chart, so the tail folds into a single "Other" rather than
  // producing thirty 1px bars.
  const regionLabel = new Map(regions.map((r) => [r.value, r.label]));
  const allRegions = [...tally((e) => e.region)]
    .map(([value, count]) => ({ label: regionLabel.get(value) ?? value, count }))
    .sort((a, b) => b.count - a.count);
  const TOP_REGIONS = 7;
  const head = allRegions.slice(0, TOP_REGIONS);
  const tail = allRegions.slice(TOP_REGIONS);
  const byRegion = tail.length
    ? [...head, { label: `Other (${tail.length} regions)`, count: tail.reduce((n, r) => n + r.count, 0) }]
    : head;

  // Trailing twelve complete months, against the twelve before them. The
  // in-progress month is excluded from both so the comparison is like-for-like.
  const complete = monthly.filter((m) => !m.partial);
  const window = (offset: number) =>
    complete
      .slice(Math.max(0, complete.length - offset - 12), complete.length - offset)
      .reduce((n, m) => n + m.count, 0);

  const lags = data
    .filter((e) => e.incidentDate)
    .map((e) => monthIndex(e.date) - monthIndex(e.incidentDate as string))
    .filter((n) => Number.isFinite(n) && n >= 0)
    .sort((a, b) => a - b);

  const busiestMonth = complete.reduce((best, m) =>
    m.count > best.count ? m : best
  );

  return {
    total: data.length,
    monthly,
    byCategory,
    byRegion,
    busiestMonth,
    trailingYear: window(0),
    priorYear: window(12),
    lag: {
      known: lags.length,
      medianMonths: lags.length ? lags[Math.floor(lags.length / 2)] : 0,
    },
  };
}
