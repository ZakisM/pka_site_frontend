import {clsx} from '@/utils';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = ({progress}: ProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="flex h-1.25">
      <div
        className={clsx(
          'bg-primary rounded-l-xl',
          clampedProgress === 100 && 'rounded-r-xl',
        )}
        style={{width: `${clampedProgress}%`}}
      />
      <div
        className={clsx(
          'bg-[#240306] rounded-r-xl',
          clampedProgress === 0 && 'rounded-l-xl',
        )}
        style={{width: `${100 - clampedProgress}%`}}
      />
    </div>
  );
};
