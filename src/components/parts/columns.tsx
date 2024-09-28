"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ChevronRight, ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { category, serverity, regions } from "../../data/data"
import { aiSecNewschemaType } from "../../data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Button } from "../ui/button"
import { parse } from "date-fns"

export const columns: ColumnDef<aiSecNewschemaType>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => row.toggleExpanded()}
          aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button> 
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = category.find((category) => category.value === row.original.category)

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
    filterFn: (row, _, value) => {
      return value.includes(row.original.category)
    },
  },
  {
    accessorKey: "region",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Region" />
    ),
    cell: ({ row }) => {
      const region = regions.find(
        (region) => region.value === row.getValue("region")
      )

      return (
        <div className="flex w-[150px] items-center">
          <span>{region?.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("date")}</span>
        </div>
      )
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = parse(rowA.getValue(columnId), "MMMM yyyy", new Date())
      const dateB = parse(rowB.getValue(columnId), "MMMM yyyy", new Date())
      return dateA.getTime() - dateB.getTime()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <DataTableRowActions rowId={row.id} link={row.original.link} />
    },
  },
  {
    accessorKey: "summary",
    header: "Summary",
    cell: ({ row }) => null,
    enableHiding: true,
    enableSorting: false,
    enableColumnFilter: false,
  },
]
