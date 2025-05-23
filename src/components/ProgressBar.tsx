import clsx from 'clsx';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = ({progress}: ProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(100, Math.ceil(progress)));

  return (
    <div className="flex shrink-0 h-1.25 w-full rounded-full bg-[#240306]">
      <div
        className={clsx(
          'bg-primary rounded-l-xl',
          'transition-[width] duration-300 ease-in-out',
          clampedProgress === 100 && 'rounded-r-xl',
        )}
        style={{width: `${clampedProgress}%`}}
      />
    </div>
  );
};
