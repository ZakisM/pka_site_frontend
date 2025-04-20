import {format, fromUnixTime, intervalToDuration} from 'date-fns';
import {Scrollbar} from '../components/Scrollbar';
import {createFileRoute, redirect} from '@tanstack/react-router';
import {episodeQueryKeyFn, episodeQueryOptions} from '../utils/queryOptions';
import {useSuspenseQuery} from '@tanstack/react-query';

export const YOUTUBE_BASE_URL = 'https://www.youtube.com';

const Watch = () => {
  const params = Route.useParams();
  const {data} = useSuspenseQuery(episodeQueryOptions(params.episodeId));

  const formattedDate = format(
    fromUnixTime(data.episode.uploadDate),
    'EEEE do MMMM yyyy',
  );

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden xl:flex-row">
      <div className="flex grow flex-col overflow-hidden rounded-md border border-zinc-900 bg-night">
        <div className="p-4">
          <h1 className="font-medium text-lg text-white">
            {data.youtubeDetails.title}
          </h1>
          <p className="text-zinc-500">{formattedDate}</p>
        </div>
      </div>
      <div className="rounded-md border border-zinc-900 bg-night xl:w-96">
        <h1 className="py-4 font-[425] text-sm text-white uppercase px-4 tracking-wider">
          Timeline
        </h1>
        <Scrollbar element="div" className="xl:h-[calc(100%-54px)]">
          <div className="flex flex-row gap-4 px-4 pb-4 xl:flex-col">
            {data.events.map((event: any) => {
              return (
                <Card
                  key={event.timestamp}
                  description={event.description}
                  timestamp={event.timestamp}
                />
              );
            })}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
};

interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  description: string;
  timestamp: number;
}

const Card = ({description, timestamp, ...rest}: CardProps) => {
  const formatTimestamp = (timestamp: number) => {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor(timestamp / 60) % 60;
    const seconds = timestamp % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="max-xl:min-w-60" {...rest}>
      <div className="rounded-md bg-night p-4 text-sm text-zinc-400">
        <p>{description}</p>
        <time>{formatTimestamp(timestamp)}</time>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/watch/$episodeId')({
  component: Watch,
  loader: async ({context, params}) => {
    const data = await context.queryClient.ensureQueryData(
      episodeQueryOptions(params.episodeId),
    );

    if (params.episodeId === 'latest' || params.episodeId === 'random') {
      const episodeId = data.episode.number;

      context.queryClient.setQueryData(episodeQueryKeyFn(episodeId), data);

      throw redirect({
        to: '/watch/$episodeId',
        params: {episodeId},
      });
    }
  },
});
