// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { Metadata } from "next";
import Script from 'next/script'
import '@/styles/globals.css';
import '@/styles/colors.css';
import '@/styles/fonts.css';

export const metadata: Metadata = {
  title: 'Examiniser',
  description: 'Create exam papers quick and easy',
  keywords: [
    'Exam Paper',
    'Create',
    'Templates',
    'Exam',
    'Editor',
    'Edit',
    'School',
    'University',
    'College',
    'Sixth Form',
    'Editor',
    'Question',
    'Maths',
    'Mathematics',
  ],
  applicationName: 'Examiniser',
  openGraph: {
    siteName: 'Examiniser',
    title: 'Create Exam Papers Quick and Easy with Examiniser!',
    description: 'A dedicated editor designed for teachers and students to create worksheets and exam papers, featuring built-in templates and tools for faster, easier exam creation.',
    url: 'https://examiniser.com',
    images: [
      {
        url: 'https://examiniser.com/examiniser.png',
        width: 1200,
        height: 630,
        alt: 'Examiniser Title',
      },
    ],
    type: 'website',
    emails: 'examiniser@gmail.com',
    locale: 'en_GB',
    alternateLocale: ['es_ES', 'fr_FR', 'ja_JP', 'zh_CN'],

  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    noarchive: false,
    nosnippet: false,
    notranslate: false,
    noimageindex: false,
  },
  other: {
    'google-adsense-account': 'ca-pub-6195862060195022',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-JEH2HSSNE3"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-JEH2HSSNE3');
            `,
          }}
        />
        
        {/* Standard Favicon */}
        <link rel="icon" href="/icons/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" href="/icons/favicon-32x32.png" sizes="32x32" />
        
        {/* Android and Chrome Favicon */}
        <link rel="icon" href="/icons/favicon-192x192.png" sizes="192x192" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/favicon-180x180.png" />
        
        {/* Windows Tile Icon (for Microsoft devices) */}
        <meta name="msapplication-TileImage" content="/icons/favicon-144x144.png" />
        <meta name="msapplication-TileColor" content="#FFFFFF" />
        
        {/* High-DPI (Retina) Displays */}
        <link rel="icon" href="/icons/favicon-64x64.png" sizes="64x64" />
        <link rel="icon" href="/icons/favicon-128x128.png" sizes="128x128" />
        
        {/* Additional Apple Touch Icons (for iOS) */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/favicon-152x152.png" />
      </head>
      {children}
    </html>
  );
}