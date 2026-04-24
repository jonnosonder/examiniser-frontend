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

export const QUESTION_CATALOG: Record<QuestionLevel, MainTopicDef[]> = {
    primary: [
        {
            id: "numbers",
            titleKey: "primary-topics.numbers",
            descriptionKey: "descriptions.primary.numbers",
            subtopics: [
                { slug: "counting", titleKey: "primary-subtopics.counting", descriptionKey: "descriptions.primarySub.numbers.counting" },
                { slug: "place-value", titleKey: "primary-subtopics.place-value", descriptionKey: "descriptions.primarySub.numbers.place-value" },
                { slug: "comparing-and-ordering-numbers", titleKey: "primary-subtopics.comparing-and-ordering-numbers", descriptionKey: "descriptions.primarySub.numbers.comparing-and-ordering-numbers" },
                { slug: "addition-and-subtraction", titleKey: "primary-subtopics.addition-and-subtraction", descriptionKey: "descriptions.primarySub.numbers.addition-and-subtraction" },
                { slug: "multiplication-and-division", titleKey: "primary-subtopics.multiplication-and-division", descriptionKey: "descriptions.primarySub.numbers.multiplication-and-division" },
                { slug: "rounding-and-estimation", titleKey: "primary-subtopics.rounding-and-estimation", descriptionKey: "descriptions.primarySub.numbers.rounding-and-estimation" },
            ],
        },
        {
            id: "fractions-decimals-percentages",
            titleKey: "primary-topics.fractions-decimals-percentages",
            descriptionKey: "descriptions.primary.fractions-decimals-percentages",
            subtopics: [
                { slug: "fractions", titleKey: "primary-subtopics.fractions", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.fractions" },
                { slug: "equivalent-fractions", titleKey: "primary-subtopics.equivalent-fractions", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.equivalent-fractions" },
                { slug: "simple-addition-subtraction-of-fractions", titleKey: "primary-subtopics.simple-addition-subtraction-of-fractions", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.simple-addition-subtraction-of-fractions" },
                { slug: "decimals", titleKey: "primary-subtopics.decimals", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.decimals" },
                { slug: "link-between-fractions-and-decimals", titleKey: "primary-subtopics.link-between-fractions-and-decimals", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.link-between-fractions-and-decimals" },
                { slug: "basic-percentages", titleKey: "primary-subtopics.basic-percentages", descriptionKey: "descriptions.primarySub.fractions-decimals-percentages.basic-percentages" },
            ],
        },
        {
            id: "measurements",
            titleKey: "primary-topics.measurements",
            descriptionKey: "descriptions.primary.measurements",
            subtopics: [
                { slug: "length-mass-volume-time", titleKey: "primary-subtopics.length-mass-volume-time", descriptionKey: "descriptions.primarySub.measurements.length-mass-volume-time" },
                { slug: "units", titleKey: "primary-subtopics.units", descriptionKey: "descriptions.primarySub.measurements.units" },
                { slug: "reading-clocks", titleKey: "primary-subtopics.reading-clocks", descriptionKey: "descriptions.primarySub.measurements.reading-clocks" },
                { slug: "money-calculations", titleKey: "primary-subtopics.money-calculations", descriptionKey: "descriptions.primarySub.measurements.money-calculations" },
                { slug: "perimeter-and-area", titleKey: "primary-subtopics.perimeter-and-area", descriptionKey: "descriptions.primarySub.measurements.perimeter-and-area" },
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
                { slug: "position-and-direction", titleKey: "primary-subtopics.position-and-direction", descriptionKey: "descriptions.primarySub.geometry.position-and-direction" },
            ],
        },
        {
            id: "data-handling",
            titleKey: "primary-topics.data-handling",
            descriptionKey: "descriptions.primary.data-handling",
            subtopics: [
                { slug: "sorting-and-classifying", titleKey: "primary-subtopics.sorting-and-classifying", descriptionKey: "descriptions.primarySub.data-handling.sorting-and-classifying" },
                { slug: "pictograms-bar-charts", titleKey: "primary-subtopics.pictograms-bar-charts", descriptionKey: "descriptions.primarySub.data-handling.pictograms-bar-charts" },
                { slug: "tables", titleKey: "primary-subtopics.tables", descriptionKey: "descriptions.primarySub.data-handling.tables" },
            ],
        },
        {
            id: "algebra",
            titleKey: "primary-topics.algebra",
            descriptionKey: "descriptions.primary.algebra",
            subtopics: [
                { slug: "missing-numbers", titleKey: "primary-subtopics.missing-numbers", descriptionKey: "descriptions.primarySub.algebra.missing-numbers" },
                { slug: "simple-equations", titleKey: "primary-subtopics.simple-equations", descriptionKey: "descriptions.primarySub.algebra.simple-equations" },
            ],
        },
    ],
    secondary: [
        {
            id: "number",
            titleKey: "secondary-topics.number",
            descriptionKey: "descriptions.secondary.number",
            subtopics: [
                { slug: "negative-integers", titleKey: "secondary-subtopics.negative-integers", descriptionKey: "descriptions.secondarySub.number.negative-integers" },
                { slug: "factors-multiples-primes", titleKey: "secondary-subtopics.factors-multiples-primes", descriptionKey: "descriptions.secondarySub.number.factors-multiples-primes" },
                { slug: "lcm-hcf", titleKey: "secondary-subtopics.lcm-hcf", descriptionKey: "descriptions.secondarySub.number.lcm-hcf" },
                { slug: "powers-and-roots", titleKey: "secondary-subtopics.powers-and-roots", descriptionKey: "descriptions.secondarySub.number.powers-and-roots" },
                { slug: "standard-form", titleKey: "secondary-subtopics.standard-form", descriptionKey: "descriptions.secondarySub.number.standard-form" },
                { slug: "fractions-decimals-percentages", titleKey: "secondary-subtopics.fractions-decimals-percentages", descriptionKey: "descriptions.secondarySub.number.fractions-decimals-percentages" },
                { slug: "ratio-and-proportion", titleKey: "secondary-subtopics.ratio-and-proportion", descriptionKey: "descriptions.secondarySub.number.ratio-and-proportion" },
                { slug: "financial-maths", titleKey: "secondary-subtopics.financial-maths", descriptionKey: "descriptions.secondarySub.number.financial-maths" },
            ],
        },
        {
            id: "algebra",
            titleKey: "secondary-topics.algebra",
            descriptionKey: "descriptions.secondary.algebra",
            subtopics: [
                { slug: "algebraic-notation", titleKey: "secondary-subtopics.algebraic-notation", descriptionKey: "descriptions.secondarySub.algebra.algebraic-notation" },
                { slug: "simplifying-expressions", titleKey: "secondary-subtopics.simplifying-expressions", descriptionKey: "descriptions.secondarySub.algebra.simplifying-expressions" },
                { slug: "expanding-and-factorising", titleKey: "secondary-subtopics.expanding-and-factorising", descriptionKey: "descriptions.secondarySub.algebra.expanding-and-factorising" },
                { slug: "substitution", titleKey: "secondary-subtopics.substitution", descriptionKey: "descriptions.secondarySub.algebra.substitution" },
                { slug: "linear-equations", titleKey: "secondary-subtopics.linear-equations", descriptionKey: "descriptions.secondarySub.algebra.linear-equations" },
                { slug: "simultaneous-equations", titleKey: "secondary-subtopics.simultaneous-equations", descriptionKey: "descriptions.secondarySub.algebra.simultaneous-equations" },
                { slug: "quadratic-equations", titleKey: "secondary-subtopics.quadratic-equations", descriptionKey: "descriptions.secondarySub.algebra.quadratic-equations" },
                { slug: "inequalities", titleKey: "secondary-subtopics.inequalities", descriptionKey: "descriptions.secondarySub.algebra.inequalities" },
                { slug: "arithmetic-sequences", titleKey: "secondary-subtopics.arithmetic-sequences", descriptionKey: "descriptions.secondarySub.algebra.arithmetic-sequences" },
                { slug: "geometric-sequences", titleKey: "secondary-subtopics.geometric-sequences", descriptionKey: "descriptions.secondarySub.algebra.geometric-sequences" },
                { slug: "functions-basic-understanding", titleKey: "secondary-subtopics.functions-basic-understanding", descriptionKey: "descriptions.secondarySub.algebra.functions-basic-understanding" },
                { slug: "linear-graphs", titleKey: "secondary-subtopics.linear-graphs", descriptionKey: "descriptions.secondarySub.algebra.linear-graphs" },
                { slug: "quadratic-graphs", titleKey: "secondary-subtopics.quadratic-graphs", descriptionKey: "descriptions.secondarySub.algebra.quadratic-graphs" },
            ],
        },
        {
            id: "geometry",
            titleKey: "secondary-topics.geometry",
            descriptionKey: "descriptions.secondary.geometry",
            subtopics: [
                { slug: "angles-rules-parallel-lines", titleKey: "secondary-subtopics.angles-rules-parallel-lines", descriptionKey: "descriptions.secondarySub.geometry.angles-rules-parallel-lines" },
                { slug: "properties-of-polygons", titleKey: "secondary-subtopics.properties-of-polygons", descriptionKey: "descriptions.secondarySub.geometry.properties-of-polygons" },
                //{ slug: "congruence-and-similarity", titleKey: "secondary-subtopics.congruence-and-similarity", descriptionKey: "descriptions.secondarySub.geometry.congruence-and-similarity" },
                { slug: "translation", titleKey: "secondary-subtopics.translation", descriptionKey: "descriptions.secondarySub.geometry.translation" },
                { slug: "rotation", titleKey: "secondary-subtopics.rotation", descriptionKey: "descriptions.secondarySub.geometry.rotation" },
                { slug: "reflection", titleKey: "secondary-subtopics.reflection", descriptionKey: "descriptions.secondarySub.geometry.reflection" },
                { slug: "enlargement", titleKey: "secondary-subtopics.enlargement", descriptionKey: "descriptions.secondarySub.geometry.enlargement" },
                { slug: "pythagoras-theorem", titleKey: "secondary-subtopics.pythagoras-theorem", descriptionKey: "descriptions.secondarySub.geometry.pythagoras-theorem" },
            ],
        },
        {
            id: "trigonometry",
            titleKey: "secondary-topics.trigonometry",
            descriptionKey: "descriptions.secondary.trigonometry",
            subtopics: [
                { slug: "sine-cosine-tangent", titleKey: "secondary-subtopics.sine-cosine-tangent", descriptionKey: "descriptions.secondarySub.trigonometry.sine-cosine-tangent" },
                { slug: "right-angled-triangles", titleKey: "secondary-subtopics.right-angled-triangles", descriptionKey: "descriptions.secondarySub.trigonometry.right-angled-triangles" },
                { slug: "circumference-and-area", titleKey: "secondary-subtopics.circumference-and-area", descriptionKey: "descriptions.secondarySub.trigonometry.circumference-and-area" },
                { slug: "arcs-and-sectors", titleKey: "secondary-subtopics.arcs-and-sectors", descriptionKey: "descriptions.secondarySub.trigonometry.arcs-and-sectors" },
            ],
        },
        {
            id: "measurement",
            titleKey: "secondary-topics.measurement",
            descriptionKey: "descriptions.secondary.measurement",
            subtopics: [
                { slug: "area-and-perimeter", titleKey: "secondary-subtopics.area-and-perimeter", descriptionKey: "descriptions.secondarySub.measurement.area-and-perimeter" },
                { slug: "prisms", titleKey: "secondary-subtopics.prisms", descriptionKey: "descriptions.secondarySub.measurement.prisms" },
                { slug: "cylinders", titleKey: "secondary-subtopics.cylinders", descriptionKey: "descriptions.secondarySub.measurement.cylinders" },
                { slug: "spheres", titleKey: "secondary-subtopics.spheres", descriptionKey: "descriptions.secondarySub.measurement.spheres" },
                { slug: "unit-conversions", titleKey: "secondary-subtopics.unit-conversions", descriptionKey: "descriptions.secondarySub.measurement.unit-conversions" },
                { slug: "compound-measures", titleKey: "secondary-subtopics.compound-measures", descriptionKey: "descriptions.secondarySub.measurement.compound-measures" },
            ],
        },
        {
            id: "statistics",
            titleKey: "secondary-topics.statistics",
            descriptionKey: "descriptions.secondary.statistics",
            subtopics: [
                //{ slug: "data-collection-methods", titleKey: "secondary-subtopics.data-collection-methods", descriptionKey: "descriptions.secondarySub.statistics.data-collection-methods" },
                { slug: "mean-median-mode", titleKey: "secondary-subtopics.mean-median-mode", descriptionKey: "descriptions.secondarySub.statistics.mean-median-mode" },
                { slug: "range", titleKey: "secondary-subtopics.range", descriptionKey: "descriptions.secondarySub.statistics.range" },
                { slug: "bar-charts", titleKey: "secondary-subtopics.bar-charts", descriptionKey: "descriptions.secondarySub.statistics.bar-charts" },
                { slug: "histograms", titleKey: "secondary-subtopics.histograms", descriptionKey: "descriptions.secondarySub.statistics.histograms" },
                { slug: "pie-charts", titleKey: "secondary-subtopics.pie-charts", descriptionKey: "descriptions.secondarySub.statistics.pie-charts" },
                { slug: "basic-probability-rules", titleKey: "secondary-subtopics.basic-probability-rules", descriptionKey: "descriptions.secondarySub.statistics.basic-probability-rules" },
                { slug: "tree-diagrams", titleKey: "secondary-subtopics.tree-diagrams", descriptionKey: "descriptions.secondarySub.statistics.tree-diagrams" },
                { slug: "venn-diagrams", titleKey: "secondary-subtopics.venn-diagrams", descriptionKey: "descriptions.secondarySub.statistics.venn-diagrams" },
            ],
        },
        {
            id: "problem-solving-reasoning",
            titleKey: "primary-topics.problem-solving-reasoning",
            descriptionKey: "descriptions.primary.problem-solving-reasoning",
            subtopics: [
                { slug: "word-problems", titleKey: "primary-subtopics.word-problems", descriptionKey: "descriptions.primarySub.problem-solving-reasoning.word-problems" },
                { slug: "patterns-and-sequences", titleKey: "primary-subtopics.patterns-and-sequences", descriptionKey: "descriptions.primarySub.problem-solving-reasoning.patterns-and-sequences" },
            ],
        },
        //{
        //    id: "reasoning-problem-solving",
        //    titleKey: "secondary-topics.reasoning-problem-solving",
        //    descriptionKey: "descriptions.secondary.reasoning-problem-solving",
        //    subtopics: [
        //        { slug: "multi-step-problems", titleKey: "secondary-subtopics.multi-step-problems", descriptionKey: "descriptions.secondarySub.reasoning-problem-solving.multi-step-problems" },
        //        { slug: "mathematical-proofs", titleKey: "secondary-subtopics.mathematical-proofs", descriptionKey: "descriptions.secondarySub.reasoning-problem-solving.mathematical-proofs" },
        //        { slug: "logical-deduction", titleKey: "secondary-subtopics.logical-deduction", descriptionKey: "descriptions.secondarySub.reasoning-problem-solving.logical-deduction" },
        //    ],
        //},
    ],
    sixthForm: [
        {
            id: "pure",
            titleKey: "sixth-form-topics.pure",
            descriptionKey: "descriptions.sixthForm.pure",
            subtopics: [
                { slug: "algebra-and-functions", titleKey: "sixth-subtopics.algebra-functions", descriptionKey: "descriptions.sixthFormSub.pure.algebra-and-functions" },
                { slug: "differentiation", titleKey: "sixth-subtopics.differentiation", descriptionKey: "descriptions.sixthFormSub.pure.differentiation" },
                { slug: "numerical-methods", titleKey: "sixth-subtopics.numerical-methods", descriptionKey: "descriptions.sixthFormSub.pure.numerical-methods" },
                //{ slug: "quadratics", titleKey: "sixth-subtopics.quadratics", descriptionKey: "descriptions.sixthFormSub.pure.quadratics" },
                //{ slug: "inequalities", titleKey: "sixth-subtopics.inequalities", descriptionKey: "descriptions.sixthFormSub.pure.inequalities" },
                //{ slug: "polynomials", titleKey: "sixth-subtopics.polynomials", descriptionKey: "descriptions.sixthFormSub.pure.polynomials" },
                //{ slug: "coordinate-geometry", titleKey: "sixth-subtopics.coordinate-geometry", descriptionKey: "descriptions.sixthFormSub.pure.coordinate-geometry" },
                //{ slug: "sequences-and-series", titleKey: "sixth-subtopics.sequences-series", descriptionKey: "descriptions.sixthFormSub.pure.sequences-and-series" },
                //{ slug: "binomial-expansion", titleKey: "sixth-subtopics.binomial-expansion", descriptionKey: "descriptions.sixthFormSub.pure.binomial-expansion" },
                //{ slug: "trigonometry", titleKey: "sixth-subtopics.trigonometry", descriptionKey: "descriptions.sixthFormSub.pure.trigonometry" },
                //{ slug: "trigonometric-identities", titleKey: "sixth-subtopics.trig-identities", descriptionKey: "descriptions.sixthFormSub.pure.trigonometric-identities" },
                //{ slug: "trigonometric-equations", titleKey: "sixth-subtopics.trig-equations", descriptionKey: "descriptions.sixthFormSub.pure.trigonometric-equations" },
                //{ slug: "exponentials-and-logarithms", titleKey: "sixth-subtopics.exp-logs", descriptionKey: "descriptions.sixthFormSub.pure.exponentials-and-logarithms" },
                //{ slug: "differentiation", titleKey: "sixth-subtopics.differentiation", descriptionKey: "descriptions.sixthFormSub.pure.differentiation" },
                //{ slug: "integration", titleKey: "sixth-subtopics.integration", descriptionKey: "descriptions.sixthFormSub.pure.integration" },
                //{ slug: "numerical-methods", titleKey: "sixth-subtopics.numerical-methods", descriptionKey: "descriptions.sixthFormSub.pure.numerical-methods" },
                //{ slug: "vectors", titleKey: "sixth-subtopics.vectors", descriptionKey: "descriptions.sixthFormSub.pure.vectors" },
                //{ slug: "proof", titleKey: "sixth-subtopics.proof", descriptionKey: "descriptions.sixthFormSub.pure.proof" },
                //{ slug: "parametric-equations", titleKey: "sixth-subtopics.parametric-equations", descriptionKey: "descriptions.sixthFormSub.pure.parametric-equations" }
            ]
        },
        {
            id: "mechanics",
            titleKey: "sixth-form-topics.mechanics",
            descriptionKey: "descriptions.sixthForm.mechanics",
            subtopics: [
                //{ slug: "kinematics-suvat", titleKey: "sixth-subtopics.kinematics-suvat", descriptionKey: "descriptions.sixthFormSub.mechanics.kinematics-suvat" },
                //{ slug: "variable-acceleration", titleKey: "sixth-subtopics.variable-acceleration", descriptionKey: "descriptions.sixthFormSub.mechanics.variable-acceleration" },
                //{ slug: "forces-and-newtons-laws", titleKey: "sixth-subtopics.forces-newton", descriptionKey: "descriptions.sixthFormSub.mechanics.forces-and-newtons-laws" },
                //{ slug: "connected-particles", titleKey: "sixth-subtopics.connected-particles", descriptionKey: "descriptions.sixthFormSub.mechanics.connected-particles" },
                //{ slug: "projectiles", titleKey: "sixth-subtopics.projectiles", descriptionKey: "descriptions.sixthFormSub.mechanics.projectiles" },
                //{ slug: "moments", titleKey: "sixth-subtopics.moments", descriptionKey: "descriptions.sixthFormSub.mechanics.moments" },
                { slug: "vectors", titleKey: "sixth-subtopics.vectors", descriptionKey: "descriptions.sixthFormSub.mechanics.vectors" }
            ]
        },
        {
            id: "statistics",
            titleKey: "sixth-form-topics.statistics",
            descriptionKey: "descriptions.sixthForm.statistics",
            subtopics: [
                //{ slug: "data-presentation", titleKey: "sixth-subtopics.data-presentation", descriptionKey: "descriptions.sixthFormSub.statistics.data-presentation" },
                //{ slug: "measures-of-location-and-spread", titleKey: "sixth-subtopics.measures", descriptionKey: "descriptions.sixthFormSub.statistics.measures-of-location-and-spread" },
                //{ slug: "correlation-and-regression", titleKey: "sixth-subtopics.correlation-regression", descriptionKey: "descriptions.sixthFormSub.statistics.correlation-and-regression" },
                //{ slug: "probability", titleKey: "sixth-subtopics.probability", descriptionKey: "descriptions.sixthFormSub.statistics.probability" },
                { slug: "binomial-distribution", titleKey: "sixth-subtopics.binomial", descriptionKey: "descriptions.sixthFormSub.statistics.binomial-distribution" },
                //{ slug: "normal-distribution", titleKey: "sixth-subtopics.normal", descriptionKey: "descriptions.sixthFormSub.statistics.normal-distribution" },
                //{ slug: "hypothesis-testing", titleKey: "sixth-subtopics.hypothesis-testing", descriptionKey: "descriptions.sixthFormSub.statistics.hypothesis-testing" },
                //{ slug: "large-data-set", titleKey: "sixth-subtopics.large-data-set", descriptionKey: "descriptions.sixthFormSub.statistics.large-data-set" }
            ]
        }
    ]
};

export function getTopicOrNull(level: QuestionLevel, topicId: string): MainTopicDef | null {
    return QUESTION_CATALOG[level].find((t) => t.id === topicId) ?? null;
}

export function getSubtopicOrNull(topic: MainTopicDef, subSlug: string): SubtopicDef | null {
    return topic.subtopics.find((s) => s.slug === subSlug) ?? null;
}
