"use client";

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { aiSecNewschemaType } from "@/data/schema";

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Resolved at build time; see src/lib/last-updated.ts */
  lastUpdated: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  lastUpdated,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      summary: false, // Hide the summary column
      year: false, // Backs the Year facet in the toolbar; never rendered
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const titleById = React.useMemo(
    () =>
      new Map(
        (data as any[]).map((d) => [d?.id as string, d?.title as string])
      ),
    [data]
  );

  // Cluster view: show one incident together with everything it links to
  // through `related`, so a single campaign reads as one story instead of
  // rows scattered across 35 pages.
  const [cluster, setCluster] = React.useState<string | null>(null);
  const entryById = React.useMemo(
    () => new Map((data as any[]).map((d) => [d?.id as string, d])),
    [data]
  );
  const rows = React.useMemo(() => {
    if (!cluster) return data;
    const seed = entryById.get(cluster);
    if (!seed) return data;
    const ids = new Set<string>([
      seed.id,
      ...((seed.related ?? []) as string[]),
    ]);
    return (data as any[]).filter((d) => ids.has(d.id)) as typeof data;
  }, [cluster, data, entryById]);

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      columnVisibility,
      rowSelection,
      columnFilters,
      expanded,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowCanExpand: () => true,
    enableSorting: false,
    getRowId: (row, relativeIndex, parent) => {
      return (row as any).id;
    },
  });

  // Read the deep-link params straight off the URL rather than through
  // next/navigation's useSearchParams(). That hook opts this component out of
  // prerendering, and because the whole table sits inside a <Suspense> boundary
  // the static export would ship the fallback ("Loading...") instead of the
  // incident list — leaving the site's actual content out of the HTML.
  // The write path below already uses window.location, so this keeps both
  // directions of the URL sync consistent.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rowId = params.get("rowId");
    const isExpanded = params.get("expanded");
    const clusterId = params.get("cluster");

    if (clusterId) setCluster(clusterId);

    if (rowId && isExpanded === "true") {
      const rowIndex = data.findIndex((item) => (item as any).id === rowId); // Find the index of the item
      const pageSize = table.getState().pagination.pageSize;
      const targetPage = Math.floor(rowIndex / pageSize); // Calculate the target page
      const currentPage = table.getState().pagination.pageIndex; // Get the current page index

      if (currentPage !== targetPage) {
        setExpanded({ [rowId]: true });
        table.setPageIndex(targetPage - 1); // Update the table's page index
      } else {
        setExpanded({ [rowId]: true });
        setTimeout(() => {
          const element = document.getElementById(`row-${rowId}`);
          if (element) element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
    // Runs on mount: restores the expanded row from a shared deep link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip the first run so this does not strip a ?cluster= param out of the URL
  // before the mount effect above has read it.
  const clusterSynced = React.useRef(false);
  React.useEffect(() => {
    if (!clusterSynced.current) {
      clusterSynced.current = true;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (cluster) params.set("cluster", cluster);
    else params.delete("cluster");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
  }, [cluster]);

  const showCluster = (id: string, expand?: string) => {
    setCluster(id);
    table.setPageIndex(0);
    setExpanded(expand ? { [expand]: true } : {});
  };

  React.useEffect(() => {
    const expandedRowIds = Object.keys(expanded);
    const expandedRowId =
      expandedRowIds.length > 0 ? expandedRowIds[0] : undefined;
    if (expandedRowId) {
      const params = new URLSearchParams(window.location.search);
      params.set("rowId", expandedRowId); // Use rowId instead of expandedRowId
      params.set("expanded", "true");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params}`
      );
    } else {
      const params = new URLSearchParams(window.location.search);
      params.delete("rowId");
      params.delete("expanded");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params}`
      );
    }
  }, [expanded]);

  return (
    <div className="space-y-4">
      {cluster && (
        <div className="flex items-center justify-between gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
          <span>
            Showing {table.getFilteredRowModel().rows.length} incidents related
            to{" "}
            <span className="font-medium">
              {titleById.get(cluster) ?? cluster}
            </span>
          </span>
          <Button
            variant="ghost"
            className="h-7 px-2"
            onClick={() => setCluster(null)}
          >
            Show all incidents
          </Button>
        </div>
      )}
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table className="w-full divide-y divide-gray-200 block md:table md:table-fixed">
          <TableHeader className="hidden md:table-header-group">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="md:table-row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "md:table-cell",
                        header.column.columnDef.meta?.headClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="block md:table-row-group">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={(row.original as any).id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    id={`row-${(row.original as any).id}`}
                    aria-expanded={row.getIsExpanded()}
                    className={cn(
                      "relative block md:table-row p-4 md:p-0 mb-4 md:mb-0 w-full",
                      // The accent edge is an inset box-shadow, never a
                      // ::before. A pseudo-element child of a <tr> gets wrapped
                      // in an anonymous table cell, which adds a phantom column
                      // and shifts every real cell one place to the right.
                      row.getIsExpanded() &&
                        "bg-muted/40 hover:bg-muted/40 shadow-[inset_2px_0_0_hsl(var(--foreground))]"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "block md:table-cell p-2 align-top",
                          cell.column.columnDef.meta?.cellClassName
                        )}
                        data-label={cell.column.columnDef.id} // Add data-label for mobile
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="block md:table-row hover:bg-transparent">
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="block md:table-cell p-0"
                      >
                        <div className="overflow-hidden border-l-2 border-l-foreground bg-muted/40">
                          <div className="grid grid-cols-1 gap-x-4 p-4 md:grid-cols-[auto,1fr]">
                            <div className="hidden w-8 md:block" />
                            <div className="space-y-4">
                              <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Summary
                              </h4>
                              <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-foreground">
                                {(row.original as any).summary ??
                                  "No summary available"}
                              </p>
                              {(row.original as any).link && (
                                <Button
                                  asChild
                                  variant="link"
                                  className="mt-2 h-auto p-0 text-sm underline"
                                >
                                  <Link
                                    href={(row.original as any).link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Source
                                  </Link>
                                </Button>
                              )}
                              {(row.original as any).incidentDate && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Occurred {(row.original as any).incidentDate}
                                  {" · disclosed "}
                                  {(row.original as any).date}
                                </p>
                              )}
                              </div>
                              {((row.original as any).sources ?? []).length >
                                0 && (
                                <div>
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    More sources
                                  </h5>
                                  <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                                    {(
                                      (row.original as any).sources as string[]
                                    ).map((src) => (
                                      <li key={src}>
                                        <Link
                                          href={src}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-foreground underline underline-offset-2 hover:text-primary"
                                        >
                                          {hostnameOf(src)}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {((row.original as any).related ?? []).length >
                                0 && (
                                <div>
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Related incidents
                                  </h5>
                                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm marker:text-muted-foreground">
                                    {(
                                      (row.original as any).related as string[]
                                    ).map((rid) => (
                                      <li key={rid}>
                                        <button
                                          type="button"
                                          className="text-left text-foreground underline underline-offset-2 hover:text-primary"
                                          onClick={() =>
                                            showCluster(rid, rid)
                                          }
                                        >
                                          {titleById.get(rid) ?? rid}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                  {cluster !== (row.original as any).id && (
                                    <Button
                                      variant="link"
                                      className="mt-1 h-auto p-0 text-xs underline"
                                      onClick={() =>
                                        showCluster((row.original as any).id)
                                      }
                                    >
                                      Show this cluster on its own
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} lastUpdated={lastUpdated} />
    </div>
  );
}
