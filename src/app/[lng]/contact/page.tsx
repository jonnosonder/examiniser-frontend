"use client";

import * as React from "react";
import LegalPageShell from "@/components/landing/legalPageShell";
import { Locale } from "@/lib/locales";
import { useTranslation } from "react-i18next";

export default function ContactPage({ params }: { params: Promise<{ lng: Locale }> }) {
  const { t } = useTranslation();
  const { lng } = React.use(params);

  const relatedLinks = [
    {
      href: "/privacy",
      label: t("legal.links.privacy.label"),
      description: t("legal.links.privacy.description"),
    },
    {
      href: "/terms",
      label: t("legal.links.terms.label"),
      description: t("legal.links.terms.description"),
    },
  ];

  return (
    <LegalPageShell
      lng={lng}
      eyebrow={t("legal.contact.eyebrow")}
      title={t("legal.contact.title")}
      intro={t("legal.contact.intro")}
      relatedLinks={relatedLinks}
      sections={[
        {
          title: t("legal.contact.sections.primary.title"),
          paragraphs: [
            t("legal.contact.sections.primary.p1"),
            t("legal.contact.sections.primary.p2"),
          ],
        },
        {
          title: t("legal.contact.sections.helpful.title"),
          bullets: [
            t("legal.contact.sections.helpful.b1"),
            t("legal.contact.sections.helpful.b2"),
            t("legal.contact.sections.helpful.b3"),
            t("legal.contact.sections.helpful.b4"),
          ],
        },
        {
          title: t("legal.contact.sections.reasons.title"),
          bullets: [
            t("legal.contact.sections.reasons.b1"),
            t("legal.contact.sections.reasons.b2"),
            t("legal.contact.sections.reasons.b3"),
            t("legal.contact.sections.reasons.b4"),
          ],
        },
        {
          title: t("legal.contact.sections.response.title"),
          paragraphs: [
            t("legal.contact.sections.response.p1"),
          ],
        },
      ]}
    />
  );
}