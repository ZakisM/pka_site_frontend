import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import React, {type ReactElement, useRef} from 'react';
import ReactPlayer from 'react-player/lazy';
import {useParams} from 'react-router-dom';

export const YOUTUBE_BASE_URL = 'https://www.youtube.com';

export const Watch = (): ReactElement => {
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
        <div className="flex flex-col xl:flex-row gap-4 h-full">
            <div className="bg-zinc-950 flex flex-col rounded-md outline outline-1 outline-zinc-900 grow">
                <ReactPlayer
                    url="https://www.youtube.com/watch?v=oKxDuzYMJ98"
                    height="100%"
                    width="100%"
                    controls={true}
                />
                <div className="p-4">
                    <h1 className="text-lg text-zinc-300 font-medium">
                        PKA 692: President Squad
                    </h1>
                    <p className="text-zinc-500">Sunday 24th March 2024</p>
                </div>
            </div>
            <div className="bg-zinc-950 rounded-md outline outline-1 outline-zinc-900 px-4 xl:w-96">
                <h1 className="text-sm text-zinc-300 tracking-wide font-bold uppercase py-4">
                    Timeline
                </h1>
                <OverlayScrollbarsComponent
                    element="div"
                    className="xl:h-[calc(100%-54px)]"
                    defer={true}
                    options={{
                        scrollbars: {
                            theme: 'os-theme-light',
                            autoHide: 'move',
                            clickScroll: true,
                        },
                    }}>
                    <div className="flex flex-row xl:flex-col gap-4 pb-4">
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
                </OverlayScrollbarsComponent>
            </div>
        </div>
    );
};

const Card = () => {
    return (
        <div className="max-xl:min-w-60">
            <div className="p-4 bg-zinc-950 rounded-md">
                <p className="text-zinc-400 text-sm">
                    Looking to take your team away on a retreat to enjoy awesome
                    food and take in some sunshine? We have a list of places to
                    do just that.
                </p>
            </div>
        </div>
    );
};
