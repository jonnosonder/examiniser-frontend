"use client";

import * as React from "react";
import LegalPageShell from "@/components/landing/legalPageShell";
import { Locale } from "@/lib/locales";
import { useTranslation } from "react-i18next";

export default function PrivacyPage({ params }: { params: Promise<{ lng: Locale }> }) {
  const { t } = useTranslation();
  const { lng } = React.use(params);

  const relatedLinks = [
    {
      href: "/terms",
      label: t("legal.links.terms.label"),
      description: t("legal.links.terms.description"),
    },
    {
      href: "/contact",
      label: t("legal.links.contact.label"),
      description: t("legal.links.contact.description"),
    },
  ];

  return (
    <LegalPageShell
      lng={lng}
      eyebrow={t("legal.privacy.eyebrow")}
      title={t("legal.privacy.title")}
      intro={t("legal.privacy.intro")}
      relatedLinks={relatedLinks}
      sections={[
        {
          title: t("legal.privacy.sections.operators.title"),
          paragraphs: [
            t("legal.privacy.sections.operators.p1"),
          ],
        },
        {
          title: t("legal.privacy.sections.collected.title"),
          bullets: [
            t("legal.privacy.sections.collected.b1"),
            t("legal.privacy.sections.collected.b2"),
            t("legal.privacy.sections.collected.b3"),
          ],
        },
        {
          title: t("legal.privacy.sections.analytics.title"),
          paragraphs: [
            t("legal.privacy.sections.analytics.p1"),
            t("legal.privacy.sections.analytics.p2"),
            t("legal.privacy.sections.analytics.p3"),
          ],
        },
        {
          title: t("legal.privacy.sections.usage.title"),
          bullets: [
            t("legal.privacy.sections.usage.b1"),
            t("legal.privacy.sections.usage.b2"),
            t("legal.privacy.sections.usage.b3"),
          ],
        },
        {
          title: t("legal.privacy.sections.third-party.title"),
          paragraphs: [
            t("legal.privacy.sections.third-party.p1"),
          ],
        },
        {
          title: t("legal.privacy.sections.choices.title"),
          bullets: [
            t("legal.privacy.sections.choices.b1"),
            t("legal.privacy.sections.choices.b2"),
            t("legal.privacy.sections.choices.b3"),
          ],
        },
        {
          title: t("legal.privacy.sections.updates.title"),
          paragraphs: [
            t("legal.privacy.sections.updates.p1"),
            t("legal.privacy.sections.updates.p2"),
          ],
        },
      ]}
    />
  );
}