"use client";

import * as React from "react";
import LegalPageShell from "@/components/landing/legalPageShell";
import { Locale } from "@/lib/locales";
import { useTranslation } from "react-i18next";

export default function TermsPage({ params }: { params: Promise<{ lng: Locale }> }) {
  const { t } = useTranslation();
  const { lng } = React.use(params);

  const relatedLinks = [
    {
      href: "/privacy",
      label: t("legal.links.privacy.label"),
      description: t("legal.links.privacy.description"),
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
      eyebrow={t("legal.terms.eyebrow")}
      title={t("legal.terms.title")}
      intro={t("legal.terms.intro")}
      relatedLinks={relatedLinks}
      sections={[
        {
          title: t("legal.terms.sections.service.title"),
          paragraphs: [
            t("legal.terms.sections.service.p1"),
          ],
        },
        {
          title: t("legal.terms.sections.acceptable-use.title"),
          bullets: [
            t("legal.terms.sections.acceptable-use.b1"),
            t("legal.terms.sections.acceptable-use.b2"),
            t("legal.terms.sections.acceptable-use.b3"),
          ],
        },
        {
          title: t("legal.terms.sections.accuracy.title"),
          paragraphs: [
            t("legal.terms.sections.accuracy.p1"),
            t("legal.terms.sections.accuracy.p2"),
          ],
        },
        {
          title: t("legal.terms.sections.ip.title"),
          paragraphs: [
            t("legal.terms.sections.ip.p1"),
          ],
        },
        {
          title: t("legal.terms.sections.external.title"),
          paragraphs: [
            t("legal.terms.sections.external.p1"),
          ],
        },
        {
          title: t("legal.terms.sections.liability.title"),
          paragraphs: [
            t("legal.terms.sections.liability.p1"),
            t("legal.terms.sections.liability.p2"),
          ],
        },
        {
          title: t("legal.terms.sections.contact-updates.title"),
          paragraphs: [
            t("legal.terms.sections.contact-updates.p1"),
            t("legal.terms.sections.contact-updates.p2"),
          ],
        },
      ]}
    />
  );
}