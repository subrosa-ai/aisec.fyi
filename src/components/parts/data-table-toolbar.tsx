"use client"

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

import { category, regions } from "../../data/data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // Years come from the data itself, so the filter stays correct as entries are added.
  const yearColumn = table.getColumn("year")
  const yearOptions = yearColumn
    ? Array.from(yearColumn.getFacetedUniqueValues().keys())
        .filter((year): year is string => Boolean(year))
        .sort((a, b) => Number(b) - Number(a))
        .map((year) => ({ value: year, label: year }))
    : []

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("region") && (
          <DataTableFacetedFilter
            column={table.getColumn("region")}
            title="Region"
            options={regions}
          />
      )}
        {table.getColumn("category") && (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="Category"
            options={category}
          />
        )}
        {yearColumn && yearOptions.length > 0 && (
          <DataTableFacetedFilter
            column={yearColumn}
            title="Year"
            options={yearOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
