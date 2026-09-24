"use client";

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as React from "react";

import { Breakdown, Insights as InsightsData, MonthPoint } from "@/lib/insights";
import { cn } from "@/lib/utils";

// --- shared chart chrome ---------------------------------------------------

const SERIES = "var(--viz-series)";
const GRID = "hsl(var(--border))";
const AXIS_INK = "hsl(var(--muted-foreground))";

/**
 * Once measured, the viewBox matches the pixel width 1:1, so axis text sits at
 * its intended size on a phone instead of shrinking with the artwork. 720 is
 * only the pre-measurement guess baked into the prerendered HTML; paired with
 * max-w-full it scales down to fit rather than overflowing, which is also what
 * a reader with JS disabled gets.
 */
function useChartWidth() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(720);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(240, Math.round(entry.contentRect.width)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/** Round an axis maximum up to something a reader can divide in their head. */
function niceMax(value: number) {
  if (value <= 5) return 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  for (const step of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

/** A bar with its data-end rounded and its baseline end square. */
function barPath(x: number, y: number, w: number, h: number, r = 4) {
  const radius = Math.min(r, Math.max(0, w), h / 2);
  if (w <= 0) return "";
  if (radius <= 0) return `M${x},${y} h${w} v${h} h${-w} Z`;
  return [
    `M${x},${y}`,
    `H${x + w - radius}`,
    `A${radius},${radius} 0 0 1 ${x + w},${y + radius}`,
    `V${y + h - radius}`,
    `A${radius},${radius} 0 0 1 ${x + w - radius},${y + h}`,
    `H${x}`,
    "Z",
  ].join(" ");
}

function Tooltip({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
      style={{ left: x, top: y - 8 }}
    >
      {children}
    </div>
  );
}

// --- card ------------------------------------------------------------------

/**
 * Every chart ships with a table twin. The tooltip is an enhancement; the
 * table is how a value is *guaranteed* to be reachable, including by a screen
 * reader and by anyone the series colour fails.
 */
function ChartCard({
  title,
  caption,
  table,
  children,
}: {
  title: string;
  caption?: React.ReactNode;
  table: { columns: [string, string]; rows: [string, number][] };
  children: React.ReactNode;
}) {
  const [view, setView] = React.useState<"chart" | "table">("chart");

  return (
    <section className="min-w-0 rounded-md border p-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={() => setView(view === "chart" ? "table" : "chart")}
          className="shrink-0 rounded border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
          aria-pressed={view === "table"}
        >
          {view === "chart" ? "Table" : "Chart"}
        </button>
      </div>
      {caption && (
        <p className="mt-1 max-w-prose text-xs text-muted-foreground">{caption}</p>
      )}
      <div className="mt-3 min-w-0">
        {view === "chart" ? (
          children
        ) : (
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-1 font-medium">{table.columns[0]}</th>
                  <th className="py-1 text-right font-medium">
                    {table.columns[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map(([label, value]) => (
                  <tr key={label} className="border-b last:border-0">
                    <td className="py-1">{label}</td>
                    <td className="py-1 text-right tabular-nums">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// --- trend line ------------------------------------------------------------

function TrendChart({ monthly }: { monthly: MonthPoint[] }) {
  const [ref, width] = useChartWidth();
  const [hover, setHover] = React.useState<number | null>(null);

  const height = 260;
  const pad = { top: 16, right: 16, bottom: 28, left: 32 };
  const plotW = Math.max(1, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;

  const yMax = niceMax(Math.max(...monthly.map((m) => m.count)));
  const x = (i: number) => pad.left + (plotW * i) / (monthly.length - 1);
  const y = (v: number) => pad.top + plotH - (plotH * v) / yMax;

  const line = monthly.map((m, i) => `${i ? "L" : "M"}${x(i)},${y(m.count)}`).join(" ");
  const area = `${line} L${x(monthly.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  const ticks = [0, yMax / 2, yMax];
  // One label per January keeps the axis readable without crowding.
  const yearTicks = monthly
    .map((m, i) => ({ i, m }))
    .filter(({ m }) => m.label.startsWith("January"));

  const partialIndex = monthly.findIndex((m) => m.partial);
  const active = hover === null ? null : monthly[hover];

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Incidents disclosed per month, ${monthly[0].label} to ${
          monthly[monthly.length - 1].label
        }. Peak ${yMax}.`}
        className="h-auto max-w-full overflow-visible"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(t)}
              y2={y(t)}
              stroke={GRID}
              strokeWidth={1}
            />
            <text
              x={pad.left - 6}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill={AXIS_INK}
              className="tabular-nums"
            >
              {t}
            </text>
          </g>
        ))}

        {/* The build month is still running, so it is banded and excluded from
            the comparisons above rather than drawn as a finished value. */}
        {partialIndex > 0 && (
          <rect
            x={(x(partialIndex - 1) + x(partialIndex)) / 2}
            y={pad.top}
            width={width - pad.right - (x(partialIndex - 1) + x(partialIndex)) / 2}
            height={plotH}
            fill={AXIS_INK}
            opacity={0.08}
          />
        )}

        <path d={area} fill={SERIES} opacity={0.1} />
        <path
          d={line}
          fill="none"
          stroke={SERIES}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {yearTicks.map(({ i, m }) => (
          <text
            key={m.label}
            x={x(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize={10}
            fill={AXIS_INK}
          >
            {m.label.split(" ")[1]}
          </text>
        ))}

        {active && hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.top}
              y2={pad.top + plotH}
              stroke={AXIS_INK}
              strokeWidth={1}
            />
            <circle
              cx={x(hover)}
              cy={y(active.count)}
              r={4}
              fill={SERIES}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          </g>
        )}

        <rect
          x={pad.left}
          y={pad.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onMouseMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - box.left) / box.width;
            setHover(
              Math.max(
                0,
                Math.min(monthly.length - 1, Math.round(ratio * (monthly.length - 1)))
              )
            );
          }}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {active && hover !== null && (
        <Tooltip x={x(hover)} y={y(active.count)}>
          <span className="font-medium">{active.label}</span>
          {" · "}
          {active.count} {active.count === 1 ? "incident" : "incidents"}
          {active.partial && (
            <span className="text-muted-foreground"> (month in progress)</span>
          )}
        </Tooltip>
      )}
    </div>
  );
}

// --- horizontal bars -------------------------------------------------------

function BarChart({ data }: { data: Breakdown[] }) {
  const [ref, width] = useChartWidth();
  const [hover, setHover] = React.useState<number | null>(null);

  // Below this width a left-hand label gutter cannot hold "AI-Enabled Attack"
  // without either clipping it or starving the bar, so the label moves above
  // its own bar and the whole track gets the width instead.
  const stacked = width < 440;
  const rowH = stacked ? 42 : 28;
  const barH = stacked ? 14 : 18; // both well under the 24px ceiling
  const gutter = stacked ? 0 : Math.min(150, Math.max(96, width * 0.38));
  const valueGutter = 34;
  const height = data.length * rowH + 8;
  const trackW = Math.max(1, width - gutter - valueGutter);
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={data.map((d) => `${d.label}: ${d.count}`).join(", ")}
        className="h-auto max-w-full"
      >
        {data.map((d, i) => {
          const y = i * rowH + 4;
          const w = (trackW * d.count) / max;
          const barY = stacked ? y + 18 : y;
          return (
            <g
              key={d.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* full-row hit target, comfortably past the 24px minimum */}
              <rect x={0} y={y} width={width} height={rowH} fill="transparent" />
              <text
                x={stacked ? 0 : gutter - 8}
                y={stacked ? y + 6 : y + barH / 2}
                textAnchor={stacked ? "start" : "end"}
                dominantBaseline="middle"
                fontSize={11}
                fill={AXIS_INK}
              >
                {d.label}
              </text>
              {/* One hue for every bar: the categories have no natural order,
                  so shading by value would double-encode the bar's own length. */}
              <path
                d={barPath(gutter, barY, w, barH)}
                fill={SERIES}
                opacity={hover === null || hover === i ? 1 : 0.55}
              />
              <text
                x={gutter + w + 6}
                y={barY + barH / 2}
                dominantBaseline="middle"
                fontSize={11}
                fill={AXIS_INK}
                className="tabular-nums"
              >
                {d.count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- stat tiles ------------------------------------------------------------

function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {detail && (
        <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
      )}
    </div>
  );
}

// --- composition -----------------------------------------------------------

export function Insights({ insights }: { insights: InsightsData }) {
  const {
    total,
    monthly,
    byCategory,
    byRegion,
    busiestMonth,
    trailingYear,
    priorYear,
    lag,
  } = insights;

  const change =
    priorYear > 0
      ? Math.round(((trailingYear - priorYear) / priorYear) * 100)
      : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Incidents catalogued"
          value={String(total)}
          detail={`${monthly[0].label} – ${monthly[monthly.length - 1].label}`}
        />
        <StatTile
          label="Last 12 complete months"
          value={String(trailingYear)}
          detail={
            change === null
              ? undefined
              : `${change >= 0 ? "+" : ""}${change}% vs the 12 before`
          }
        />
        <StatTile
          label="Busiest month"
          value={String(busiestMonth.count)}
          detail={busiestMonth.label}
        />
        <StatTile
          label="Median disclosure lag"
          value={`${lag.medianMonths} mo`}
          detail={`of the ${lag.known} entries with a known incident date`}
        />
      </div>

      <ChartCard
        title="Incidents disclosed per month"
        caption={
          <>
            Counted by the month an incident became public. The shaded band is
            the current month, which is still in progress and not comparable to
            the ones before it.
          </>
        }
        table={{
          columns: ["Month", "Incidents"],
          rows: [...monthly].reverse().map((m) => [m.label, m.count]),
        }}
      >
        <TrendChart monthly={monthly} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="By category"
          caption="Each incident carries exactly one category."
          table={{
            columns: ["Category", "Incidents"],
            rows: byCategory.map((d) => [d.label, d.count]),
          }}
        >
          <BarChart data={byCategory} />
        </ChartCard>

        <ChartCard
          title="By region"
          caption="“Global” covers incidents with no single jurisdiction. Smaller regions are grouped."
          table={{
            columns: ["Region", "Incidents"],
            rows: byRegion.map((d) => [d.label, d.count]),
          }}
        >
          <BarChart data={byRegion} />
        </ChartCard>
      </div>
    </div>
  );
}
