// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Locale, LocaleValues } from "@/lib/locales";

interface LanguageSwitcherProps {
  current: Locale;
}

export default function SwitchLanuageDropDown({ current }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const switchLanguage = (lng: Locale) => {
    setOpen(false);

    // Replace the first segment of the URL with the new language
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && LocaleValues.includes(segments[0])) {
      segments[0] = lng;
    } else {
      segments.unshift(lng);
    }

    // Hard reload the page with the new language
    window.location.href = "/" + segments.join("/");
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
        aria-label="Select language"
      >
        <p className="mr-1 uppercase text-md">{current}</p>
        <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M12.02 0c6.614.011 11.98 5.383 11.98 12 0 6.623-5.376 12-12 12-6.623 0-12-5.377-12-12 0-6.617 5.367-11.989 11.981-12h.039zm3.694 16h-7.427c.639 4.266 2.242 7 3.713 7 1.472 0 3.075-2.734 3.714-7m6.535 0h-5.523c-.426 2.985-1.321 5.402-2.485 6.771 3.669-.76 6.671-3.35 8.008-6.771m-14.974 0h-5.524c1.338 3.421 4.34 6.011 8.009 6.771-1.164-1.369-2.059-3.786-2.485-6.771m-.123-7h-5.736c-.331 1.166-.741 3.389 0 6h5.736c-.188-1.814-.215-3.925 0-6m8.691 0h-7.685c-.195 1.8-.225 3.927 0 6h7.685c.196-1.811.224-3.93 0-6m6.742 0h-5.736c.062.592.308 3.019 0 6h5.736c.741-2.612.331-4.835 0-6m-12.825-7.771c-3.669.76-6.671 3.35-8.009 6.771h5.524c.426-2.985 1.321-5.403 2.485-6.771m5.954 6.771c-.639-4.266-2.242-7-3.714-7-1.471 0-3.074 2.734-3.713 7h7.427zm-1.473-6.771c1.164 1.368 2.059 3.786 2.485 6.771h5.523c-1.337-3.421-4.339-6.011-8.008-6.771"/></svg>
      </button>

      {open && (
        <div className="absolute mt-2 right-0 w-32 bg-white border rounded shadow-lg z-10">
          {(LocaleValues as Locale[]).map((lng) => (
            <button
              key={lng}
              onClick={() => switchLanguage(lng)}
              disabled={current === lng}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 whitespace-nowrap ${
                current === lng ? "font-bold" : ""
              }`}
            >
              {lng === "en" ? "English (EN)" : lng === "es" ? "Español (ES)" : lng === "fr" ? "Français (FR)" : lng === "jp" ? "日本語 (JP)" : "中文 (ZH)"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
