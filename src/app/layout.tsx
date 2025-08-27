// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { Metadata } from "next";
import '../styles/globals.css';
import '../styles/colors.css';
import { DataProvider } from "../context/dataContext";
// import Script from 'next/script'

export const metadata: Metadata = {
  title: "Examiniser",
  description: "Create exam papers",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content="Create exam papers quick and easy" />
        <meta name="keywords" content="exam, paper, edit, school, editor, question, maths, mathematics" />
        <meta property="og:title" content="Examiniser" />
        <meta property="og:description" content="Create exam papers quick and easy" />
        <meta property="og:image" content="https://examiniser.com/" /> 
        <meta property="og:url" content="https://examiniser.com" />

        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"></meta>
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
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
