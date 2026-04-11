export const NumbersIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="13" fontSize="9" fontFamily="serif" fontWeight="bold">1</text>
        <text x="9" y="16" fontSize="9" fontFamily="serif" fontWeight="bold">2</text>
        <text x="16" y="13" fontSize="9" fontFamily="serif" fontWeight="bold">3</text>
    </svg>
);

export const AdditionSubtractionIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
        {/* Plus on the left */}
        <line x1="4" y1="12" x2="10" y2="12" />
        <line x1="7" y1="9" x2="7" y2="15" />
        {/* Minus on the right */}
        <line x1="14" y1="12" x2="20" y2="12" />
    </svg>
);

export const MultiplicationDivisionIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
        {/* × on the left */}
        <line x1="3" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="3" y2="15" />
        {/* ÷ on the right */}
        <circle cx="16.25" cy="9" r="1" fill="currentColor" stroke="none" />
        <line x1="13" y1="12" x2="20" y2="12" />
        <circle cx="16.25" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const FractionsIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {/* Numerator */}
        <text x="2" y="9" fontSize="7" fontFamily="serif" fontWeight="bold">1</text>
        {/* Fraction bar */}
        <line x1="1" y1="12.5" x2="7" y2="12.5" stroke="currentColor" strokeWidth="1" />
        {/* Denominator */}
        <text x="2" y="21" fontSize="7" fontFamily="serif" fontWeight="bold">2</text>
        {/* Decimal dot */}
        <circle cx="11.6" cy="12" r="1" />
        {/* % symbol */}
        <circle cx="17" cy="10" r="1.2" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="16" y1="15" x2="22" y2="8" stroke="currentColor" strokeWidth="1" />
        <circle cx="21" cy="13" r="1.2" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
);

export const MeasurementIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
        {/* Ruler body */}
        <rect x="2" y="9" width="21" height="6" rx="1" />
        {/* Tick marks */}
        <line x1="5"  y1="9" x2="5"  y2="12" />
        <line x1="8"  y1="9" x2="8"  y2="12" />
        <line x1="11" y1="9" x2="11" y2="12" />
        <line x1="14" y1="9" x2="14" y2="12" />
        <line x1="17" y1="9" x2="17" y2="12" />
        <line x1="20" y1="9" x2="20" y2="12" />
    </svg>
);

export const GeometryIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        {/* Triangle */}
        <polygon points="12,3 21,20 3,20" />
        {/* Curved angle indicator — 11-point arc inside bottom-left corner, radius 4.5 */}
        <polyline
            points="
                7.500,20.000
                7.470,19.513
                7.383,19.032
                7.240,18.565
                7.043,18.120
                6.797,17.704
                6.509,17.325
                6.182,16.988
                5.823,16.699
                5.439,16.463
                5.034,16.284
            "
            strokeWidth="1"
            strokeLinecap="round"
        />
    </svg>
);

export const AlgebraIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {/* x */}
        <text x="3"  y="14" fontSize="8" fontFamily="serif" fontStyle="italic" textAnchor="middle">x</text>
        {/* + */}
        <text x="12" y="14" fontSize="8" fontFamily="serif" textAnchor="middle">+</text>
        {/* y */}
        <text x="21" y="14" fontSize="8" fontFamily="serif" fontStyle="italic" textAnchor="middle">y</text>
    </svg>
);

export const StatisticsIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {/* Bar chart bars */}
        <rect x="3"  y="14" width="4" height="7" rx="0.5" />
        <rect x="10" y="9"  width="4" height="12" rx="0.5" />
        <rect x="17" y="4"  width="4" height="17" rx="0.5" />
        {/* Baseline */}
        <line x1="1" y1="21" x2="23" y2="21" stroke="currentColor" strokeWidth="1.2" />
    </svg>
);

export const ProblemSolvingIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
        {/* Light-bulb outline */}
        <path d="M9 21h6M12 3a6 6 0 0 1 4 10.5V17H8v-3.5A6 6 0 0 1 12 3z" />
        {/* Filament detail */}
        <line x1="10" y1="17" x2="10" y2="14" />
        <line x1="14" y1="17" x2="14" y2="14" />
        <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
);