// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import * as React from "react";
import { NumbersIcon, AdditionSubtractionIcon, MultiplicationDivisionIcon, FractionsIcon, MeasurementIcon, GeometryIcon, AlgebraIcon, StatisticsIcon, ProblemSolvingIcon } from "@/assets/icons/primary";
import {
    SecondaryNumberIcon,
    SecondaryAlgebraIcon,
    SecondaryEquationsIcon,
    SecondaryRatioProportionIcon,
    SecondaryGeometryIcon,
    SecondaryMeasurementIcon,
    SecondaryProbabilityStatisticsIcon,
    SecondaryGraphsIcon,
    SecondaryTrigonometryIcon,
    SecondaryProblemSolvingIcon,
} from "@/assets/icons/secondary";
import {
    SixthFormAlgebraIcon,
    SixthFormFunctionsGraphsIcon,
    SixthFormCalculusIcon,
    SixthFormDifferentiationIcon,
    SixthFormIntegrationIcon,
    SixthFormTrigonometryIcon,
    SixthFormSequencesSeriesIcon,
    SixthFormExponentialsLogarithmsIcon,
    SixthFormVectorsIcon,
    SixthFormProbabilityStatisticsIcon,
    SixthFormMechanicsIcon,
    SixthFormDiscreteIcon,
    SixthFormProofNumericalIcon,
} from "@/assets/icons/sixthform";

export const primaryTopicIconMap: Record<string, React.ReactNode> = {
    numbers: <NumbersIcon />,
    "addition-subtraction": <AdditionSubtractionIcon />,
    "multiplication-division": <MultiplicationDivisionIcon />,
    "fractions-decimals-percentages": <FractionsIcon />,
    measurements: <MeasurementIcon />,
    measurement: <MeasurementIcon />,
    geometry: <GeometryIcon />,
    algebra: <AlgebraIcon />,
    statistics: <StatisticsIcon />,
    "data-handling": <StatisticsIcon />,
    "problem-solving": <ProblemSolvingIcon />,
    "problem-solving-reasoning": <ProblemSolvingIcon />,
};

export const secondaryTopicIconMap: Record<string, React.ReactNode> = {
    number: <SecondaryNumberIcon />,
    algebra: <SecondaryAlgebraIcon />,
    geometry: <SecondaryGeometryIcon />,
    trigonometry: <SecondaryTrigonometryIcon />,
    measurement: <SecondaryMeasurementIcon />,
    statistics: <SecondaryProbabilityStatisticsIcon />,
    "reasoning-problem-solving": <SecondaryProblemSolvingIcon />,
    equations: <SecondaryEquationsIcon />,
    "ratio-proportion": <SecondaryRatioProportionIcon />,
    "probability-statistics": <SecondaryProbabilityStatisticsIcon />,
    graphs: <SecondaryGraphsIcon />,
    "problem-solving": <SecondaryProblemSolvingIcon />,
};

export const sixthFormTopicIconMap: Record<string, React.ReactNode> = {
    algebra: <SixthFormAlgebraIcon />,
    functions: <SixthFormFunctionsGraphsIcon />,
    calculus: <SixthFormCalculusIcon />,
    trigonometry: <SixthFormTrigonometryIcon />,
    vectors: <SixthFormVectorsIcon />,
    statistics: <SixthFormProbabilityStatisticsIcon />,
    mechanics: <SixthFormMechanicsIcon />,
    discrete: <SixthFormDiscreteIcon />,
    "functions-graphs": <SixthFormFunctionsGraphsIcon />,
    differentiation: <SixthFormDifferentiationIcon />,
    integration: <SixthFormIntegrationIcon />,
    "sequences-series": <SixthFormSequencesSeriesIcon />,
    "exponentials-logarithms": <SixthFormExponentialsLogarithmsIcon />,
    "probability-statistics": <SixthFormProbabilityStatisticsIcon />,
    "proof-numerical": <SixthFormProofNumericalIcon />,
};
