// SPDX-License-Identifier: GPL-3.0-only
// Copyright (c) 2025 Jonathan Kwok

export type ExamPaperType = "question" | "answer";
export type ExamPaperLevel = "secondary" | "sixth-form";

export type ExamPaperVariant = {
  id: string;
  name: string;
  questionPath: string;
  answerPath: string;
};

export type ExamPaperRecord = {
  level: ExamPaperLevel;
  year: string;
  papers: ExamPaperVariant[];
};

export type ExamPaperSource = {
  id: string;
  name: string;
  papers: ExamPaperRecord[];
};

export const EXAM_PAPERS_CLOUDFRONT_BASE = "https://d2lpkm1h3gh3rw.cloudfront.net";

export const examPaperSources: ExamPaperSource[] = [
  {
    id: "aqa",
    name: "AQA",
    papers: [
      {
        level: "secondary",
        year: "2024",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/aqa/secondary/2024/paper-1/question.pdf", answerPath: "/exam-papers/aqa/secondary/2024/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/aqa/secondary/2024/paper-2/question.pdf", answerPath: "/exam-papers/aqa/secondary/2024/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/aqa/secondary/2024/paper-3/question.pdf", answerPath: "/exam-papers/aqa/secondary/2024/paper-3/answer.pdf" },
        ],
      },
      {
        level: "secondary",
        year: "2023",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/aqa/secondary/2023/paper-1/question.pdf", answerPath: "/exam-papers/aqa/secondary/2023/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/aqa/secondary/2023/paper-2/question.pdf", answerPath: "/exam-papers/aqa/secondary/2023/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/aqa/secondary/2023/paper-3/question.pdf", answerPath: "/exam-papers/aqa/secondary/2023/paper-3/answer.pdf" },
        ],
      },
      {
        level: "sixth-form",
        year: "2024",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/aqa/sixth-form/2024/paper-1/question.pdf", answerPath: "/exam-papers/aqa/sixth-form/2024/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/aqa/sixth-form/2024/paper-2/question.pdf", answerPath: "/exam-papers/aqa/sixth-form/2024/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/aqa/sixth-form/2024/paper-3/question.pdf", answerPath: "/exam-papers/aqa/sixth-form/2024/paper-3/answer.pdf" },
        ],
      },
      {
        level: "sixth-form",
        year: "2023",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/aqa/sixth-form/2023/paper-1/question.pdf", answerPath: "/exam-papers/aqa/sixth-form/2023/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/aqa/sixth-form/2023/paper-2/question.pdf", answerPath: "/exam-papers/aqa/sixth-form/2023/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/aqa/sixth-form/2023/paper-3/question.pdf", answerPath: "/exam-papers/aqa/sixth-form/2023/paper-3/answer.pdf" },
        ],
      },
    ],
  },
  {
    id: "edexcel",
    name: "Edexcel",
    papers: [
      {
        level: "secondary",
        year: "2024",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/edexcel/secondary/2024/paper-1/question.pdf", answerPath: "/exam-papers/edexcel/secondary/2024/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/edexcel/secondary/2024/paper-2/question.pdf", answerPath: "/exam-papers/edexcel/secondary/2024/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/edexcel/secondary/2024/paper-3/question.pdf", answerPath: "/exam-papers/edexcel/secondary/2024/paper-3/answer.pdf" },
        ],
      },
      {
        level: "secondary",
        year: "2023",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/edexcel/secondary/2023/paper-1/question.pdf", answerPath: "/exam-papers/edexcel/secondary/2023/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/edexcel/secondary/2023/paper-2/question.pdf", answerPath: "/exam-papers/edexcel/secondary/2023/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/edexcel/secondary/2023/paper-3/question.pdf", answerPath: "/exam-papers/edexcel/secondary/2023/paper-3/answer.pdf" },
        ],
      },
      {
        level: "sixth-form",
        year: "2024",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/edexcel/sixth-form/2024/paper-1/question.pdf", answerPath: "/exam-papers/edexcel/sixth-form/2024/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/edexcel/sixth-form/2024/paper-2/question.pdf", answerPath: "/exam-papers/edexcel/sixth-form/2024/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/edexcel/sixth-form/2024/paper-3/question.pdf", answerPath: "/exam-papers/edexcel/sixth-form/2024/paper-3/answer.pdf" },
        ],
      },
      {
        level: "sixth-form",
        year: "2023",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/edexcel/sixth-form/2023/paper-1/question.pdf", answerPath: "/exam-papers/edexcel/sixth-form/2023/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/edexcel/sixth-form/2023/paper-2/question.pdf", answerPath: "/exam-papers/edexcel/sixth-form/2023/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/edexcel/sixth-form/2023/paper-3/question.pdf", answerPath: "/exam-papers/edexcel/sixth-form/2023/paper-3/answer.pdf" },
        ],
      },
    ],
  },
  {
    id: "ocr",
    name: "OCR",
    papers: [
      {
        level: "secondary",
        year: "2024",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/ocr/secondary/2024/paper-1/question.pdf", answerPath: "/exam-papers/ocr/secondary/2024/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/ocr/secondary/2024/paper-2/question.pdf", answerPath: "/exam-papers/ocr/secondary/2024/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/ocr/secondary/2024/paper-3/question.pdf", answerPath: "/exam-papers/ocr/secondary/2024/paper-3/answer.pdf" },
        ],
      },
      {
        level: "secondary",
        year: "2023",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/ocr/secondary/2023/paper-1/question.pdf", answerPath: "/exam-papers/ocr/secondary/2023/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/ocr/secondary/2023/paper-2/question.pdf", answerPath: "/exam-papers/ocr/secondary/2023/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/ocr/secondary/2023/paper-3/question.pdf", answerPath: "/exam-papers/ocr/secondary/2023/paper-3/answer.pdf" },
        ],
      },
      {
        level: "sixth-form",
        year: "2024",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/ocr/sixth-form/2024/paper-1/question.pdf", answerPath: "/exam-papers/ocr/sixth-form/2024/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/ocr/sixth-form/2024/paper-2/question.pdf", answerPath: "/exam-papers/ocr/sixth-form/2024/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/ocr/sixth-form/2024/paper-3/question.pdf", answerPath: "/exam-papers/ocr/sixth-form/2024/paper-3/answer.pdf" },
        ],
      },
      {
        level: "sixth-form",
        year: "2023",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/ocr/sixth-form/2023/paper-1/question.pdf", answerPath: "/exam-papers/ocr/sixth-form/2023/paper-1/answer.pdf" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/ocr/sixth-form/2023/paper-2/question.pdf", answerPath: "/exam-papers/ocr/sixth-form/2023/paper-2/answer.pdf" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/ocr/sixth-form/2023/paper-3/question.pdf", answerPath: "/exam-papers/ocr/sixth-form/2023/paper-3/answer.pdf" },
        ],
      },
    ],
  },
  {
    id: "baccalaureat",
    name: "Baccalaureat",
    papers: [
      {
        level: "secondary",
        year: "2024",
        papers: [
          { id: "session-principale", name: "Session Principale", questionPath: "/exam-papers/baccalaureat/secondary/2024/session-principale/question.pdf", answerPath: "/exam-papers/baccalaureat/secondary/2024/session-principale/answer.pdf" },
          { id: "session-rattrapage", name: "Session de Rattrapage", questionPath: "/exam-papers/baccalaureat/secondary/2024/session-rattrapage/question.pdf", answerPath: "/exam-papers/baccalaureat/secondary/2024/session-rattrapage/answer.pdf" },
        ],
      },
      {
        level: "secondary",
        year: "2023",
        papers: [
          { id: "session-principale", name: "Session Principale", questionPath: "/exam-papers/baccalaureat/secondary/2023/session-principale/question.pdf", answerPath: "/exam-papers/baccalaureat/secondary/2023/session-principale/answer.pdf" },
          { id: "session-rattrapage", name: "Session de Rattrapage", questionPath: "/exam-papers/baccalaureat/secondary/2023/session-rattrapage/question.pdf", answerPath: "/exam-papers/baccalaureat/secondary/2023/session-rattrapage/answer.pdf" },
        ],
      },
    ],
  },
  {
    id: "selectividad",
    name: "Selectividad",
    papers: [
      {
        level: "secondary",
        year: "2024",
        papers: [
          { id: "convocatoria-ordinaria", name: "Convocatoria Ordinaria", questionPath: "/exam-papers/selectividad/secondary/2024/convocatoria-ordinaria/question.pdf", answerPath: "/exam-papers/selectividad/secondary/2024/convocatoria-ordinaria/answer.pdf" },
          { id: "convocatoria-extraordinaria", name: "Convocatoria Extraordinaria", questionPath: "/exam-papers/selectividad/secondary/2024/convocatoria-extraordinaria/question.pdf", answerPath: "/exam-papers/selectividad/secondary/2024/convocatoria-extraordinaria/answer.pdf" },
        ],
      },
      {
        level: "secondary",
        year: "2023",
        papers: [
          { id: "convocatoria-ordinaria", name: "Convocatoria Ordinaria", questionPath: "/exam-papers/selectividad/secondary/2023/convocatoria-ordinaria/question.pdf", answerPath: "/exam-papers/selectividad/secondary/2023/convocatoria-ordinaria/answer.pdf" },
          { id: "convocatoria-extraordinaria", name: "Convocatoria Extraordinaria", questionPath: "/exam-papers/selectividad/secondary/2023/convocatoria-extraordinaria/question.pdf", answerPath: "/exam-papers/selectividad/secondary/2023/convocatoria-extraordinaria/answer.pdf" },
        ],
      },
    ],
  },
  {
    id: "japanese-university-entrance-exam",
    name: "University Entrance Exam",
    papers: [
      {
        level: "secondary",
        year: "2024",
        papers: [
          { id: "math-ia", name: "Mathematics I-A", questionPath: "/exam-papers/japanese-university-entrance-exam/secondary/2024/mathematics-ia/question.pdf", answerPath: "/exam-papers/japanese-university-entrance-exam/secondary/2024/mathematics-ia/answer.pdf" },
          { id: "math-iibc", name: "Mathematics II-B-C", questionPath: "/exam-papers/japanese-university-entrance-exam/secondary/2024/mathematics-iibc/question.pdf", answerPath: "/exam-papers/japanese-university-entrance-exam/secondary/2024/mathematics-iibc/answer.pdf" },
        ],
      },
      {
        level: "secondary",
        year: "2023",
        papers: [
          { id: "math-ia", name: "Mathematics I-A", questionPath: "/exam-papers/japanese-university-entrance-exam/secondary/2023/mathematics-ia/question.pdf", answerPath: "/exam-papers/japanese-university-entrance-exam/secondary/2023/mathematics-ia/answer.pdf" },
          { id: "math-iib", name: "Mathematics II-B", questionPath: "/exam-papers/japanese-university-entrance-exam/secondary/2023/mathematics-iib/question.pdf", answerPath: "/exam-papers/japanese-university-entrance-exam/secondary/2023/mathematics-iib/answer.pdf" },
        ],
      },
    ],
  },
  {
    id: "chinese-gaokao",
    name: "Gaokao",
    papers: [
      {
        level: "secondary",
        year: "2024",
        papers: [
          { id: "national-paper-1", name: "National Paper I", questionPath: "/exam-papers/chinese-gaokao/secondary/2024/national-paper-1/question.pdf", answerPath: "/exam-papers/chinese-gaokao/secondary/2024/national-paper-1/answer.pdf" },
          { id: "national-paper-2", name: "National Paper II", questionPath: "/exam-papers/chinese-gaokao/secondary/2024/national-paper-2/question.pdf", answerPath: "/exam-papers/chinese-gaokao/secondary/2024/national-paper-2/answer.pdf" },
        ],
      },
      {
        level: "secondary",
        year: "2023",
        papers: [
          { id: "national-paper-1", name: "National Paper I", questionPath: "/exam-papers/chinese-gaokao/secondary/2023/national-paper-1/question.pdf", answerPath: "/exam-papers/chinese-gaokao/secondary/2023/national-paper-1/answer.pdf" },
          { id: "national-paper-2", name: "National Paper II", questionPath: "/exam-papers/chinese-gaokao/secondary/2023/national-paper-2/question.pdf", answerPath: "/exam-papers/chinese-gaokao/secondary/2023/national-paper-2/answer.pdf" },
        ],
      },
    ],
  },
];

