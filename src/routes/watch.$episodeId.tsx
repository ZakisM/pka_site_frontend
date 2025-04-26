import {useSuspenseQuery} from '@tanstack/react-query';
import {createFileRoute, redirect} from '@tanstack/react-router';
import {format, fromUnixTime} from 'date-fns';
import {useAtom} from 'jotai';
import {playerTimestampAtom} from '@/atoms/playerAtoms';
import {Scrollbar} from '@/components/Scrollbar';
import {TimelineCard} from '@/components/TimelineCard';
import {YouTubePlayer} from '@/components/YouTubePlayer';
import {fetchEpisodeById, type PkaEvent} from '@/utils/api';
import {episodeQueryKeyFn, episodeQueryOptions} from '@/utils/queryOptions';

const Watch = () => {
  const [playerTimestamp] = useAtom(playerTimestampAtom);

  const params = Route.useParams();
  const {data} = useSuspenseQuery(episodeQueryOptions(params.episodeId));

  const formattedDate = format(
    fromUnixTime(data.episode.uploadDate),
    'EEEE do MMMM yyyy',
  );

  const timelineCardIsActive = (event: PkaEvent, index: number) => {
    if (data.events.length === 1) {
      return true;
    }

    if (
      index === 0 &&
      (playerTimestamp === 0 || playerTimestamp < event.timestamp)
    ) {
      return true;
    }

    if (
      index === data.events.length - 1 &&
      playerTimestamp >= event.timestamp
    ) {
      return true;
    }

    if (
      playerTimestamp >= event.timestamp &&
      playerTimestamp < event.timestamp + event.lengthSeconds
    ) {
      return true;
    }

    return undefined;
  };

  return (
    <div className="flex h-full flex-col gap-4 xl:flex-row">
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
        <Scrollbar element="div" className="xl:h-[calc(100%-54px)] max-xl:mx-4">
          <div className="flex flex-row gap-2 pb-4 xl:flex-col xl:mx-4">
            {data.events.map((event, index) => {
              return (
                <TimelineCard
                  key={event.timestamp}
                  description={event.description}
                  timestamp={event.timestamp}
                  lengthSeconds={event.lengthSeconds}
                  data-active={timelineCardIsActive(event, index)}
                />
              );
            })}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/watch/$episodeId')({
  component: Watch,
  validateSearch: (search: Record<string, unknown>): {timestamp?: number} => {
    return search;
  },
  loader: async ({context, params}) => {
    if (params.episodeId === 'latest' || params.episodeId === 'random') {
      const data = await fetchEpisodeById(params.episodeId);

      const episodeId = data.episode.number.toString();

      context.queryClient.setQueryData(episodeQueryKeyFn(episodeId), data);

      throw redirect({
        to: '/watch/$episodeId',
        params: {episodeId},
      });
    }

    await context.queryClient.ensureQueryData(
      episodeQueryOptions(params.episodeId),
    );
  },
});
