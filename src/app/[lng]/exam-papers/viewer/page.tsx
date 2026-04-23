// SPDX-License-Identifier: GPL-3.0-only
// Copyright (c) 2025 Jonathan Kwok

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/locales";
import {
  buildExamPaperPdfUrl,
  EXAM_PAPERS_CLOUDFRONT_BASE,
  type ExamPaperLevel,
  getExamPaperName,
  getExamPaperPath,
  getExamPaperSource,
  type ExamPaperType,
} from "@/lib/examPapers";

export default function ExamPaperViewerPage({ params }: { params: Promise<{ lng: Locale }> }) {
  const router = useRouter();
  const { lng } = React.use(params);

  const [viewerState, setViewerState] = React.useState<{
    sourceId: string | null;
    sourceName: string;
    level: ExamPaperLevel;
    year: string;
    paperName: string;
    paperType: ExamPaperType;
    pdfUrl: string;
  } | null>(null);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sourceId = searchParams.get("source");
    const requestedLevel = searchParams.get("level");
    const year = searchParams.get("year");
    const paperId = searchParams.get("paper");
    const requestedType = searchParams.get("type");
    const level: ExamPaperLevel = requestedLevel === "sixth-form" ? "sixth-form" : "secondary";
    const paperType: ExamPaperType = requestedType === "answer" ? "answer" : "question";
    const source = getExamPaperSource(sourceId);
    const paperPath = getExamPaperPath(sourceId, level, year, paperId, paperType);
    const paperName = getExamPaperName(sourceId, level, year, paperId);
    const pdfUrl = paperPath ? buildExamPaperPdfUrl(paperPath) : "";

    if (!source || !year || !paperName || !paperPath) {
      setViewerState(null);
      return;
    }

    setViewerState({
      sourceId: source.id,
      sourceName: source.name,
      level,
      year,
      paperName,
      paperType,
      pdfUrl,
    });
  }, []);

  const backHref = viewerState?.sourceId
    ? `/${lng}/exam-papers?source=${viewerState.sourceId}&level=${viewerState.level}`
    : `/${lng}/exam-papers`;

  return (
    <div className="relative w-full h-screen flex flex-col bg-background text-primary overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 z-0 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden
      />

      {/* Header bar */}
      <div className="relative z-[1] flex items-center justify-between px-4 py-3 sm:px-6 border-b border-slate-200 bg-background/90 backdrop-blur-sm animate-fadeInY [animation-delay:80ms] opacity-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="border border-primary rounded-lg px-3 py-1.5 text-sm text-primary transition-shadow duration-200 hover:shadow-[0_0_0_0.3rem_var(--accent)] cursor-pointer shrink-0"
          >
            Back
          </button>
          {viewerState && (
            <h1 className="font-nunito text-lg sm:text-xl text-primary truncate">
              {viewerState.sourceName} - {viewerState.level === "secondary" ? "Secondary" : "Sixth Form"} - {viewerState.year} - {viewerState.paperName} -{" "}
              <span className="font-normal text-base">
                {viewerState.paperType === "answer" ? "Answer Paper" : "Question Paper"}
              </span>
            </h1>
          )}
        </div>
        {viewerState?.pdfUrl && (
          <a
            href={viewerState.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 border border-primary rounded-lg px-3 py-1.5 text-sm text-primary transition-shadow duration-200 hover:shadow-[0_0_0_0.3rem_var(--accent)]"
          >
            Open PDF
          </a>
        )}
      </div>

      {/* Main content: PDF viewer + spacing slot */}
      <div className="relative z-[1] flex flex-1 min-h-0 gap-4 p-4 animate-fadeInY [animation-delay:160ms] opacity-0">
        {/* PDF iframe */}
        <div className="flex-[2] min-w-0 border border-primary rounded-xl overflow-hidden bg-white">
          {viewerState?.pdfUrl ? (
            <iframe
              title={`${viewerState.sourceName}-${viewerState.year}-${viewerState.paperType}`}
              src={`${viewerState.pdfUrl}#toolbar=1`}
              className="w-full h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-primary opacity-50">
              {EXAM_PAPERS_CLOUDFRONT_BASE
                ? "Paper not found for the selected entry."
                : "Set NEXT_PUBLIC_EXAM_PAPERS_CLOUDFRONT_URL to enable PDF viewing."}
            </div>
          )}
        </div>

        {/* Spacing slot */}
        <div className="hidden lg:flex flex-[1] min-w-[16rem] max-w-xs flex-col border border-dashed border-slate-300 rounded-xl bg-white items-center justify-center text-slate-400 text-sm">
          Spacing
        </div>
      </div>
    </div>
  );
}