"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"


interface DataTableRowActionsProps {
  rowId: string,
  link: string
}

export function DataTableRowActions({
  rowId,  link
}: DataTableRowActionsProps) {
  const [isCopied, setIsCopied] = useState(false)
  const copyLinkToClipboard = () => {
    const currentUrl = window.location.href.split('?')[0]
    const linkWithRowId = `${currentUrl}?rowId=${rowId}&expanded=true`

    navigator.clipboard.writeText(linkWithRowId).then(() => {
      setIsCopied(true)
      toast({
        title: "Link copied to clipboard",
        description: "The link to this row has been copied to your clipboard.",
      })
      setTimeout(() => setIsCopied(false), 2000)
    }).catch(err => {
      console.error('Failed to copy: ', err)
      toast({
        title: "Failed to copy link",
        description: "An error occurred while copying the link.",
        variant: "destructive",
      })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={copyLinkToClipboard}>
          {isCopied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        <DropdownMenuItem>Share</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
