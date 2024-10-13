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
    cell: ({ table, row }) => {
      return (
        <Button
          onClick={() => {
            row.toggleExpanded()
            table.setExpanded({ [row.id]: !row.getIsExpanded() })
            document.title = `${row.original.title} | AISec.fyi`;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
              metaDescription.setAttribute("content", row.original.summary);
            }
          }}
          aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          variant="ghost"
          className="md:flex h-8 w-8 p-0 data-[state=open]:bg-muted hidden"
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
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" className="md:w-[100px]"/>
    ),
    cell: ({ row }) => {
      const label = category.find((category) => category.value === row.original.category)

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
        </div>
      )
    },
    filterFn: (row, _, value) => {
      return value.includes(row.original.category)
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" className="md:w-[500px]"/>
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2 w-full">
          <span className="font-medium md:truncate max-w-[500px] w-full md:whitespace-normal md:max-w-none break-words">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
    filterFn: (row, _, value) => {
      return row.original.title.toLocaleLowerCase().includes(value.toLocaleLowerCase())
    },
  },
  {
    accessorKey: "region",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Region"/>
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
      <DataTableColumnHeader column={column} title="Date" className="w-[150px]"/>
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
      return <div className="hidden md:flex">
        <DataTableRowActions rowId={row.id} link={row.original.link} />
      </div>
    },
  },
  {
    id: "expander-mobile",
    header: () => null,
    cell: ({ row }) => {
      return (
        <div className="flex justify-between w-full md:hidden">
          <DataTableRowActions rowId={row.id} link={row.original.link} />
          <Button
          onClick={() => row.toggleExpanded()}
          aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          variant="ghost"
          className="md:hidden p-0 data-[state=open]:bg-muted"
        >
          {row.getIsExpanded() ? (
           <div className="flex items-center"> <ChevronDown className="h-4 w-4" /> Show summary </div>
          ) : (
            <div className="flex items-center"> <ChevronRight className="h-4 w-4" /> Hide summary </div>
          )}
        </Button> 
        </div>
        
      );
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
