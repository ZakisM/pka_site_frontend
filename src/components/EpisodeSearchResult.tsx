import {format, fromUnixTime} from 'date-fns';
import type {DataComponentProps} from '@/types';
import {LinkButton} from './LinkButton';
import type {PkaEpisodeSearchResult} from '@/lib_wasm';
import {Play} from 'lucide-react';
import {searchOpenAtom} from '@/atoms/searchAtoms';
import {useSetAtom} from 'jotai';

interface EpisodeResultProps extends DataComponentProps<'div'> {
  item: PkaEpisodeSearchResult;
}

export const EpisodeSearchResult = ({item, ...rest}: EpisodeResultProps) => {
  const setSearchOpen = useSetAtom(searchOpenAtom);

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
        <div className="flex gap-2">
          <span className="rounded-[10px] bg-zinc-800 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs uppercase">
            EP {Number(item.episodeNumber.toFixed(1))}
          </span>
          <span className="rounded-[10px] bg-zinc-800 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs">
            {formattedLengthSeconds()}
          </span>
        </div>
        <div className="flex gap-2">
          <LinkButton
            onClick={() => setSearchOpen(false)}
            className="flex gap-1 items-center"
            to="/watch/$episodeId"
            params={{episodeId: item.episodeNumber.toString()}}>
            <span className="text-xs">Watch</span>
            <Play className="w-3 h-3" />
          </LinkButton>
        </div>
      </div>
    </div>
  );
};
