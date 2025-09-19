// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LocaleValuesDict } from "@/lib/locales";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    const browserLang = navigator.language.slice(0, 2);
    const supported: Record<string, string> = LocaleValuesDict;
    const lang = supported[browserLang] || "en";

    router.replace(`/${lang}`);
  }, [router]);

  return (
    <body>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h2 className="inline-flex items-center justify-center text-primary font-nunito text-5xl sm:text-7xl lg:text-8xl cursor-pointer">
          Examiniser
        </h2>
        <p className="text-sm sm:text-md lg:text-lg">Redirecting to your language...</p>
      </div>
    </body>
  );
}
