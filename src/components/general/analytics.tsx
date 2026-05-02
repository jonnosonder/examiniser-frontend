// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

const GA_TRACKING_ID = 'G-JEH2HSSNE3'

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPathRef = useRef<string | null>(null)

  useEffect(() => {
    const search = searchParams.toString()
    const pagePath = search ? `${pathname}?${search}` : pathname

    if (lastTrackedPathRef.current === pagePath) {
      return
    }

    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: pagePath,
        page_title: document.title,
        page_location: window.location.href,
      })

      lastTrackedPathRef.current = pagePath
    }
  }, [pathname, searchParams])

  return null
}
