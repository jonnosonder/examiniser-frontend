// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { DataProvider } from "../../context/dataContext";

import Analytics from "@/components/analytics";
import type { ReactNode } from "react";
import LocaleClientWrapper from "@/components/LocaleClientWrapper";
import * as React from "react";

type Locale = "en" | "fr" | "zh";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}

export function generateStaticParams() {
  return [{ lng: "en" }, { lng: "fr" }, { lng: "zh" }];
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { lng } = React.use(params) as { lng: Locale };

  return (
    <>
      <body>
          <Analytics />
          <DataProvider>
            <LocaleClientWrapper lng={lng}>{
              children
            }</LocaleClientWrapper >
          </DataProvider>
      </body>
    </>
  );
}
