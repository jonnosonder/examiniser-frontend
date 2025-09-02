// src/components/Analytics.tsx
'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const GA_TRACKING_ID = 'G-JEH2HSSNE3' // replace with your ID

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
