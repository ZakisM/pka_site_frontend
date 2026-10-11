import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router";
import { episodeKey, episodeQuery } from "@/lib/queries";
import { fetchEpisodeById, fetchRandomEvent } from "@/lib/api";
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
// Always shareable. Priming the cache under that number means the redirected
// Route loads without a second request.
const resolveEpisode = async (queryClient: QueryClient, episodeId: string) => {
  const episode = await fetchEpisodeById(episodeId);
  const resolved = String(episode.episode.number);

  queryClient.setQueryData(episodeKey(resolved), episode);

  return resolved;
};

export const Route = createFileRoute("/watch/$episodeId")({
  component: Watch,
  // ?timestamp is an entry point for shared links only; the app never writes
  // It back, so nothing else needs to be in the URL.
  validateSearch: (search: Record<string, unknown>): { timestamp?: number } => search,
  loader: async ({ context, params }) => {
    const { episodeId } = params;

    // Fetched alongside the episode rather than after it renders: the player
    // Can't start until YouTube's script is in. Once per page; a no-op after.
    void loadYouTubeApi();

    if (episodeId === "latest" || episodeId === "random") {
      throw redirect({
        to: "/watch/$episodeId",
        params: { episodeId: await resolveEpisode(context.queryClient, episodeId) },
      });
    }

    if (episodeId === "random-event") {
      const event = await fetchRandomEvent();
      const resolved = await resolveEpisode(context.queryClient, String(event.episodeNumber));

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
