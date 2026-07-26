import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router";
import { episodeKey, episodeQuery } from "@/lib/queries";
import { fetchEpisodeById, fetchRandomEvent } from "@/lib/api";
import { WatchScreen } from "@/watch/WatchScreen";
import { getDefaultStore } from "jotai";
import { startIntentAtom } from "@/player/playerState";

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
const resolveEpisode = async (
  queryClient: QueryClient,
  episodeId: string,
) => {
  const episode = await fetchEpisodeById(episodeId);
  const resolved = String(episode.episode.number);

  queryClient.setQueryData(episodeKey(resolved), episode);

  return resolved;
};

export const Route = createFileRoute("/watch/$episodeId")({
  component: Watch,
  // ?timestamp is an entry point for shared links only; the app never writes
  // It back, so nothing else needs to be in the URL.
  validateSearch: (search: Record<string, unknown>): { timestamp?: number } =>
    search,
  loader: async ({ context, params }) => {
    const { episodeId } = params;

    if (episodeId === "latest" || episodeId === "random") {
      throw redirect({
        to: "/watch/$episodeId",
        params: { episodeId: await resolveEpisode(context.queryClient, episodeId) },
      });
    }

    if (episodeId === "random-event") {
      const event = await fetchRandomEvent();
      const resolved = await resolveEpisode(
        context.queryClient,
        String(event.episodeNumber),
      );

      // Hand the position over in state so the redirected URL stays clean.
      getDefaultStore().set(startIntentAtom, {
        episodeNumber: Number(resolved),
        seconds: event.timestamp,
        requestedAt: Date.now(),
      });

      throw redirect({ to: "/watch/$episodeId", params: { episodeId: resolved } });
    }

    await context.queryClient.ensureQueryData(episodeQuery(episodeId));
  },
});
