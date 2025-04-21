import {format, fromUnixTime} from 'date-fns';
import type {PkaEpisodeSearchResult} from '@/lib_wasm';
import type {DataComponentProps} from '@/types';
import {ExternalLink, Play} from 'lucide-react';
import {Button} from './Button';

interface EpisodeResultProps extends DataComponentProps<'div'> {
  item: PkaEpisodeSearchResult;
}

export const EpisodeSearchResult = ({item, ...rest}: EpisodeResultProps) => {
  const formattedUploadDate = format(
    fromUnixTime(item.uploadDate),
    'EEEE do MMMM yyyy',
  );

  const formattedLengthSeconds = () => {
    const hours = Math.floor(item.lengthSeconds / 3600);
    const minutes = Math.floor(item.lengthSeconds / 60) % 60;

    return `${hours}h ${minutes}m`;
  };

  return (
    <div
      className="flex w-full flex-col first:border-t border-b border-zinc-800/50 py-2.5 gap-1"
      {...rest}>
      <h3 className="text-sm font-medium text-zinc-300">{item.title}</h3>
      <p className="text-xs text-zinc-400">
        <time>{formattedUploadDate}</time>
      </p>
      <div className="mt-1.5 flex justify-between items-center">
        <div className="inline-flex gap-2">
          <span className="rounded-[10px] bg-zinc-800 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs uppercase">
            EP {Number(item.episodeNumber.toFixed(1))}
          </span>
          <span className="rounded-[10px] bg-zinc-800 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs">
            {formattedLengthSeconds()}
          </span>
        </div>
        <div className="inline-flex gap-2">
          <Button className="inline-flex gap-1 items-center" type="button">
            <span className="text-xs">Watch</span>
            <Play className="w-3 h-3" />
          </Button>
          <Button
            className="inline-flex gap-1.5 items-center"
            intent="secondary"
            type="button">
            <span className="text-xs">YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
