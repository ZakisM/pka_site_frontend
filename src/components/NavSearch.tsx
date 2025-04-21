import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {useQuery} from '@tanstack/react-query';
import {format, fromUnixTime} from 'date-fns';
import {useEffect, useState} from 'react';
import type {PkaEpisodeSearchResult} from '@/lib_wasm.ts';
import type {DataComponentProps} from '@/types.ts';
import {debounce} from '@/utils/index.ts';
import {searchEpisodeQueryOptions} from '@/utils/queryOptions.ts';
import {Scrollbar} from './Scrollbar.tsx';
import {Spinner} from './Spinner.tsx';

interface EpisodeResultProps extends DataComponentProps<'div'> {
  item: PkaEpisodeSearchResult;
}

const EpisodeSearchResult = ({item, ...rest}: EpisodeResultProps) => {
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
      <h4 className="text-xs text-zinc-400">{formattedUploadDate}</h4>
      <div className="mt-1.5 flex gap-2">
        <div className="w-fit rounded-[10px] bg-primary/75 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs uppercase">
          EP {item.episodeNumber}
        </div>
        <div className="w-fit rounded-[10px] bg-zinc-800/90 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs">
          {formattedLengthSeconds()}
        </div>
      </div>
    </div>
  );
};

interface NavSearchProps extends DataComponentProps<'div'> {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const NavSearch = ({
  searchOpen,
  setSearchOpen,
  ...rest
}: NavSearchProps) => {
  return (
    <div {...rest}>
      <div className="flex justify-between">
        <button
          className="max-sm:hidden flex w-full items-center justify-center rounded-lg bg-zinc-900/50 p-1.5 text-left text-sm text-zinc-500 border-1 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700/75 hover:cursor-pointer"
          onClick={() => setSearchOpen(true)}
          type="button">
          <MagnifyingGlassIcon className="mr-1.5 h-4 w-4 stroke-2 text-zinc-500" />
          Search...
        </button>
      </div>
      {searchOpen && (
        <NavSearchModal searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
      )}
    </div>
  );
};

const NavSearchModal = ({setSearchOpen}: NavSearchProps) => {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSet = debounce(setDebouncedQuery, 200);

  useEffect(() => {
    debouncedSet(searchQuery);
  }, [searchQuery, debouncedSet]);

  return (
    <div
      className="fixed top-0 left-0 z-10 size-full bg-black/25 sm:p-16 backdrop-blur-md"
      onMouseDown={() => {
        setSearchOpen(false);
      }}>
      <div
        className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-lg  border border-zinc-800/50 bg-night"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setSearchOpen(false);
          }
        }}>
        <div className="flex items-center border-zinc-800/50 border-b pl-4">
          <MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-zinc-400" />
          <input
            // biome-ignore lint/a11y/noAutofocus: Modal autofocus is desired behaviour
            autoFocus
            className="w-full bg-transparent p-4 text-base text-zinc-300 caret-primary outline-hidden selection:bg-zinc-700 placeholder:text-zinc-400"
            placeholder="Search..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            value={searchQuery}
          />
        </div>
        <NavSearchContent searchQuery={debouncedQuery} />
      </div>
    </div>
  );
};

const NavSearchContent = ({searchQuery}: {searchQuery: string}) => {
  const {isPending, data} = useQuery(searchEpisodeQueryOptions(searchQuery));

  if (isPending) {
    return <Spinner />;
  }

  return (
    <>
      <div className="mx-6 my-4">
        <div className="text-zinc-400 font-light text-sm">
          {data.length} results
        </div>
        <div className="flex gap-2 mt-2.5">
          <button
            className="rounded-[10px] bg-primary/75 py-1.25 px-3 tracking-wider font-[425]  text-white text-xs uppercase hover:cursor-pointer"
            type="button">
            Episodes
          </button>
          <button
            className="rounded-[10px] bg-primary py-1.25 px-3 tracking-wider font-[425]  text-white text-xs uppercase hover:cursor-pointer opacity-50"
            type="button">
            Events
          </button>
        </div>
      </div>
      <Scrollbar element="div">
        <div className="mx-6 mb-6">
          {data.map((item) => {
            return <EpisodeSearchResult key={item.uploadDate} item={item} />;
          })}
        </div>
      </Scrollbar>
    </>
  );
};
