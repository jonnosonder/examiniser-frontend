// SPDX-License-Identifier: GPL-3.0-only
// Copyright (c) 2025 Jonathan Kwok

export type ExamPaperType = "question" | "answer";
export type ExamPaperLevel = "secondary" | "sixth-form";
export type ExamPaperTier = "foundation" | "higher";

export type ExamPaperTierVariant = {
  tier: ExamPaperTier;
  name: string;
  questionPath: string;
  answerPath: string;
  date?: string;
};

export type ExamPaperVariant = {
  id: string;
  name: string;
  questionPath?: string;
  answerPath?: string;
  tierVariants?: ExamPaperTierVariant[];
};

export type ExamPaperRecord = {
  level: ExamPaperLevel;
  year: string;
  date?: string;
  papers: ExamPaperVariant[];
};

export type ExamPaperSource = {
  id: string;
  name: string;
  papers: ExamPaperRecord[];
};

export const EXAM_PAPERS_CLOUDFRONT_BASE = "https://d2lpkm1h3gh3rw.cloudfront.net";

const rawExamPaperSources: ExamPaperSource[] = [
  {
    id: "aqa",
    name: "AQA",
    papers: [
      {
        level: "secondary",
        year: "2024",
        papers: [
          {
            id: "paper-1",
            name: "Paper 1",
            tierVariants: [
              {
                tier: "foundation",
                name: "Foundation",
                questionPath: "/exam-papers/aqa/secondary/2024/paper-1/foundation/question.PDF",
                answerPath: "/exam-papers/aqa/secondary/2024/paper-1/foundation/answer.PDF",
              },
              {
                tier: "higher",
                name: "Higher",
                questionPath: "/exam-papers/aqa/secondary/2024/paper-1/higher/question.PDF",
                answerPath: "/exam-papers/aqa/secondary/2024/paper-1/higher/answer.PDF",
              },
            ],
          },
          {
            id: "paper-2",
            name: "Paper 2",
            tierVariants: [
              {
                tier: "foundation",
                name: "Foundation",
                questionPath: "/exam-papers/aqa/secondary/2024/paper-2/foundation/question.PDF",
                answerPath: "/exam-papers/aqa/secondary/2024/paper-2/foundation/answer.PDF",
              },
              {
                tier: "higher",
                name: "Higher",
                questionPath: "/exam-papers/aqa/secondary/2024/paper-2/higher/question.PDF",
                answerPath: "/exam-papers/aqa/secondary/2024/paper-2/higher/answer.PDF",
              },
            ],
          },
          {
            id: "paper-3",
            name: "Paper 3",
            tierVariants: [
              {
                tier: "foundation",
                name: "Foundation",
                questionPath: "/exam-papers/aqa/secondary/2024/paper-3/foundation/question.PDF",
                answerPath: "/exam-papers/aqa/secondary/2024/paper-3/foundation/answer.PDF",
              },
              {
                tier: "higher",
                name: "Higher",
                questionPath: "/exam-papers/aqa/secondary/2024/paper-3/higher/question.PDF",
                answerPath: "/exam-papers/aqa/secondary/2024/paper-3/higher/answer.PDF",
              },
            ],
          },
        ],
      },
      {
        level: "sixth-form",
        year: "2024",
        papers: [
          { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/aqa/sixth-form/2024/paper-1/question.PDF", answerPath: "/exam-papers/aqa/sixth-form/2024/paper-1/answer.PDF" },
          { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/aqa/sixth-form/2024/paper-2/question.PDF", answerPath: "/exam-papers/aqa/sixth-form/2024/paper-2/answer.PDF" },
          { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/aqa/sixth-form/2024/paper-3/question.PDF", answerPath: "/exam-papers/aqa/sixth-form/2024/paper-3/answer.PDF" },
        ],
      },
    ],
  },
  //{
  //  id: "edexcel",
  //  name: "Edexcel",
  //  papers: [
  //    {
  //      level: "secondary",
  //      year: "2024",
  //      papers: [
  //        { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/edexcel/secondary/2024/paper-1/question.PDF", answerPath: "/exam-papers/edexcel/secondary/2024/paper-1/answer.PDF" },
  //        { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/edexcel/secondary/2024/paper-2/question.PDF", answerPath: "/exam-papers/edexcel/secondary/2024/paper-2/answer.PDF" },
  //        { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/edexcel/secondary/2024/paper-3/question.PDF", answerPath: "/exam-papers/edexcel/secondary/2024/paper-3/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "secondary",
  //      year: "2023",
  //      papers: [
  //        { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/edexcel/secondary/2023/paper-1/question.PDF", answerPath: "/exam-papers/edexcel/secondary/2023/paper-1/answer.PDF" },
  //        { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/edexcel/secondary/2023/paper-2/question.PDF", answerPath: "/exam-papers/edexcel/secondary/2023/paper-2/answer.PDF" },
  //        { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/edexcel/secondary/2023/paper-3/question.PDF", answerPath: "/exam-papers/edexcel/secondary/2023/paper-3/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "sixth-form",
  //      year: "2024",
  //      papers: [
  //        { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/edexcel/sixth-form/2024/paper-1/question.PDF", answerPath: "/exam-papers/edexcel/sixth-form/2024/paper-1/answer.PDF" },
  //        { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/edexcel/sixth-form/2024/paper-2/question.PDF", answerPath: "/exam-papers/edexcel/sixth-form/2024/paper-2/answer.PDF" },
  //        { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/edexcel/sixth-form/2024/paper-3/question.PDF", answerPath: "/exam-papers/edexcel/sixth-form/2024/paper-3/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "sixth-form",
  //      year: "2023",
  //      papers: [
  //        { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/edexcel/sixth-form/2023/paper-1/question.PDF", answerPath: "/exam-papers/edexcel/sixth-form/2023/paper-1/answer.PDF" },
  //        { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/edexcel/sixth-form/2023/paper-2/question.PDF", answerPath: "/exam-papers/edexcel/sixth-form/2023/paper-2/answer.PDF" },
  //        { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/edexcel/sixth-form/2023/paper-3/question.PDF", answerPath: "/exam-papers/edexcel/sixth-form/2023/paper-3/answer.PDF" },
  //      ],
  //    },
  //  ],
  //},
  //{
  //  id: "ocr",
  //  name: "OCR",
  //  papers: [
  //    {
  //      level: "secondary",
  //      year: "2024",
  //      papers: [
  //        { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/ocr/secondary/2024/paper-1/question.PDF", answerPath: "/exam-papers/ocr/secondary/2024/paper-1/answer.PDF" },
  //        { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/ocr/secondary/2024/paper-2/question.PDF", answerPath: "/exam-papers/ocr/secondary/2024/paper-2/answer.PDF" },
  //        { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/ocr/secondary/2024/paper-3/question.PDF", answerPath: "/exam-papers/ocr/secondary/2024/paper-3/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "secondary",
  //      year: "2023",
  //      papers: [
  //        { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/ocr/secondary/2023/paper-1/question.PDF", answerPath: "/exam-papers/ocr/secondary/2023/paper-1/answer.PDF" },
  //        { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/ocr/secondary/2023/paper-2/question.PDF", answerPath: "/exam-papers/ocr/secondary/2023/paper-2/answer.PDF" },
  //        { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/ocr/secondary/2023/paper-3/question.PDF", answerPath: "/exam-papers/ocr/secondary/2023/paper-3/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "sixth-form",
  //      year: "2024",
  //      papers: [
  //        { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/ocr/sixth-form/2024/paper-1/question.PDF", answerPath: "/exam-papers/ocr/sixth-form/2024/paper-1/answer.PDF" },
  //        { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/ocr/sixth-form/2024/paper-2/question.PDF", answerPath: "/exam-papers/ocr/sixth-form/2024/paper-2/answer.PDF" },
  //        { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/ocr/sixth-form/2024/paper-3/question.PDF", answerPath: "/exam-papers/ocr/sixth-form/2024/paper-3/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "sixth-form",
  //      year: "2023",
  //      papers: [
  //        { id: "paper-1", name: "Paper 1", questionPath: "/exam-papers/ocr/sixth-form/2023/paper-1/question.PDF", answerPath: "/exam-papers/ocr/sixth-form/2023/paper-1/answer.PDF" },
  //        { id: "paper-2", name: "Paper 2", questionPath: "/exam-papers/ocr/sixth-form/2023/paper-2/question.PDF", answerPath: "/exam-papers/ocr/sixth-form/2023/paper-2/answer.PDF" },
  //        { id: "paper-3", name: "Paper 3", questionPath: "/exam-papers/ocr/sixth-form/2023/paper-3/question.PDF", answerPath: "/exam-papers/ocr/sixth-form/2023/paper-3/answer.PDF" },
  //      ],
  //    },
  //  ],
  //},
  //{
  //  id: "baccalaureat",
  //  name: "Baccalaureat",
  //  papers: [
  //    {
  //      level: "secondary",
  //      year: "2024",
  //      papers: [
  //        { id: "session-principale", name: "Session Principale", questionPath: "/exam-papers/baccalaureat/secondary/2024/session-principale/question.PDF", answerPath: "/exam-papers/baccalaureat/secondary/2024/session-principale/answer.PDF" },
  //        { id: "session-rattrapage", name: "Session de Rattrapage", questionPath: "/exam-papers/baccalaureat/secondary/2024/session-rattrapage/question.PDF", answerPath: "/exam-papers/baccalaureat/secondary/2024/session-rattrapage/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "secondary",
  //      year: "2023",
  //      papers: [
  //        { id: "session-principale", name: "Session Principale", questionPath: "/exam-papers/baccalaureat/secondary/2023/session-principale/question.PDF", answerPath: "/exam-papers/baccalaureat/secondary/2023/session-principale/answer.PDF" },
  //        { id: "session-rattrapage", name: "Session de Rattrapage", questionPath: "/exam-papers/baccalaureat/secondary/2023/session-rattrapage/question.PDF", answerPath: "/exam-papers/baccalaureat/secondary/2023/session-rattrapage/answer.PDF" },
  //      ],
  //    },
  //  ],
  //},
  //{
  //  id: "selectividad",
  //  name: "Selectividad",
  //  papers: [
  //    {
  //      level: "secondary",
  //      year: "2024",
  //      papers: [
  //        { id: "convocatoria-ordinaria", name: "Convocatoria Ordinaria", questionPath: "/exam-papers/selectividad/secondary/2024/convocatoria-ordinaria/question.PDF", answerPath: "/exam-papers/selectividad/secondary/2024/convocatoria-ordinaria/answer.PDF" },
  //        { id: "convocatoria-extraordinaria", name: "Convocatoria Extraordinaria", questionPath: "/exam-papers/selectividad/secondary/2024/convocatoria-extraordinaria/question.PDF", answerPath: "/exam-papers/selectividad/secondary/2024/convocatoria-extraordinaria/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "secondary",
  //      year: "2023",
  //      papers: [
  //        { id: "convocatoria-ordinaria", name: "Convocatoria Ordinaria", questionPath: "/exam-papers/selectividad/secondary/2023/convocatoria-ordinaria/question.PDF", answerPath: "/exam-papers/selectividad/secondary/2023/convocatoria-ordinaria/answer.PDF" },
  //        { id: "convocatoria-extraordinaria", name: "Convocatoria Extraordinaria", questionPath: "/exam-papers/selectividad/secondary/2023/convocatoria-extraordinaria/question.PDF", answerPath: "/exam-papers/selectividad/secondary/2023/convocatoria-extraordinaria/answer.PDF" },
  //      ],
  //    },
  //  ],
  //},
  //{
  //  id: "japanese-university-entrance-exam",
  //  name: "University Entrance Exam",
  //  papers: [
  //    {
  //      level: "secondary",
  //      year: "2024",
  //      papers: [
  //        { id: "math-ia", name: "Mathematics I-A", questionPath: "/exam-papers/japanese-university-entrance-exam/secondary/2024/mathematics-ia/question.PDF", answerPath: "/exam-papers/japanese-university-entrance-exam/secondary/2024/mathematics-ia/answer.PDF" },
  //        { id: "math-iibc", name: "Mathematics II-B-C", questionPath: "/exam-papers/japanese-university-entrance-exam/secondary/2024/mathematics-iibc/question.PDF", answerPath: "/exam-papers/japanese-university-entrance-exam/secondary/2024/mathematics-iibc/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "secondary",
  //      year: "2023",
  //      papers: [
  //        { id: "math-ia", name: "Mathematics I-A", questionPath: "/exam-papers/japanese-university-entrance-exam/secondary/2023/mathematics-ia/question.PDF", answerPath: "/exam-papers/japanese-university-entrance-exam/secondary/2023/mathematics-ia/answer.PDF" },
  //        { id: "math-iib", name: "Mathematics II-B", questionPath: "/exam-papers/japanese-university-entrance-exam/secondary/2023/mathematics-iib/question.PDF", answerPath: "/exam-papers/japanese-university-entrance-exam/secondary/2023/mathematics-iib/answer.PDF" },
  //      ],
  //    },
  //  ],
  //},
  //{
  //  id: "chinese-gaokao",
  //  name: "Gaokao",
  //  papers: [
  //    {
  //      level: "secondary",
  //      year: "2024",
  //      papers: [
  //        { id: "national-paper-1", name: "National Paper I", questionPath: "/exam-papers/chinese-gaokao/secondary/2024/national-paper-1/question.PDF", answerPath: "/exam-papers/chinese-gaokao/secondary/2024/national-paper-1/answer.PDF" },
  //        { id: "national-paper-2", name: "National Paper II", questionPath: "/exam-papers/chinese-gaokao/secondary/2024/national-paper-2/question.PDF", answerPath: "/exam-papers/chinese-gaokao/secondary/2024/national-paper-2/answer.PDF" },
  //      ],
  //    },
  //    {
  //      level: "secondary",
  //      year: "2023",
  //      papers: [
  //        { id: "national-paper-1", name: "National Paper I", questionPath: "/exam-papers/chinese-gaokao/secondary/2023/national-paper-1/question.PDF", answerPath: "/exam-papers/chinese-gaokao/secondary/2023/national-paper-1/answer.PDF" },
  //        { id: "national-paper-2", name: "National Paper II", questionPath: "/exam-papers/chinese-gaokao/secondary/2023/national-paper-2/question.PDF", answerPath: "/exam-papers/chinese-gaokao/secondary/2023/national-paper-2/answer.PDF" },
  //      ],
  //    },
  //  ],
  //},
];

function withDefaultRecordDate(record: ExamPaperRecord): ExamPaperRecord {
  if (record.date) return record;
  return {
    ...record,
    date: `June ${record.year}`,
  };
}

export const examPaperSources: ExamPaperSource[] = rawExamPaperSources.map((source) => ({
  ...source,
  papers: source.papers.map(withDefaultRecordDate),
}));

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
  paperType: ExamPaperType | null | undefined,
  paperTier?: ExamPaperTier | null | undefined
): string | null {
  const source = getExamPaperSource(sourceId);
  if (!source || !level || !year || !paperId || !paperType) return null;

  const yearEntry = source.papers.find((entry) => entry.level === level && entry.year === year);
  if (!yearEntry) return null;

  const paper = yearEntry.papers.find((entry) => entry.id === paperId);
  if (!paper) return null;

  if (paper.tierVariants?.length) {
    const selectedTier = paperTier ?? paper.tierVariants[0]?.tier;
    if (!selectedTier) return null;

    const tierVariant = paper.tierVariants.find((entry) => entry.tier === selectedTier);
    if (!tierVariant) return null;

    return paperType === "question" ? tierVariant.questionPath : tierVariant.answerPath;
  }

  if (!paper.questionPath || !paper.answerPath) return null;

  return paperType === "question" ? paper.questionPath : paper.answerPath;
}

export function getExamPaperName(
  sourceId: string | null | undefined,
  level: ExamPaperLevel | null | undefined,
  year: string | null | undefined,
  paperId: string | null | undefined,
  paperTier?: ExamPaperTier | null | undefined
): string | null {
  const source = getExamPaperSource(sourceId);
  if (!source || !level || !year || !paperId) return null;

  const yearEntry = source.papers.find((entry) => entry.level === level && entry.year === year);
  if (!yearEntry) return null;

  const paper = yearEntry.papers.find((entry) => entry.id === paperId);
  if (!paper) return null;

  if (paper.tierVariants?.length) {
    const selectedTier = paperTier ?? paper.tierVariants[0]?.tier;
    if (!selectedTier) return paper.name;

    const tierVariant = paper.tierVariants.find((entry) => entry.tier === selectedTier);
    if (!tierVariant) return paper.name;
    return `${paper.name} (${tierVariant.name})`;
  }

  return paper.name;
}

export function getExamPaperDate(
  sourceId: string | null | undefined,
  level: ExamPaperLevel | null | undefined,
  year: string | null | undefined,
  paperId: string | null | undefined,
  paperTier?: ExamPaperTier | null | undefined
): string | null {
  const source = getExamPaperSource(sourceId);
  if (!source || !level || !year || !paperId) return null;

  const yearEntry = source.papers.find((entry) => entry.level === level && entry.year === year);
  if (!yearEntry) return null;

  const paper = yearEntry.papers.find((entry) => entry.id === paperId);
  if (!paper) return null;

  if (paper.tierVariants?.length && paperTier) {
    const tierVariant = paper.tierVariants.find((entry) => entry.tier === paperTier);
    if (tierVariant?.date) return tierVariant.date;
  }

  return yearEntry.date ?? null;
}
