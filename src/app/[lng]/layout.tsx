// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { DataProvider } from "../../context/dataContext";

import type { ReactNode } from "react";
import LocaleClientWrapper from "@/components/general/LocaleClientWrapper";
import * as React from "react";
import { Locale } from "@/lib/locales";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}

export function generateStaticParams() {
  return [{ lng: "en" }, { lng: "es" }, { lng: "fr" }, { lng: "jp" }, { lng: "zh" }];
}

export const dynamicParams = false;

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { lng } = React.use(params) as { lng: Locale };

  return (
    <>
      <DataProvider>
        <LocaleClientWrapper lng={lng}>{children}</LocaleClientWrapper>
      </DataProvider>
    </>
  );
}
