"use client"

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const ENCODED_ADDRESS = "nvfrpslv@fhoebfn.nv"
const OBFUSCATED_MAILTO = btoa(rot13(ENCODED_ADDRESS))

function rot13(input: string) {
  return input.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= "Z" ? 65 : 97
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base)
  })
}

function decodeAddress() {
  return rot13(atob(OBFUSCATED_MAILTO))
}

/**
 * Renders a mailto link whose address only ever exists in the DOM after
 * hydration, keeping it out of the static HTML and any pre-render caches.
 */
export function EmailLink({ children, className, ariaLabel }: {
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}) {
  const [href, setHref] = useState<string | undefined>(undefined)

  useEffect(() => {
    setHref(`mailto:${decodeAddress()}`)
  }, [])

  return (
    <Button asChild variant="link" className={className}>
      <Link href={href ?? "#"} aria-label={ariaLabel}>
        {children}
      </Link>
    </Button>
  )
}
