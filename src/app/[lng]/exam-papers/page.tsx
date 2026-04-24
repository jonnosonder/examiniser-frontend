// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Locale } from "@/lib/locales";
import { examPaperSources, type ExamPaperLevel, type ExamPaperTier } from "@/lib/examPapers";
import { useRouter } from "next/navigation";

export default function ExamPapersPage({ params }: { params: Promise<{ lng: Locale }> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { lng } = React.use(params);

  type PaperTableRow = {
    rowId: string;
    rowName: string;
    paperId: string;
    paperTier?: ExamPaperTier;
    date: string;
  };

  const [expandedSourceId, setExpandedSourceId] = React.useState<string | null>(null);
  const [activeLevelBySourceId, setActiveLevelBySourceId] = React.useState<Record<string, ExamPaperLevel>>({});

  const getSourceLevels = React.useCallback((sourceId: string): ExamPaperLevel[] => {
    const source = examPaperSources.find((entry) => entry.id === sourceId);
    if (!source) return [];

    const allLevels: ExamPaperLevel[] = ["secondary", "sixth-form"];
    return allLevels.filter((level) => source.papers.some((paperSet) => paperSet.level === level));
  }, []);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sourceId = searchParams.get("source");
    const requestedLevel = searchParams.get("level");
    const preferredLevel: ExamPaperLevel | null =
      requestedLevel === "secondary" || requestedLevel === "sixth-form" ? requestedLevel : null;
    if (!sourceId) {
      setExpandedSourceId(null);
      return;
    }
    const exists = examPaperSources.some((source) => source.id === sourceId);
    if (!exists) {
      setExpandedSourceId(null);
      return;
    }

    setExpandedSourceId(sourceId);
    setActiveLevelBySourceId((prev) => {
      if (preferredLevel) {
        return { ...prev, [sourceId]: preferredLevel };
      }
      if (prev[sourceId]) return prev;
      const levels = getSourceLevels(sourceId);
      if (!levels[0]) return prev;
      return { ...prev, [sourceId]: levels[0] };
    });
  }, [getSourceLevels]);

  const openPaperViewer = (
    sourceId: string,
    level: ExamPaperLevel,
    year: string,
    paperId: string,
    paperType: "question" | "answer",
    date: string,
    paperTier?: ExamPaperTier
  ) => {
    const query = new URLSearchParams({ source: sourceId, level, year, paper: paperId, type: paperType, date });
    if (paperTier) {
      query.set("tier", paperTier);
    }
    router.push(`/${lng}/exam-papers/viewer?${query.toString()}`);
  };

  const toggleSourceExpansion = (sourceId: string) => {
    setExpandedSourceId((prev) => {
      if (prev === sourceId) return null;

      setActiveLevelBySourceId((current) => {
        if (current[sourceId]) return current;
        const levels = getSourceLevels(sourceId);
        if (!levels[0]) return current;
        return { ...current, [sourceId]: levels[0] };
      });

      return sourceId;
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-primary">
      {/* Grid background */}
      <div
        className="absolute inset-0 z-0 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden
      />


      <div className="relative z-[1] flex flex-col items-center w-full min-h-screen px-4 py-8 sm:py-10">
        <div className="w-full md:w-[90vw] lg:w-[80vw] flex flex-col">

          {/* Header row */}
          <div className="flex items-center justify-between mb-6 animate-fadeInY [animation-delay:100ms] opacity-0">
            <h1 className="text-3xl sm:text-4xl font-nunito text-primary">{t("education.exam-papers")}</h1>
            <button
              type="button"
              onClick={() => router.push(`/${lng}`)}
              className="border bg-white border-primary rounded-lg px-4 py-2 text-sm text-primary transition-shadow duration-200 hover:shadow-[0_0_0_0.3rem_var(--accent)] cursor-pointer"
            >
              {`← ${t("general.back-to-home")}`}
            </button>
          </div>

          {/* Source accordions */}
          <div className="flex flex-col gap-4">
            {examPaperSources.map((source, index) => {
              const sourceLevels = getSourceLevels(source.id);
              const activeLevel = activeLevelBySourceId[source.id] ?? sourceLevels[0] ?? "secondary";
              const isExpanded = expandedSourceId === source.id;
              const yearEntries = source.papers.filter((entry) => entry.level === activeLevel);

              return (
                <div
                  key={source.id}
                  className="border-2 border-primary rounded-xl bg-white animate-fadeInY opacity-0 transition-shadow duration-200 hover:shadow-[0_0_0_0.5rem_var(--accent)]"
                  style={{ animationDelay: `${160 + index * 50}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSourceExpansion(source.id)}
                    className="w-full p-5 text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xl font-nunito text-primary">{source.name}</p>
                        <p className="text-sm text-primary mt-1 opacity-60">
                          {new Set(source.papers.map((entry) => entry.year)).size} years of papers / {source.papers.reduce((sum, entry) => sum + entry.papers.reduce((paperSum, paper) => paperSum + (paper.tierVariants?.length ?? 1), 0), 0)} papers
                        </p>
                      </div>
                      <p className="text-xl text-primary">{isExpanded ? "−" : "+"}</p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      {sourceLevels.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                          {sourceLevels.map((level) => (
                            <button
                              key={`${source.id}-${level}`}
                              type="button"
                              onClick={() => setActiveLevelBySourceId((prev) => ({ ...prev, [source.id]: level }))}
                              className={`rounded-lg px-3 py-1.5 text-sm border transition-shadow duration-200 cursor-pointer ${
                                activeLevel === level
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-primary border-primary hover:shadow-[0_0_0_0.3rem_var(--accent)]"
                              }`}
                            >
                              {level === "secondary" ? "Secondary" : "Sixth Form"}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col gap-4">
                        {yearEntries.map((yearEntry) => (
                          <div key={`${source.id}-${activeLevel}-${yearEntry.year}`} className="border border-slate-300 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-300 bg-slate-100">
                              <p className="font-nunito text-lg text-primary">{yearEntry.year}</p>
                            </div>

                            <table className="w-full text-sm text-primary">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Paper Name</th>
                                  <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Date</th>
                                  <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Question Paper</th>
                                  <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Answer Paper</th>
                                </tr>
                              </thead>
                              <tbody>
                                {yearEntry.papers.flatMap<PaperTableRow>((paper) => {
                                  const dateLabel = yearEntry.date ?? yearEntry.year;

                                  if (paper.tierVariants?.length) {
                                    return paper.tierVariants.map((tierVariant) => ({
                                      rowId: `${source.id}-${activeLevel}-${yearEntry.year}-${paper.id}-${tierVariant.tier}`,
                                      rowName: `${paper.name} (${tierVariant.name})`,
                                      paperId: paper.id,
                                      paperTier: tierVariant.tier,
                                      date: tierVariant.date ?? dateLabel,
                                    }));
                                  }

                                  return [
                                    {
                                      rowId: `${source.id}-${activeLevel}-${yearEntry.year}-${paper.id}`,
                                      rowName: paper.name,
                                      paperId: paper.id,
                                      paperTier: undefined,
                                      date: dateLabel,
                                    },
                                  ];
                                }).map((row, rowIndex) => (
                                  <tr key={row.rowId} className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                    <td className="px-4 py-3 border-b border-slate-200">{row.rowName}</td>
                                    <td className="px-4 py-3 border-b border-slate-200">{row.date}</td>
                                    <td className="px-4 py-3 border-b border-slate-200">
                                      <button
                                        type="button"
                                        onClick={() => openPaperViewer(source.id, activeLevel, yearEntry.year, row.paperId, "question", row.date, row.paperTier)}
                                        className="border border-primary rounded-lg px-3 py-1.5 text-sm text-primary transition-shadow duration-200 hover:shadow-[0_0_0_0.3rem_var(--accent)] cursor-pointer"
                                      >
                                        View PDF
                                      </button>
                                    </td>
                                    <td className="px-4 py-3 border-b border-slate-200">
                                      <button
                                        type="button"
                                        onClick={() => openPaperViewer(source.id, activeLevel, yearEntry.year, row.paperId, "answer", row.date, row.paperTier)}
                                        className="border border-primary rounded-lg px-3 py-1.5 text-sm text-primary transition-shadow duration-200 hover:shadow-[0_0_0_0.3rem_var(--accent)] cursor-pointer"
                                      >
                                        View PDF
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
