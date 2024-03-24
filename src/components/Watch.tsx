import ReactPlayer from 'react-player/lazy';
import {useParams} from 'react-router-dom';
import {Scrollbar} from './Scrollbar';

export const YOUTUBE_BASE_URL = 'https://www.youtube.com';

export const Watch = () => {
    const {episodeNumber} = useParams();

    // const playerRef = useRef<ReactPlayer>(null);
    // const eventsCardRef = useRef<any>(null);

    // const getUrl = (): string => {
    //     const videoId = watchEpisodeState.youtubeDetails?.videoId;

    //     const url = new URL(YOUTUBE_BASE_URL);
    //     url.pathname = 'watch';
    //     url.searchParams.append('v', videoId);
    //     url.searchParams.append('origin', window.location.origin);
    //     url.searchParams.append('enablejsapi', '1');

    //     return url.toString();
    // };

    return (
        <div className="flex h-full flex-col gap-4 overflow-hidden xl:flex-row">
            <div className="flex grow flex-col overflow-hidden rounded-md border border-zinc-900 bg-zinc-950">
                <ReactPlayer
                    url="https://www.youtube.com/watch?v=oKxDuzYMJ98"
                    height="100%"
                    width="100%"
                    controls={true}
                />
                <div className="p-4">
                    <h1 className="font-medium text-lg text-zinc-300">
                        PKA 692: President Squad
                    </h1>
                    <p className="text-zinc-500">Sunday 24th March 2024</p>
                </div>
            </div>
            <div className="rounded-md border border-zinc-900 bg-zinc-950 px-4 xl:w-96">
                <h1 className="py-4 font-bold text-sm text-zinc-300 uppercase tracking-wide">
                    Timeline
                </h1>
                <Scrollbar element="div" className="xl:h-[calc(100%-54px)]">
                    <div className="flex flex-row gap-4 pb-4 xl:flex-col">
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
            <div className="rounded-md bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">
                    Looking to take your team away on a retreat to enjoy awesome
                    food and take in some sunshine? We have a list of places to
                    do just that.
                </p>
            </div>
        </div>
    );
};
