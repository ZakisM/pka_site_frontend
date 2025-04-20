import {format, fromUnixTime} from 'date-fns';
import {Scrollbar} from '../components/Scrollbar';
import {createFileRoute} from '@tanstack/react-router';

export const YOUTUBE_BASE_URL = 'https://www.youtube.com';

const Watch = () => {
  // const playerRef = useRef<ReactPlayer>(null);
  // const eventsCardRef = useRef<any>(null);

  // Use the hook generated for your specific route to get typed loader data
  // const episodeData = useLoaderData({from: watchEpisodeRoute.id});

  // // Check if data exists (especially during initial load or if fetch failed, though ensureQueryData helps)
  // if (!episodeData?.data?.episode) {
  //   // Handle loading or error state appropriately
  //   // For example, show a loading spinner or an error message
  //   return <div>Loading episode data...</div>;
  // }

  const {name, uploadDate} = {name: 'zak', uploadDate: 12331233};

  // Convert Unix timestamp (seconds) to Date object
  const dateObject = fromUnixTime(uploadDate);

  // Format the date: e.g., "Saturday 18th May 2024"
  // We need a custom day format part for the ordinal
  const formattedDate = format(dateObject, 'EEEE do MMMM yyyy');

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden xl:flex-row">
      <div className="flex grow flex-col overflow-hidden rounded-md border border-zinc-900 bg-night">
        <div className="p-4">
          <h1 className="font-medium text-lg text-white">{name}</h1>
          <p className="text-zinc-500">{formattedDate}</p>
        </div>
      </div>
      <div className="rounded-md border border-zinc-900 bg-night xl:w-96">
        <h1 className="py-4 font-[425] text-sm text-white uppercase px-4 tracking-wider">
          Timeline
        </h1>
        <Scrollbar element="div" className="xl:h-[calc(100%-54px)]">
          <div className="flex flex-row gap-4 px-4 pb-4 xl:flex-col">
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
          </div>
        </Scrollbar>
      </div>
    </div>
  );
};

const Card = () => {
  return (
    <div className="max-xl:min-w-60">
      <div className="rounded-md bg-night p-4">
        <p className="text-sm text-zinc-400">
          Looking to take your team away on a retreat to enjoy awesome food and
          take in some sunshine? We have a list of places to do just that.
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/watch/')({
  component: Watch,
});