export function buildExamPaperPdfUrl(path: string): string {
  if (!EXAM_PAPERS_CLOUDFRONT_BASE) return "";

  const normalizedBase = EXAM_PAPERS_CLOUDFRONT_BASE.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function getExamPaperSource(sourceId: string | null | undefined): ExamPaperSource | null {
  if (!sourceId) return null;
  return examPaperSources.find((source) => source.id === sourceId) ?? null;
}

export function getExamPaperPath(
  sourceId: string | null | undefined,
  level: ExamPaperLevel | null | undefined,
  year: string | null | undefined,
  paperId: string | null | undefined,
  paperType: ExamPaperType | null | undefined
): string | null {
  const source = getExamPaperSource(sourceId);
  if (!source || !level || !year || !paperId || !paperType) return null;

  const yearEntry = source.papers.find((entry) => entry.level === level && entry.year === year);
  if (!yearEntry) return null;

  const paper = yearEntry.papers.find((entry) => entry.id === paperId);
  if (!paper) return null;

  return paperType === "question" ? paper.questionPath : paper.answerPath;
}

export function getExamPaperName(
  sourceId: string | null | undefined,
  level: ExamPaperLevel | null | undefined,
  year: string | null | undefined,
  paperId: string | null | undefined
): string | null {
  const source = getExamPaperSource(sourceId);
  if (!source || !level || !year || !paperId) return null;

  const yearEntry = source.papers.find((entry) => entry.level === level && entry.year === year);
  if (!yearEntry) return null;

  return yearEntry.papers.find((entry) => entry.id === paperId)?.name ?? null;
}
