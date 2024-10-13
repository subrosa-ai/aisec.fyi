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
  const [sorting, setSorting] = React.useState<SortingState>([{
    id: 'date',
    desc: true
  }])
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const searchParams = useSearchParams()

  React.useEffect(() => {
    if (searchParams) {
      const rowId = searchParams.get('rowId')
      const isExpanded = searchParams.get('expanded')

      if (rowId && isExpanded === 'true') {
        setExpanded({ [rowId]: true })
        // Scroll to the expanded row
        setTimeout(() => {
          const element = document.getElementById(`row-${rowId}`)
          if (element) element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [searchParams])

  React.useEffect(() => {
    const expandedRowIds = Object.keys(expanded);
    const expandedRowId = expandedRowIds.length > 0 ? expandedRowIds[0] : undefined;

    if (expandedRowId) {
      const params = new URLSearchParams(window.location.search);
      params.set('rowId', expandedRowId);
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
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      expanded,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
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
    enableSorting: true,
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
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    id={`row-${row.id}`}
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
