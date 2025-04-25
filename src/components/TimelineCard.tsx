import type {DataComponentProps} from '@/types';
import {ProgressBar} from './ProgressBar';

interface TimelineCardProps extends DataComponentProps<'div'> {
  description: string;
  timestamp: number;
}

export const TimelineCard = ({
  description,
  timestamp,
  ...rest
}: TimelineCardProps) => {
  const formatTimestamp = (timestamp: number) => {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor(timestamp / 60) % 60;
    const seconds = timestamp % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div
      className="max-xl:min-w-60 rounded-md p-3 bg-night text-sm text-zinc-400 data-[active]:text-white data-[active]:bg-timeline-card flex flex-col xl:flex-row gap-5"
      {...rest}>
      <time>{formatTimestamp(timestamp)}</time>
      <div className="flex flex-col gap-3 grow">
        <p>{description}</p>
        {rest['data-active'] && <ProgressBar progress={50} />}
      </div>
    </div>
  );
};
