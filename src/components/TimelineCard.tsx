import {useAtom} from 'jotai';
import {useEffect, useRef} from 'react';
import {playerTimestampAtom} from '@/atoms/playerAtoms';
import type {DataComponentProps} from '@/types';
import {ProgressBar} from './ProgressBar';

interface TimelineCardProps extends DataComponentProps<'div'> {
  description: string;
  timestamp: number;
  lengthSeconds: number;
}

export const TimelineCard = ({
  description,
  timestamp,
  lengthSeconds,
  ...rest
}: TimelineCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [playerTimestamp] = useAtom(playerTimestampAtom);

  const formatTimestamp = (timestamp: number) => {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor(timestamp / 60) % 60;
    const seconds = timestamp % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isActive = rest['data-active'];

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start',
      });
    }
  }, [isActive]);

  return (
    <div
      ref={ref}
      className="max-xl:min-w-60 rounded-md p-3 bg-night text-sm text-zinc-400 data-[active]:text-white data-[active]:bg-timeline-card flex flex-col xl:flex-row gap-5"
      {...rest}>
      <time>{formatTimestamp(timestamp)}</time>
      <div className="flex flex-col gap-3 grow">
        <p className="line-clamp-4" title={description}>
          {description}
        </p>
        {isActive && (
          <ProgressBar
            progress={Number(
              (((playerTimestamp - timestamp) / lengthSeconds) * 100).toFixed(
                1,
              ),
            )}
          />
        )}
      </div>
    </div>
  );
};
