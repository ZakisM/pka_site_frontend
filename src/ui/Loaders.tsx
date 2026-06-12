// The brand loading states from pka_index_brand_assets. The rules live in
// Styles.css; these are the markup each one expects.

type TicksSize = "sm" | "md" | "lg";
type TicksTone = "red" | "muted" | "dim";

const SIZES: Record<TicksSize, string> = {
  sm: "pka-ticks--sm",
  md: "",
  lg: "pka-ticks--lg",
};

const TONES: Record<TicksTone, string> = {
  red: "",
  muted: "pka-ticks--muted",
  dim: "pka-ticks--dim",
};

interface TicksProps {
  size?: TicksSize;
  tone?: TicksTone;
  className?: string;
  label?: string;
}

// The general-purpose spinner — for where the shape of what is loading is not
// Known, or inline in a button.
export const Ticks = ({
  size = "md",
  tone = "red",
  className = "",
  label = "Loading",
}: TicksProps) => (
  <span
    role="status"
    aria-label={label}
    className={`pka-ticks ${SIZES[size]} ${TONES[tone]} ${className}`}
  >
    <i />
    <i />
    <i />
  </span>
);

// Route / page load. 2px tall, sits under the header, never shifts layout.
export const ScanBar = () => <div aria-hidden className="pka-scan" />;

interface SkeletonProps {
  className?: string;
  soft?: boolean;
  // Staggers the sheen so a column of rows does not read as one pattern.
  delay?: number;
  style?: React.CSSProperties;
}

// Use wherever the shape of the result is already known, so nothing jumps when
// The data lands.
export const Skeleton = ({
  className = "",
  soft = false,
  delay = 0,
  style,
}: SkeletonProps) => (
  <span
    aria-hidden
    className={`pka-sk ${soft ? "pka-sk--soft" : ""} ${className}`}
    style={
      {
        ...style,
        ...(delay ? { "--d": `${delay}s` } : {}),
      } as React.CSSProperties
    }
  />
);
