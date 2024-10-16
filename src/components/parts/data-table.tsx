"use client"

import * as React from "react"
import { useSearchParams } from 'next/navigation'
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
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

import Link from "next/link"
import { Button } from "../ui/button"
import { aiSecNewschemaType } from "@/data/schema"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    summary: false, // Hide the summary column
  })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const searchParams = useSearchParams()

  React.useEffect(() => {
    if (searchParams) {
      const rowId = searchParams.get('rowId');
      const isExpanded = searchParams.get('expanded');

      if (rowId && isExpanded === 'true') {
        const rowIndex = data.findIndex(item => (item as any).id === rowId); // Find the index of the item
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
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }, [searchParams, data]);

  React.useEffect(() => {
    const expandedRowIds = Object.keys(expanded);
    const expandedRowId = expandedRowIds.length > 0 ? expandedRowIds[0] : undefined;
    console.log('expadned', expandedRowId)
    if (expandedRowId) {
      const params = new URLSearchParams(window.location.search);
      params.set('rowId', expandedRowId); // Use rowId instead of expandedRowId
      params.set('expanded', 'true');
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    } else {
      const params = new URLSearchParams(window.location.search);
      params.delete('rowId');
      params.delete('expanded');
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    }
  }, [expanded])

  const table = useReactTable({
    data: data,
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
    }
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table className="min-w-full divide-y divide-gray-200 block md:table">
          <TableHeader className="hidden md:table-header-group">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="md:table-row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className="md:table-cell">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={(row.original as any).id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    id={`row-${(row.original as any).id}`}
                    className="relative block md:table-row p-4 md:p-0 md:mb-4 md:mb-0 w-full"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="block md:table-cell p-2"
                        data-label={cell.column.columnDef.header} // Add data-label for mobile
                        style={{
                          width: cell.column.id === 'expander' ? '10px' : 'unset'
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="h-24">
                      <TableCell colSpan={columns.length} className="p-0">
                        <div className="bg-muted overflow-hidden">
                          <div className="grid grid-cols-[auto,1fr] gap-x-4 p-4">
                            <div className="w-8" />
                            <div>
                              <h4 className="font-semibold mb-2">Summary</h4>
                              <p className="mb-2 text-sm text-muted-foreground">
                                {(row.original as any).summary ?? 'No summary available'}
                              </p>
                              {(row.original as any).link && (
                                <Button asChild variant="link" className="p-0 h-auto underline">
                                  <Link href={(row.original as any).link} target="_blank" rel="noopener noreferrer">
                                    Source
                                  </Link>
                                </Button>
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
