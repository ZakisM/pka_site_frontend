import clsx from "clsx";

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(100, Math.ceil(progress)));

  return (
    <div className="flex shrink-0 h-1 w-full rounded-full bg-white/10">
      <div
        className={clsx(
          "bg-primary rounded-l-xl shadow-[0_0_8px] shadow-primary/60",
          "transition-[width] duration-300 ease-in-out",
          clampedProgress === 100 && "rounded-r-xl",
        )}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
};
