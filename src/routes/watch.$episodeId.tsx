import {type QueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {createFileRoute, redirect} from '@tanstack/react-router';
import {format, fromUnixTime} from 'date-fns';
import {useAtom} from 'jotai';
import {useLayoutEffect, useRef, useState} from 'react';
import {
  playerTimestampAtom,
  playerScrollRequestTriggerAtom,
} from '@/atoms/playerAtoms';
import {Scrollbar} from '@/components/Scrollbar';
import {TimelineCard} from '@/components/TimelineCard';
import {YouTubePlayer} from '@/components/YouTubePlayer';
import {fetchEpisodeById, fetchRandomEvent} from '@/utils/api';
import {episodeQueryKeyFn, episodeQueryOptions} from '@/utils/queryOptions';

// To ensure state gets reset correctly.
const WatchWrapper = () => {
  const params = Route.useParams();

  const {data} = useSuspenseQuery(episodeQueryOptions(params.episodeId));

  return <Watch key={data.episode.number} />;
};

const Watch = () => {
  const params = Route.useParams();
  const search = Route.useSearch();

  const {data} = useSuspenseQuery(episodeQueryOptions(params.episodeId));

  const cardRefs = useRef<(HTMLDivElement | null)[]>(
    Array.from({length: data.events.length}, () => null),
  );

  const scrollDebounceRef = useRef<NodeJS.Timeout>(undefined);

  const [playerScrollRequestTrigger] = useAtom(playerScrollRequestTriggerAtom);
  const [playerTimestamp, setPlayerTimestamp] = useAtom(playerTimestampAtom);

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const formattedDate = format(
    fromUnixTime(data.episode.uploadDate),
    'EEEE do MMMM yyyy',
  );

  useLayoutEffect(() => {
    if (search.timestamp) {
      setPlayerTimestamp(search.timestamp);
    }
  }, [setPlayerTimestamp, search.timestamp]);

  useLayoutEffect(() => {
    return () => {
      setPlayerTimestamp(0);
    };
  }, [setPlayerTimestamp]);

  useLayoutEffect(() => {
    for (const [index, event] of data.events.entries()) {
      if (
        playerTimestamp >= event.timestamp &&
        playerTimestamp < event.timestamp + event.lengthSeconds
      ) {
        setActiveCardIndex(index);
        break;
      }
    }
  }, [data, playerTimestamp]);

  useLayoutEffect(() => {
    clearTimeout(scrollDebounceRef.current);

    scrollDebounceRef.current = setTimeout(() => {
      cardRefs.current[activeCardIndex]!.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start',
      });
    }, 0);
  }, [activeCardIndex, playerScrollRequestTrigger]);

  return (
    <div
      key={data.episode.number}
      className="flex h-full flex-col gap-4 xl:flex-row">
      <div className="flex grow flex-col rounded-lg border border-zinc-900 bg-night">
        <YouTubePlayer videoId={data.youtubeDetails.videoId} />
        <div className="m-4">
          <h1 className="font-medium text-lg text-white">
            {data.youtubeDetails.title}
          </h1>
          <p className="text-zinc-500">{formattedDate}</p>
        </div>
      </div>
      <div className="rounded-lg border border-zinc-900 bg-night xl:w-96">
        <h1 className="py-4 font-medium text-primary uppercase px-6 tracking-wider">
          Timeline
        </h1>
        <Scrollbar className="xl:h-[calc(100%-54px)] mx-4 pb-4 max-xl:h-40">
          <div className="flex flex-row gap-2 xl:flex-col">
            {data.events.map((event, index) => {
              return (
                <TimelineCard
                  ref={(ref) => {
                    cardRefs.current[index] = ref;
                  }}
                  key={`${event.episodeNumber}-${event.timestamp}`}
                  description={event.description}
                  timestamp={event.timestamp}
                  lengthSeconds={event.lengthSeconds}
                  data-active={index === activeCardIndex ? true : undefined}
                />
              );
            })}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
};

const fetchAndCacheEpisode = async (
  context: {queryClient: QueryClient},
  episodeId: string,
) => {
  const episodeData = await fetchEpisodeById(episodeId);

  const episodeNumber = episodeData.episode.number.toString();

  context.queryClient.setQueryData(
    episodeQueryKeyFn(episodeNumber),
    episodeData,
  );

  return episodeNumber;
};

export const Route = createFileRoute('/watch/$episodeId')({
  component: WatchWrapper,
  validateSearch: (search: Record<string, unknown>): {timestamp?: number} => {
    return search;
  },
  loader: async ({context, params}) => {
    if (params.episodeId === 'latest' || params.episodeId === 'random') {
      const episodeId = await fetchAndCacheEpisode(context, params.episodeId);

      throw redirect({
        to: '/watch/$episodeId',
        params: {episodeId},
      });
    }

    if (params.episodeId === 'random-event') {
      const eventData = await fetchRandomEvent();
      const episodeId = await fetchAndCacheEpisode(
        context,
        eventData.episodeNumber.toString(),
      );

      throw redirect({
        to: '/watch/$episodeId',
        params: {episodeId},
        search: {
          timestamp: eventData.timestamp,
        },
      });
    }

    await context.queryClient.ensureQueryData(
      episodeQueryOptions(params.episodeId),
    );
  },
});
