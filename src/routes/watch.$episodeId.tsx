import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router";
import { episodeQueryKeyFn, episodeQueryOptions } from "@/utils/queryOptions";
import { fetchEpisodeById, fetchRandomEvent } from "@/utils/api";
import { format, fromUnixTime } from "date-fns";
import { playerScrollRequestTriggerAtom, playerTimestampAtomFamily } from "@/atoms/playerAtoms";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Scrollbar } from "@/components/Scrollbar";
import { TimelineCard } from "@/components/TimelineCard";
import type { TimerId } from "@/types";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { useAtom } from "jotai";

const routeApi = getRouteApi("/watch/$episodeId");

const Watch = () => {
  const params = routeApi.useParams();

  const { data } = useSuspenseQuery(episodeQueryOptions(params.episodeId));

  const cardRefs = useRef<(HTMLElement | null)[]>(
    Array.from({ length: data.events.length }, () => null),
  );

  // eslint-disable-next-line no-useless-undefined
  const scrollDebounceRef = useRef<TimerId>(undefined);

  const [playerScrollRequestTrigger, setPlayerScrollRequestTrigger] = useAtom(
    playerScrollRequestTriggerAtom,
  );

  // eslint-disable-next-line no-useless-undefined
  const resizeDebounceRef = useRef<TimerId>(undefined);

  useEffect(() => {
    const onResize = () => {
      clearTimeout(resizeDebounceRef.current);

      resizeDebounceRef.current = setTimeout(() => {
        setPlayerScrollRequestTrigger(Date.now());
      }, 500);
    };

    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(resizeDebounceRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [setPlayerScrollRequestTrigger]);

  const specificTimestampAtom = playerTimestampAtomFamily(data.youtubeDetails.videoId);
  const [playerTimestamp] = useAtom(specificTimestampAtom);

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const formattedDate = format(
    fromUnixTime(data.episode.uploadDate),
    "EEEE do MMMM yyyy",
  );

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

  const prevScrollStateRef = useRef({
    index: activeCardIndex,
    trigger: playerScrollRequestTrigger,
  });

  useLayoutEffect(() => {
    const prev = prevScrollStateRef.current;

    // Only scroll on actual changes, not on mount.
    // On mobile the list lives in the document scroll and would yank the page on load.
    if (
      prev.index === activeCardIndex &&
      prev.trigger === playerScrollRequestTrigger
    ) {
      return;
    }

    prevScrollStateRef.current = {
      index: activeCardIndex,
      trigger: playerScrollRequestTrigger,
    };

    clearTimeout(scrollDebounceRef.current);

    scrollDebounceRef.current = setTimeout(() => {
      cardRefs.current[activeCardIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }, 50);
  }, [activeCardIndex, playerScrollRequestTrigger]);

  return (
    <div
      key={data.episode.number}
      className="flex flex-col xl:h-full xl:flex-row xl:gap-6"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <img
          alt=""
          className="size-full scale-125 object-cover opacity-[0.07] blur-[100px]"
          src={`https://i.ytimg.com/vi/${data.youtubeDetails.videoId}/maxresdefault.jpg`}
        />
      </div>
      <div className="flex min-w-0 flex-col max-xl:contents xl:grow xl:gap-2.5">
        <div className="flex aspect-video w-full flex-col overflow-hidden bg-black max-xl:sticky max-xl:top-0 max-xl:z-10 xl:aspect-auto xl:grow xl:rounded-2xl xl:bg-night xl:shadow-2xl xl:shadow-black/40 xl:ring-1 xl:ring-white/5">
          <YouTubePlayer videoId={data.youtubeDetails.videoId} />
        </div>
        <div className="flex items-baseline gap-4 px-1.5 max-xl:hidden">
          <h1 className="min-w-0 truncate font-medium text-zinc-300">
            {data.youtubeDetails.title}
          </h1>
          <span className="ml-auto shrink-0 text-sm text-zinc-500">
            {formattedDate}
          </span>
        </div>
        <div className="px-4 pt-3 pb-1 xl:hidden">
          <h1 className="font-medium leading-snug text-zinc-100">
            {data.youtubeDetails.title}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">{formattedDate}</p>
        </div>
      </div>
      <div className="relative flex flex-col rounded-2xl bg-night/80 ring-1 ring-white/5 backdrop-blur-xl max-xl:mx-3 max-xl:mt-3 max-xl:mb-4 xl:w-96">
        <span
          aria-hidden
          className="pointer-events-none absolute top-14 bottom-3 left-[88px] w-px -translate-x-1/2 bg-white/[0.06]"
        />
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Timeline
          </h2>
          <span className="text-xs tabular-nums text-zinc-600">
            {data.events.length} events
          </span>
        </div>
        <Scrollbar className="mx-3 pb-3 xl:min-h-0 xl:flex-1">
          <div className="flex flex-col gap-2">
            {data.events.map((event, index) => 
              (
                <TimelineCard
                  ref={(ref) => {
                    cardRefs.current[index] = ref;
                  }}
                  key={`${event.episodeNumber}-${event.timestamp}`}
                  description={event.description}
                  timestamp={event.timestamp}
                  lengthSeconds={event.lengthSeconds}
                  videoId={data.youtubeDetails.videoId}
                  data-active={index === activeCardIndex ? true : undefined}
                />
              )
            )}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
};

// To ensure state gets reset correctly.
const WatchWrapper = () => {
  const params = routeApi.useParams();

  const { data } = useSuspenseQuery(episodeQueryOptions(params.episodeId));

  return <Watch key={data.episode.number} />;
};

const fetchAndCacheEpisode = async (
  context: { queryClient: QueryClient },
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

export const Route = createFileRoute("/watch/$episodeId")({
  component: WatchWrapper,
  validateSearch: (search: {
    [key: string]: unknown;
  }): { timestamp?: number } => 
    search
  ,
  loader: async ({ context, params }) => {
    if (params.episodeId === "latest" || params.episodeId === "random") {
      const episodeId = await fetchAndCacheEpisode(context, params.episodeId);

      throw redirect({
        to: "/watch/$episodeId",
        params: { episodeId },
      });
    }

    if (params.episodeId === "random-event") {
      const eventData = await fetchRandomEvent();
      const episodeId = await fetchAndCacheEpisode(
        context,
        eventData.episodeNumber.toString(),
      );

      throw redirect({
        to: "/watch/$episodeId",
        params: { episodeId },
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
