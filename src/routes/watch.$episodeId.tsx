import {useSuspenseQuery} from '@tanstack/react-query';
import {createFileRoute, redirect} from '@tanstack/react-router';
import {format, fromUnixTime} from 'date-fns';
import {Scrollbar} from '@/components/Scrollbar';
import {TimelineCard} from '@/components/TimelineCard';
import {fetchEpisodeById} from '@/utils/api';
import {episodeQueryKeyFn, episodeQueryOptions} from '@/utils/queryOptions';

const Watch = () => {
  const params = Route.useParams();
  const {data} = useSuspenseQuery(episodeQueryOptions(params.episodeId));

  const formattedDate = format(
    fromUnixTime(data.episode.uploadDate),
    'EEEE do MMMM yyyy',
  );

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden xl:flex-row">
      <div className="flex grow flex-col overflow-hidden rounded-lg border border-zinc-900 bg-night">
        <div className="p-4">
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
        <Scrollbar element="div" className="xl:h-[calc(100%-54px)]">
          <div className="flex flex-row gap-2 px-4 pb-4 xl:flex-col">
            {data.events.map((event: any, index: number) => {
              return (
                <TimelineCard
                  key={event.timestamp}
                  description={event.description}
                  timestamp={event.timestamp}
                  data-active={index === 1 ? true : undefined}
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
  loader: async ({context, params}) => {
    if (params.episodeId === 'latest' || params.episodeId === 'random') {
      const data = await fetchEpisodeById(params.episodeId);

      const episodeId = data.episode.number;

      context.queryClient.setQueryData(episodeQueryKeyFn(episodeId), data);

      throw redirect({
        to: '/watch/$episodeId',
        params: {episodeId},
      });
    }

    context.queryClient.ensureQueryData(episodeQueryOptions(params.episodeId));
  },
});
