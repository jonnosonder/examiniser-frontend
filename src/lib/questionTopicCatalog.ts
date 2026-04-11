// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

export type QuestionLevel = "primary" | "secondary" | "sixthForm";

export type SubtopicDef = {
    slug: string;
    titleKey: string;
    descriptionKey: string;
};

export type MainTopicDef = {
    id: string;
    titleKey: string;
    descriptionKey: string;
    subtopics: SubtopicDef[];
};

export function levelRoutePrefix(level: QuestionLevel): string {
    if (level === "sixthForm") return "sixth-form";
    return level;
}

const PRIMARY: MainTopicDef[] = [
    {
        id: "numbers",
        titleKey: "primary-topics.numbers",
        descriptionKey: "descriptions.primary.numbers",
        subtopics: [
            { slug: "counting", titleKey: "primary-topics.counting", descriptionKey: "descriptions.primarySub.numbers.counting" },
            { slug: "reading-and-writing-numbers", titleKey: "primary-topics.reading-and-writing-numbers", descriptionKey: "descriptions.primarySub.numbers.reading-and-writing-numbers" },
            { slug: "place-value", titleKey: "primary-topics.place-value", descriptionKey: "descriptions.primarySub.numbers.place-value" },
            { slug: "comparing-and-ordering-numbers", titleKey: "primary-topics.comparing-and-ordering-numbers", descriptionKey: "descriptions.primarySub.numbers.comparing-and-ordering-numbers" },
            { slug: "rounding-numbers", titleKey: "primary-topics.rounding-numbers", descriptionKey: "descriptions.primarySub.numbers.rounding-numbers" },
        ],
    },
    {
        id: "addition-subtraction",
        titleKey: "primary-topics.addition-subtraction",
        descriptionKey: "descriptions.primary.addition-subtraction",
        subtopics: [
            { slug: "mental-strategies", titleKey: "primary-subtopics.mental-strategies", descriptionKey: "descriptions.primarySub.addition-subtraction.mental-strategies" },
            { slug: "number-bonds", titleKey: "primary-subtopics.number-bonds", descriptionKey: "descriptions.primarySub.addition-subtraction.number-bonds" },
            { slug: "written-methods", titleKey: "primary-subtopics.written-add-subtract", descriptionKey: "descriptions.primarySub.addition-subtraction.written-methods" },
            { slug: "word-problems", titleKey: "primary-subtopics.add-sub-word-problems", descriptionKey: "descriptions.primarySub.addition-subtraction.word-problems" },
        ],
    },
    {
        id: "multiplication-division",
        titleKey: "primary-topics.multiplication-division",
        descriptionKey: "descriptions.primary.multiplication-division",
        subtopics: [
            { slug: "times-tables", titleKey: "primary-subtopics.times-tables", descriptionKey: "descriptions.primarySub.multiplication-division.times-tables" },
            { slug: "grouping-sharing", titleKey: "primary-subtopics.grouping-sharing", descriptionKey: "descriptions.primarySub.multiplication-division.grouping-sharing" },
            { slug: "written-multiplication", titleKey: "primary-subtopics.written-multiplication", descriptionKey: "descriptions.primarySub.multiplication-division.written-multiplication" },
            { slug: "division-methods", titleKey: "primary-subtopics.division-methods", descriptionKey: "descriptions.primarySub.multiplication-division.division-methods" },
        ],
    },
    {
        id: "fractions-decimals-percentages",
        titleKey: "primary-topics.fractions-decimals-percentages",
        descriptionKey: "descriptions.primary.fractions-decimals-percentages",
        subtopics: [
            { slug: "fractions-basics", titleKey: "primary-subtopics.fractions-basics", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.fractions-basics" },
            { slug: "equivalent-fractions", titleKey: "primary-subtopics.equivalent-fractions", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.equivalent-fractions" },
            { slug: "decimals", titleKey: "primary-subtopics.decimals", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.decimals" },
            { slug: "percentages", titleKey: "primary-subtopics.percentages", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.percentages" },
        ],
    },
    {
        id: "measurement",
        titleKey: "primary-topics.measurement",
        descriptionKey: "descriptions.primary.measurement",
        subtopics: [
            { slug: "units", titleKey: "primary-subtopics.units", descriptionKey: "descriptions.primarySub.measurement.units" },
            { slug: "length-mass-capacity", titleKey: "primary-subtopics.length-mass-capacity", descriptionKey: "descriptions.primarySub.measurement.length-mass-capacity" },
            { slug: "time", titleKey: "primary-subtopics.time", descriptionKey: "descriptions.primarySub.measurement.time" },
            { slug: "money", titleKey: "primary-subtopics.money", descriptionKey: "descriptions.primarySub.measurement.money" },
        ],
    },
    {
        id: "geometry",
        titleKey: "primary-topics.geometry",
        descriptionKey: "descriptions.primary.geometry",
        subtopics: [
            { slug: "shapes-2d", titleKey: "primary-subtopics.shapes-2d", descriptionKey: "descriptions.primarySub.geometry.shapes-2d" },
            { slug: "shapes-3d", titleKey: "primary-subtopics.shapes-3d", descriptionKey: "descriptions.primarySub.geometry.shapes-3d" },
            { slug: "symmetry", titleKey: "primary-subtopics.symmetry", descriptionKey: "descriptions.primarySub.geometry.symmetry" },
            { slug: "angles", titleKey: "primary-subtopics.angles", descriptionKey: "descriptions.primarySub.geometry.angles" },
            { slug: "coordinates", titleKey: "primary-subtopics.coordinates", descriptionKey: "descriptions.primarySub.geometry.coordinates" },
        ],
    },
    {
        id: "algebra",
        titleKey: "primary-topics.algebra",
        descriptionKey: "descriptions.primary.algebra",
        subtopics: [
            { slug: "patterns", titleKey: "primary-subtopics.patterns", descriptionKey: "descriptions.primarySub.algebra.patterns" },
            { slug: "sequences", titleKey: "primary-subtopics.sequences", descriptionKey: "descriptions.primarySub.algebra.sequences" },
            { slug: "missing-numbers", titleKey: "primary-subtopics.missing-numbers", descriptionKey: "descriptions.primarySub.algebra.missing-numbers" },
            { slug: "simple-equations", titleKey: "primary-subtopics.simple-equations", descriptionKey: "descriptions.primarySub.algebra.simple-equations" },
        ],
    },
    {
        id: "statistics",
        titleKey: "primary-topics.statistics",
        descriptionKey: "descriptions.primary.statistics",
        subtopics: [
            { slug: "collecting-data", titleKey: "primary-subtopics.collecting-data", descriptionKey: "descriptions.primarySub.statistics.collecting-data" },
            { slug: "charts", titleKey: "primary-subtopics.charts", descriptionKey: "descriptions.primarySub.statistics.charts" },
            { slug: "tables", titleKey: "primary-subtopics.tables", descriptionKey: "descriptions.primarySub.statistics.tables" },
            { slug: "averages", titleKey: "primary-subtopics.averages", descriptionKey: "descriptions.primarySub.statistics.averages" },
        ],
    },
    {
        id: "problem-solving",
        titleKey: "primary-topics.problem-solving",
        descriptionKey: "descriptions.primary.problem-solving",
        subtopics: [
            { slug: "one-step", titleKey: "primary-subtopics.one-step-problems", descriptionKey: "descriptions.primarySub.problem-solving.one-step" },
            { slug: "two-step", titleKey: "primary-subtopics.two-step-problems", descriptionKey: "descriptions.primarySub.problem-solving.two-step" },
            { slug: "reasoning", titleKey: "primary-subtopics.reasoning", descriptionKey: "descriptions.primarySub.problem-solving.reasoning" },
            { slug: "real-life", titleKey: "primary-subtopics.real-life", descriptionKey: "descriptions.primarySub.problem-solving.real-life" },
        ],
    },
];

const SECONDARY: MainTopicDef[] = [
    {
        id: "number",
        titleKey: "secondary-topics.number",
        descriptionKey: "descriptions.secondary.number",
        subtopics: [
            { slug: "fractions-decimals-percentages", titleKey: "secondary-subtopics.fdp", descriptionKey: "descriptions.secondarySub.number.fdp" },
            { slug: "indices-roots", titleKey: "secondary-subtopics.indices-roots", descriptionKey: "descriptions.secondarySub.number.indices-roots" },
            { slug: "standard-form", titleKey: "secondary-subtopics.standard-form", descriptionKey: "descriptions.secondarySub.number.standard-form" },
            { slug: "rounding-estimation", titleKey: "secondary-subtopics.rounding-estimation", descriptionKey: "descriptions.secondarySub.number.rounding-estimation" },
        ],
    },
    {
        id: "algebra",
        titleKey: "secondary-topics.algebra",
        descriptionKey: "descriptions.secondary.algebra",
        subtopics: [
            { slug: "expressions", titleKey: "secondary-subtopics.expressions", descriptionKey: "descriptions.secondarySub.algebra.expressions" },
            { slug: "expanding-factorising", titleKey: "secondary-subtopics.expanding-factorising", descriptionKey: "descriptions.secondarySub.algebra.expanding-factorising" },
            { slug: "indices-algebra", titleKey: "secondary-subtopics.indices-algebra", descriptionKey: "descriptions.secondarySub.algebra.indices-algebra" },
            { slug: "substitution", titleKey: "secondary-subtopics.substitution", descriptionKey: "descriptions.secondarySub.algebra.substitution" },
        ],
    },
    {
        id: "equations",
        titleKey: "secondary-topics.equations",
        descriptionKey: "descriptions.secondary.equations",
        subtopics: [
            { slug: "linear-equations", titleKey: "secondary-subtopics.linear-equations", descriptionKey: "descriptions.secondarySub.equations.linear-equations" },
            { slug: "quadratic-intro", titleKey: "secondary-subtopics.quadratic-intro", descriptionKey: "descriptions.secondarySub.equations.quadratic-intro" },
            { slug: "simultaneous", titleKey: "secondary-subtopics.simultaneous", descriptionKey: "descriptions.secondarySub.equations.simultaneous" },
            { slug: "inequalities", titleKey: "secondary-subtopics.inequalities", descriptionKey: "descriptions.secondarySub.equations.inequalities" },
        ],
    },
    {
        id: "ratio-proportion",
        titleKey: "secondary-topics.ratio-proportion",
        descriptionKey: "descriptions.secondary.ratio-proportion",
        subtopics: [
            { slug: "ratio", titleKey: "secondary-subtopics.ratio", descriptionKey: "descriptions.secondarySub.ratio-proportion.ratio" },
            { slug: "proportion", titleKey: "secondary-subtopics.proportion", descriptionKey: "descriptions.secondarySub.ratio-proportion.proportion" },
            { slug: "percentages-change", titleKey: "secondary-subtopics.percentages-change", descriptionKey: "descriptions.secondarySub.ratio-proportion.percentages-change" },
            { slug: "best-buy", titleKey: "secondary-subtopics.best-buy", descriptionKey: "descriptions.secondarySub.ratio-proportion.best-buy" },
        ],
    },
    {
        id: "geometry",
        titleKey: "secondary-topics.geometry",
        descriptionKey: "descriptions.secondary.geometry",
        subtopics: [
            { slug: "angles-parallel", titleKey: "secondary-subtopics.angles-parallel", descriptionKey: "descriptions.secondarySub.geometry.angles-parallel" },
            { slug: "polygons", titleKey: "secondary-subtopics.polygons", descriptionKey: "descriptions.secondarySub.geometry.polygons" },
            { slug: "circles", titleKey: "secondary-subtopics.circles", descriptionKey: "descriptions.secondarySub.geometry.circles" },
            { slug: "area-volume", titleKey: "secondary-subtopics.area-volume", descriptionKey: "descriptions.secondarySub.geometry.area-volume" },
            { slug: "transformations", titleKey: "secondary-subtopics.transformations", descriptionKey: "descriptions.secondarySub.geometry.transformations" },
        ],
    },
    {
        id: "probability-statistics",
        titleKey: "secondary-topics.probability-statistics",
        descriptionKey: "descriptions.secondary.probability-statistics",
        subtopics: [
            { slug: "probability", titleKey: "secondary-subtopics.probability", descriptionKey: "descriptions.secondarySub.probability-statistics.probability" },
            { slug: "charts-data", titleKey: "secondary-subtopics.charts-data", descriptionKey: "descriptions.secondarySub.probability-statistics.charts-data" },
            { slug: "averages-spread", titleKey: "secondary-subtopics.averages-spread", descriptionKey: "descriptions.secondarySub.probability-statistics.averages-spread" },
            { slug: "sampling", titleKey: "secondary-subtopics.sampling", descriptionKey: "descriptions.secondarySub.probability-statistics.sampling" },
        ],
    },
    {
        id: "graphs",
        titleKey: "secondary-topics.graphs",
        descriptionKey: "descriptions.secondary.graphs",
        subtopics: [
            { slug: "linear-graphs", titleKey: "secondary-subtopics.linear-graphs", descriptionKey: "descriptions.secondarySub.graphs.linear-graphs" },
            { slug: "real-life-graphs", titleKey: "secondary-subtopics.real-life-graphs", descriptionKey: "descriptions.secondarySub.graphs.real-life-graphs" },
            { slug: "quadratic-graphs", titleKey: "secondary-subtopics.quadratic-graphs", descriptionKey: "descriptions.secondarySub.graphs.quadratic-graphs" },
            { slug: "gradient-intercept", titleKey: "secondary-subtopics.gradient-intercept", descriptionKey: "descriptions.secondarySub.graphs.gradient-intercept" },
        ],
    },
    {
        id: "trigonometry",
        titleKey: "secondary-topics.trigonometry",
        descriptionKey: "descriptions.secondary.trigonometry",
        subtopics: [
            { slug: "pythagoras", titleKey: "secondary-subtopics.pythagoras", descriptionKey: "descriptions.secondarySub.trigonometry.pythagoras" },
            { slug: "sohcahtoa", titleKey: "secondary-subtopics.sohcahtoa", descriptionKey: "descriptions.secondarySub.trigonometry.sohcahtoa" },
            { slug: "bearings", titleKey: "secondary-subtopics.bearings", descriptionKey: "descriptions.secondarySub.trigonometry.bearings" },
            { slug: "sine-cosine-rule", titleKey: "secondary-subtopics.sine-cosine-rule", descriptionKey: "descriptions.secondarySub.trigonometry.sine-cosine-rule" },
        ],
    },
    {
        id: "problem-solving",
        titleKey: "secondary-topics.problem-solving",
        descriptionKey: "descriptions.secondary.problem-solving",
        subtopics: [
            { slug: "multi-step", titleKey: "secondary-subtopics.multi-step", descriptionKey: "descriptions.secondarySub.problem-solving.multi-step" },
            { slug: "modelling", titleKey: "secondary-subtopics.modelling", descriptionKey: "descriptions.secondarySub.problem-solving.modelling" },
            { slug: "exam-style", titleKey: "secondary-subtopics.exam-style", descriptionKey: "descriptions.secondarySub.problem-solving.exam-style" },
        ],
    },
];

const SIXTH_FORM: MainTopicDef[] = [
    {
        id: "functions-graphs",
        titleKey: "sixth-form-topics.functions-graphs",
        descriptionKey: "descriptions.sixthForm.functions-graphs",
        subtopics: [
            { slug: "domain-range", titleKey: "sixth-subtopics.domain-range", descriptionKey: "descriptions.sixthFormSub.functions-graphs.domain-range" },
            { slug: "transformations", titleKey: "sixth-subtopics.graph-transformations", descriptionKey: "descriptions.sixthFormSub.functions-graphs.transformations" },
            { slug: "inverses", titleKey: "sixth-subtopics.inverses", descriptionKey: "descriptions.sixthFormSub.functions-graphs.inverses" },
            { slug: "modulus-piecewise", titleKey: "sixth-subtopics.modulus-piecewise", descriptionKey: "descriptions.sixthFormSub.functions-graphs.modulus-piecewise" },
        ],
    },
    {
        id: "differentiation",
        titleKey: "sixth-form-topics.differentiation",
        descriptionKey: "descriptions.sixthForm.differentiation",
        subtopics: [
            { slug: "first-principles", titleKey: "sixth-subtopics.first-principles", descriptionKey: "descriptions.sixthFormSub.differentiation.first-principles" },
            { slug: "differentiation-rules", titleKey: "sixth-subtopics.differentiation-rules", descriptionKey: "descriptions.sixthFormSub.differentiation.rules" },
            { slug: "tangents-normals", titleKey: "sixth-subtopics.tangents-normals", descriptionKey: "descriptions.sixthFormSub.differentiation.tangents-normals" },
            { slug: "optimisation", titleKey: "sixth-subtopics.optimisation", descriptionKey: "descriptions.sixthFormSub.differentiation.optimisation" },
        ],
    },
    {
        id: "integration",
        titleKey: "sixth-form-topics.integration",
        descriptionKey: "descriptions.sixthForm.integration",
        subtopics: [
            { slug: "indefinite", titleKey: "sixth-subtopics.indefinite-integration", descriptionKey: "descriptions.sixthFormSub.integration.indefinite" },
            { slug: "definite-area", titleKey: "sixth-subtopics.definite-area", descriptionKey: "descriptions.sixthFormSub.integration.definite-area" },
            { slug: "kinematics", titleKey: "sixth-subtopics.kinematics", descriptionKey: "descriptions.sixthFormSub.integration.kinematics" },
        ],
    },
    {
        id: "trigonometry",
        titleKey: "sixth-form-topics.trigonometry",
        descriptionKey: "descriptions.sixthForm.trigonometry",
        subtopics: [
            { slug: "radians", titleKey: "sixth-subtopics.radians", descriptionKey: "descriptions.sixthFormSub.trigonometry.radians" },
            { slug: "identities", titleKey: "sixth-subtopics.trig-identities", descriptionKey: "descriptions.sixthFormSub.trigonometry.identities" },
            { slug: "trig-equations", titleKey: "sixth-subtopics.trig-equations", descriptionKey: "descriptions.sixthFormSub.trigonometry.equations" },
            { slug: "sine-cosine-rule", titleKey: "sixth-subtopics.trig-sine-cosine-rule", descriptionKey: "descriptions.sixthFormSub.trigonometry.sine-cosine-rule" },
        ],
    },
    {
        id: "sequences-series",
        titleKey: "sixth-form-topics.sequences-series",
        descriptionKey: "descriptions.sixthForm.sequences-series",
        subtopics: [
            { slug: "arithmetic-geometric", titleKey: "sixth-subtopics.arithmetic-geometric", descriptionKey: "descriptions.sixthFormSub.sequences-series.arithmetic-geometric" },
            { slug: "sigma-notation", titleKey: "sixth-subtopics.sigma-notation", descriptionKey: "descriptions.sixthFormSub.sequences-series.sigma-notation" },
            { slug: "binomial", titleKey: "sixth-subtopics.binomial", descriptionKey: "descriptions.sixthFormSub.sequences-series.binomial" },
        ],
    },
    {
        id: "exponentials-logarithms",
        titleKey: "sixth-form-topics.exponentials-logarithms",
        descriptionKey: "descriptions.sixthForm.exponentials-logarithms",
        subtopics: [
            { slug: "laws", titleKey: "sixth-subtopics.exp-log-laws", descriptionKey: "descriptions.sixthFormSub.exponentials-logarithms.laws" },
            { slug: "equations", titleKey: "sixth-subtopics.exp-log-equations", descriptionKey: "descriptions.sixthFormSub.exponentials-logarithms.equations" },
            { slug: "modelling", titleKey: "sixth-subtopics.exp-log-modelling", descriptionKey: "descriptions.sixthFormSub.exponentials-logarithms.modelling" },
        ],
    },
    {
        id: "vectors",
        titleKey: "sixth-form-topics.vectors",
        descriptionKey: "descriptions.sixthForm.vectors",
        subtopics: [
            { slug: "vector-basics", titleKey: "sixth-subtopics.vector-basics", descriptionKey: "descriptions.sixthFormSub.vectors.basics" },
            { slug: "scalar-product", titleKey: "sixth-subtopics.scalar-product", descriptionKey: "descriptions.sixthFormSub.vectors.scalar-product" },
            { slug: "lines", titleKey: "sixth-subtopics.vector-lines", descriptionKey: "descriptions.sixthFormSub.vectors.lines" },
        ],
    },
    {
        id: "probability-statistics",
        titleKey: "sixth-form-topics.probability-statistics",
        descriptionKey: "descriptions.sixthForm.probability-statistics",
        subtopics: [
            { slug: "distributions", titleKey: "sixth-subtopics.distributions", descriptionKey: "descriptions.sixthFormSub.probability-statistics.distributions" },
            { slug: "hypothesis-testing", titleKey: "sixth-subtopics.hypothesis-testing", descriptionKey: "descriptions.sixthFormSub.probability-statistics.hypothesis-testing" },
            { slug: "regression", titleKey: "sixth-subtopics.regression", descriptionKey: "descriptions.sixthFormSub.probability-statistics.regression" },
        ],
    },
    {
        id: "proof-numerical",
        titleKey: "sixth-form-topics.proof-numerical",
        descriptionKey: "descriptions.sixthForm.proof-numerical",
        subtopics: [
            { slug: "proof", titleKey: "sixth-subtopics.proof", descriptionKey: "descriptions.sixthFormSub.proof-numerical.proof" },
            { slug: "iteration", titleKey: "sixth-subtopics.iteration", descriptionKey: "descriptions.sixthFormSub.proof-numerical.iteration" },
            { slug: "numerical-methods", titleKey: "sixth-subtopics.numerical-methods", descriptionKey: "descriptions.sixthFormSub.proof-numerical.numerical-methods" },
        ],
    },
];

export const QUESTION_CATALOG: Record<QuestionLevel, MainTopicDef[]> = {
    primary: PRIMARY,
    secondary: SECONDARY,
    sixthForm: SIXTH_FORM,
};

export function getTopicOrNull(level: QuestionLevel, topicId: string): MainTopicDef | null {
    return QUESTION_CATALOG[level].find((t) => t.id === topicId) ?? null;
}

export function getSubtopicOrNull(topic: MainTopicDef, subSlug: string): SubtopicDef | null {
    return topic.subtopics.find((s) => s.slug === subSlug) ?? null;
}
