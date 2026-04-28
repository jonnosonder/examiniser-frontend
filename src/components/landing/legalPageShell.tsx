"use client";

import Link from "next/link";
import * as React from "react";
import Navbar from "@/components/landing/navbar";
import { Locale } from "@/lib/locales";
import { useTranslation } from "react-i18next";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalLink = {
  href: string;
  label: string;
  description: string;
};

type LegalPageShellProps = {
  lng: Locale;
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  relatedLinks?: LegalLink[];
};

export default function LegalPageShell({
  lng,
  eyebrow,
  title,
  intro,
  sections,
  relatedLinks = [],
}: LegalPageShellProps) {
  const { t } = useTranslation();

  return (
    <>
      <Navbar lng={lng} pageOn="/about" />
      <span className="w-full h-20 flex" />
      <main className="w-full min-h-[calc(100vh-5rem)] px-4 pb-10 text-primary">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
          <section className="relative overflow-hidden rounded-[2rem] border border-grey bg-background/95 p-6 shadow-[0_1.5rem_4rem_rgba(0,0,0,0.08)] lg:flex-[1.15]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.9), transparent 34%), linear-gradient(135deg, rgba(0,0,0,0.025), transparent 60%)",
              }}
            />
            <div className="relative flex flex-col gap-6">
              <div className="border-b border-grey/60 pb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
                <h1 className="font-nunito text-4xl sm:text-5xl">{title}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-primary/85 sm:text-lg">{intro}</p>
              </div>

              <div className="grid gap-4">
                {sections.map((section) => (
                  <article
                    key={section.title}
                    className="rounded-[1.5rem] border border-grey/70 bg-white/70 p-5 backdrop-blur-sm"
                  >
                    <h2 className="font-nunito text-2xl">{section.title}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-3 leading-7 text-primary/85">
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="mt-3 space-y-2 pl-5 text-primary/85">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="list-disc leading-7">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4 lg:w-[20rem] lg:flex-shrink-0">
            <div className="rounded-[2rem] border border-grey bg-background p-5 shadow-[0_1rem_2rem_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{t("legal.common.policy-hub")}</p>
              <p className="mt-3 leading-7 text-primary/85">
                {t("legal.common.hub-description")}
              </p>
            </div>

            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={`/${lng}${link.href}`}
                className="group rounded-[1.75rem] border border-grey bg-white/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_1rem_2rem_rgba(0,0,0,0.08)]"
              >
                <p className="font-nunito text-2xl">{link.label}</p>
                <p className="mt-2 leading-7 text-primary/80">{link.description}</p>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-accent">{t("legal.common.open-page")}</p>
              </Link>
            ))}
          </aside>
        </div>
      </main>
    </>
  );
}