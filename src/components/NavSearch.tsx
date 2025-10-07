import {Milestone, Podcast, Search, SearchX, X} from 'lucide-react';
import {Activity} from 'react';
import type {PkaEpisodeSearchResult, PkaEventSearchResult} from '@/lib_wasm.ts';
import {
  SearchTab,
  debouncedSearchQueryAtom,
  searchCountAtom,
  searchOpenAtom,
  searchQueryAtom,
  searchTabAtom,
} from '@/atoms/searchAtoms.ts';
import {
  type UseQueryOptions,
  useIsFetching,
  useQuery,
} from '@tanstack/react-query';
import {
  searchEpisodeQueryOptions,
  searchEventQueryOptions,
} from '@/utils/queryOptions.ts';
import {useAtom, useSetAtom} from 'jotai';
import {useEffect, useLayoutEffect, useRef} from 'react';
import type {DataComponentProps} from '@/types.ts';
import {EpisodeSearchResult} from './EpisodeSearchResult.tsx';
import {EventSearchResult} from './EventSearchResult.tsx';
import {Spinner} from './Spinner.tsx';
import {TabButton} from './TabButton.tsx';
import type {VListHandle} from 'virtua';
import {VirtualizedScrollbar} from './Scrollbar.tsx';
import {debounce} from '@/utils/index.ts';
import {scrollbarStateAtom} from '@/atoms/scrollbarAtoms.ts';

export const NavSearch = ({...rest}: DataComponentProps<'div'>) => {
  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom);

  return (
    <>
      <div className="flex justify-between" {...rest}>
        <button
          className="flex w-full items-center justify-center rounded-lg bg-zinc-900/50 p-1.5 text-left text-sm text-zinc-500 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700/75 hover:cursor-pointer"
          onClick={() => setSearchOpen(true)}
          type="button">
          <Search className="mr-1.5 h-4 w-4 stroke-2 text-zinc-500" />
          Search...
        </button>
      </div>
      <Activity mode={searchOpen ? 'visible' : 'hidden'}>
        <NavSearchModal />
      </Activity>
    </>
  );
};

type SearchResultItem = PkaEpisodeSearchResult | PkaEventSearchResult;

interface SearchConfig<T extends SearchResultItem = any> {
  Component: React.ComponentType<T>;
  queryFn: (searchQuery?: string) => UseQueryOptions<T[], Error, T[], T[]>;
  searchTab: SearchTab;
  itemKey: (item: T) => string;
}

const searchConfigMap = {
  [SearchTab.EPISODES]: {
    searchTab: SearchTab.EPISODES,
    Component: EpisodeSearchResult,
    queryFn: searchEpisodeQueryOptions,
    itemKey: ({episodeNumber}: PkaEpisodeSearchResult) =>
      episodeNumber.toString(),
  },
  [SearchTab.EVENTS]: {
    searchTab: SearchTab.EVENTS,
    Component: EventSearchResult,
    queryFn: searchEventQueryOptions,
    itemKey: ({episodeNumber, timestamp}: PkaEventSearchResult) =>
      `${episodeNumber}-${timestamp}`,
  },
} as const satisfies Record<SearchTab, SearchConfig>;

const GenericSearchContent = ({
  config,
  searchQuery,
}: {
  config: SearchConfig;
  searchQuery: string;
}) => {
  const prevSearchQuery = useRef(searchQuery);
  const vScrollBarRef = useRef<VListHandle | null>(null);

  const {data, isFetched, isFetching} = useQuery(config.queryFn(searchQuery));

  const setSearchCount = useSetAtom(searchCountAtom);
  const setScrollbarState = useSetAtom(scrollbarStateAtom);

  useLayoutEffect(() => {
    if (isFetched && prevSearchQuery.current !== searchQuery) {
      vScrollBarRef.current?.scrollTo(0);
      setScrollbarState({});

      prevSearchQuery.current = searchQuery;
    }
  }, [searchQuery, setScrollbarState, isFetched]);

  useEffect(() => {
    setSearchCount(data?.length ?? 0);
  }, [data, setSearchCount]);

  if (!data?.length && isFetching) {
    return null;
  }

  if (!data?.length) {
    return (
      <div className="flex flex-grow justify-center items-center gap-2 text-zinc-400">
        <SearchX className="w-4 h-4" />
        <span className="font-light text-md">No results found</span>
      </div>
    );
  }

  return (
    <VirtualizedScrollbar
      scrollKey={config.searchTab}
      className="flex grow mb-6 px-6"
      vScrollbarRef={vScrollBarRef}>
      {data.map((item) => (
        <config.Component key={config.itemKey(item)} item={item} />
      ))}
    </VirtualizedScrollbar>
  );
};

const NavSearchModal = () => {
  const searchFetching = useIsFetching({queryKey: ['search']});

  const [searchCount] = useAtom(searchCountAtom);
  const setSearchOpen = useSetAtom(searchOpenAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [searchTab, setSearchTab] = useAtom(searchTabAtom);

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
        className="mx-auto flex h-full max-w-2xl flex-col rounded-lg border border-zinc-800/50 bg-night"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setSearchOpen(false);
          }
        }}>
        <div className="flex items-center border-zinc-800/50 border-b pr-4 px-2.75">
          <div className="flex w-8 h-8 items-center justify-center">
            {searchFetching > 0 ? (
              <Spinner className="w-full h-full" />
            ) : (
              <Search className="h-5 w-5 stroke-2 text-zinc-400" />
            )}
          </div>
          <input
            autoFocus
            className="w-full bg-transparent p-4 pl-2.75 text-base text-zinc-300 caret-primary outline-none selection:bg-zinc-700 placeholder:text-zinc-400"
            placeholder="Search..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            value={searchQuery}
          />
          <button
            className="sm:hidden"
            type="button"
            onClick={() => setSearchOpen(false)}>
            <X className="stroke-2 text-zinc-300 hover:cursor-pointer" />
          </button>
        </div>
        <div className="mx-6 my-4">
          <div className="text-zinc-400 font-light text-sm">
            {searchCount} results
          </div>
          <div className="flex gap-2 mt-2.5">
            <TabButton
              active={searchTab === SearchTab.EPISODES}
              onClick={() => setSearchTab(SearchTab.EPISODES)}>
              <span>Episodes</span>
              <Podcast className="w-3 h-3" />
            </TabButton>
            <TabButton
              active={searchTab === SearchTab.EVENTS}
              onClick={() => setSearchTab(SearchTab.EVENTS)}>
              <span>Events</span>
              <Milestone className="w-3 h-3" />
            </TabButton>
          </div>
        </div>
        <GenericSearchContent
          key={searchTab}
          config={searchConfigMap[searchTab]}
          searchQuery={debouncedQuery}
        />
      </div>
    </div>
  );
};
