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
    SecondaryProbabilityStatisticsIcon,
    SecondaryGraphsIcon,
    SecondaryTrigonometryIcon,
    SecondaryProblemSolvingIcon,
} from "@/assets/icons/secondary";
import {
    SixthFormFunctionsGraphsIcon,
    SixthFormDifferentiationIcon,
    SixthFormIntegrationIcon,
    SixthFormTrigonometryIcon,
    SixthFormSequencesSeriesIcon,
    SixthFormExponentialsLogarithmsIcon,
    SixthFormVectorsIcon,
    SixthFormProbabilityStatisticsIcon,
    SixthFormProofNumericalIcon,
} from "@/assets/icons/sixthform";

export const primaryTopicIconMap: Record<string, React.ReactNode> = {
    numbers: <NumbersIcon />,
    "addition-subtraction": <AdditionSubtractionIcon />,
    "multiplication-division": <MultiplicationDivisionIcon />,
    "fractions-decimals-percentages": <FractionsIcon />,
    measurement: <MeasurementIcon />,
    geometry: <GeometryIcon />,
    algebra: <AlgebraIcon />,
    statistics: <StatisticsIcon />,
    "problem-solving": <ProblemSolvingIcon />,
};

export const secondaryTopicIconMap: Record<string, React.ReactNode> = {
    number: <SecondaryNumberIcon />,
    algebra: <SecondaryAlgebraIcon />,
    equations: <SecondaryEquationsIcon />,
    "ratio-proportion": <SecondaryRatioProportionIcon />,
    geometry: <SecondaryGeometryIcon />,
    "probability-statistics": <SecondaryProbabilityStatisticsIcon />,
    graphs: <SecondaryGraphsIcon />,
    trigonometry: <SecondaryTrigonometryIcon />,
    "problem-solving": <SecondaryProblemSolvingIcon />,
};

export const sixthFormTopicIconMap: Record<string, React.ReactNode> = {
    "functions-graphs": <SixthFormFunctionsGraphsIcon />,
    differentiation: <SixthFormDifferentiationIcon />,
    integration: <SixthFormIntegrationIcon />,
    trigonometry: <SixthFormTrigonometryIcon />,
    "sequences-series": <SixthFormSequencesSeriesIcon />,
    "exponentials-logarithms": <SixthFormExponentialsLogarithmsIcon />,
    vectors: <SixthFormVectorsIcon />,
    "probability-statistics": <SixthFormProbabilityStatisticsIcon />,
    "proof-numerical": <SixthFormProofNumericalIcon />,
};
