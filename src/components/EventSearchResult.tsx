import {format, fromUnixTime} from 'date-fns';
import type {DataComponentProps} from '@/types';
import {LinkButton} from './LinkButton';
import type {PkaEventSearchResult} from '@/lib_wasm';
import {Play} from 'lucide-react';
import {playerScrollRequestTriggerAtom} from '@/atoms/playerAtoms';
import {searchOpenAtom} from '@/atoms/searchAtoms';
import {useSetAtom} from 'jotai';

interface EventResultProps extends DataComponentProps<'div'> {
  item: PkaEventSearchResult;
}

export const EventSearchResult = ({item, ...rest}: EventResultProps) => {
  const setSearchOpen = useSetAtom(searchOpenAtom);
  const setPlayerScrollRequestTrigger = useSetAtom(
    playerScrollRequestTriggerAtom,
  );

  const formattedUploadDate = format(
    fromUnixTime(item.uploadDate),
    'EEEE do MMMM yyyy',
  );

  const formattedLengthSeconds = () => {
    const minutes = Math.floor(item.lengthSeconds / 60) % 60;
    const seconds = item.lengthSeconds % 60;

    return `${minutes}m ${seconds}s`;
  };

  return (
    <div
      className="flex w-full flex-col first:border-t border-b border-zinc-800/50 py-2.5 gap-1"
      {...rest}>
      <h3 className="text-sm font-medium text-zinc-300">{item.description}</h3>
      <p className="text-xs text-zinc-400">
        <time>{formattedUploadDate}</time>
      </p>
      <div className="mt-1.5 flex justify-between">
        <div className="flex gap-2">
          <span className="shrink-0 rounded-[10px] bg-zinc-800 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs uppercase">
            EP {Number(item.episodeNumber.toFixed(1))}
          </span>
          <span className="shrink-0 rounded-[10px] bg-zinc-800 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs">
            {formattedLengthSeconds()}
          </span>
        </div>
        <div className="flex gap-2">
          <LinkButton
            onClick={() => {
              setSearchOpen(false);
              setPlayerScrollRequestTrigger(Date.now());
            }}
            className="flex  gap-1 items-center"
            to="/watch/$episodeId"
            params={{episodeId: item.episodeNumber.toString()}}
            search={{timestamp: item.timestamp}}>
            <span className="text-xs">Watch</span>
            <Play className="w-3 h-3" />
          </LinkButton>
        </div>
      </div>
    </div>
  );
};
