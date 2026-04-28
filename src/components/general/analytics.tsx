// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const GA_TRACKING_ID = 'G-JEH2HSSNE3'

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: pathname,
      })
    }
  }, [pathname])

  return null
}
