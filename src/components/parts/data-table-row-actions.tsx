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
import { Share, Share2 } from "lucide-react"


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
  
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0"
          onClick={copyLinkToClipboard}
        >
          <Share2 className="h-4 w-4" />
        </Button>
  )
}
