import {useIsFetching, useQuery} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import {Milestone, Podcast, Search, SearchX} from 'lucide-react';
import type {OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {useEffect, useRef} from 'react';
import {
  debouncedSearchQueryAtom,
  searchOpenAtom,
  searchQueryAtom,
  searchScrollStateAtom,
} from '@/atoms/searchAtoms.ts';
import {debounce} from '@/utils/index.ts';
import {searchEpisodeQueryOptions} from '@/utils/queryOptions.ts';
import {EpisodeSearchResult} from './EpisodeSearchResult.tsx';
import {Scrollbar} from './Scrollbar.tsx';
import {Spinner} from './Spinner.tsx';
import {Button} from './Button.tsx';

export const NavSearch = () => {
  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom);

  return (
    <div>
      <div className="flex justify-between">
        <button
          className="max-sm:hidden flex w-full items-center justify-center rounded-lg bg-zinc-900/50 p-1.5 text-left text-sm text-zinc-500 border-1 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700/75 hover:cursor-pointer"
          onClick={() => setSearchOpen(true)}
          type="button">
          <Search className="mr-1.5 h-4 w-4 stroke-2 text-zinc-500" />
          Search...
        </button>
      </div>
      {searchOpen && <NavSearchModal />}
    </div>
  );
};

const NavSearchModal = () => {
  const [, setSearchOpen] = useAtom(searchOpenAtom);
  const searchFetching = useIsFetching({queryKey: ['search']});
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  const [debouncedQuery, setDebouncedQuery] = useAtom(debouncedSearchQueryAtom);
  const debouncedSetQuery = debounce(setDebouncedQuery, 250);

  useEffect(() => {
    debouncedSetQuery(searchQuery);
  }, [searchQuery, debouncedSetQuery]);

  return (
    <div
      className="fixed top-0 left-0 z-10 size-full bg-black/25 sm:p-16 backdrop-blur-md animate-in fade-in duration-250"
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
        <div className="flex items-center border-zinc-800/50 border-b px-4">
          <Search className="shrink-0 h-5 w-5 stroke-2 text-zinc-400" />
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
          <div className="w-8 h-8">
            {searchFetching > 0 && (
              <Spinner className="flex w-full h-full items-center justify-center" />
            )}
          </div>
        </div>
        <NavSearchContent searchQuery={debouncedQuery} />
      </div>
    </div>
  );
};

const NavSearchContent = ({searchQuery}: {searchQuery: string}) => {
  const {data} = useQuery(searchEpisodeQueryOptions(searchQuery));

  const [scrollState, setScrollState] = useAtom(searchScrollStateAtom);
  const debouncedSetScrollState = debounce(setScrollState, 100);

  const firstRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<OverlayScrollbarsComponentRef | null>(null);

  useEffect(() => {
    if (firstRef.current && data) {
      firstRef.current.scrollIntoView();
    }
  }, [data]);

  if (!data) {
    return null;
  }

  if (!data.length) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400">
          <SearchX className="w-4.75 h-4.75" />
          <span className="text-md">No results found</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-6 my-4">
        <div className="text-zinc-400 font-light text-sm">
          {data.length} results
        </div>
        <div className="flex gap-2 mt-2.5">
          <Button className="inline-flex gap-1 items-center" type="button">
            <span>Episodes</span>
            <Podcast className="w-3 h-3" />
          </Button>
          <Button
            className="inline-flex gap-1 items-center"
            intent="secondary"
            type="button">
            <span>Events</span>
            <Milestone className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <Scrollbar
        ref={scrollRef}
        className="hidden"
        element="div"
        events={{
          initialized(instance) {
            instance.elements().viewport.scroll({top: scrollState});
          },
          scroll(instance) {
            debouncedSetScrollState(instance.elements().viewport.scrollTop);
          },
        }}>
        <div className="mx-6 mb-6">
          {data.map((item, index) => {
            return (
              <EpisodeSearchResult
                ref={index === 0 ? firstRef : undefined}
                key={item.uploadDate}
                item={item}
              />
            );
          })}
        </div>
      </Scrollbar>
    </>
  );
};
