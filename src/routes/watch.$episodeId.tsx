import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router";
import { episodeKey, episodeQuery, randomEventQuery, unkept } from "@/lib/queries";
import type { QueryClient } from "@tanstack/react-query";
import { WatchScreen } from "@/watch/WatchScreen";
import { loadYouTubeApi } from "@/lib/youtube";
import { playFrom } from "@/lib/intents";
import { useSuspenseQuery } from "@tanstack/react-query";

const routeApi = getRouteApi("/watch/$episodeId");

const Watch = () => {
  const { episodeId } = routeApi.useParams();
  const { timestamp } = routeApi.useSearch();
  const { data } = useSuspenseQuery(episodeQuery(episodeId));

  return <WatchScreen episode={data} urlTimestamp={timestamp} />;
};

// The aliases resolve to a real episode number, then redirect so the URL is
// always shareable. Priming the cache under that number means the redirected
// route loads without a second request. Asked through React Query for its
// retries, but an alias's answer is never kept: "random" would be the same
// episode every time.
const resolveEpisode = async (queryClient: QueryClient, episodeId: string, alias: boolean) => {
  const episode = await queryClient.query({
    ...episodeQuery(episodeId),
    ...(alias ? unkept : { staleTime: "static" }),
  });
  const resolved = String(episode.episode.number);

  if (resolved !== episodeId) {
    queryClient.setQueryData(episodeKey(resolved), episode);
  }

  return resolved;
};

export const Route = createFileRoute("/watch/$episodeId")({
  component: Watch,
  // ?timestamp is an entry point for shared links only; the app never writes
  // it back, so nothing else needs to be in the URL.
  validateSearch: (search: Record<string, unknown>): { timestamp?: number } => search,
  loader: async ({ context, params }) => {
    const { episodeId } = params;

    // Fetched alongside the episode rather than after it renders: the player
    // can't start until YouTube's script is in. Once per page; a no-op after.
    void loadYouTubeApi();

    if (episodeId === "latest" || episodeId === "random") {
      throw redirect({
        to: "/watch/$episodeId",
        params: { episodeId: await resolveEpisode(context.queryClient, episodeId, true) },
      });
    }

    if (episodeId === "random-event") {
      const event = await context.queryClient.query(randomEventQuery);
      const resolved = await resolveEpisode(context.queryClient, String(event.episodeNumber), false);

      // The position travels with the redirect, so the URL stays clean.
      throw redirect({
        to: "/watch/$episodeId",
        params: { episodeId: resolved },
        state: playFrom(Number(resolved), event.timestamp),
      });
    }

    // Cached data is used as it is; only a missing episode is fetched.
    await context.queryClient.query({ ...episodeQuery(episodeId), staleTime: "static" });
  },
});
