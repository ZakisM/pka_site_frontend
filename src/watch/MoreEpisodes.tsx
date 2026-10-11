import { EpisodeCard } from "@/ui/EpisodeCard";
import type { EpisodeSummary } from "@/lib/api";
import { allEpisodesQuery } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";

const COUNT = 6;

// The episodes closest to this one in the archive, nearest first, then shown
// Newest first — so the next and previous episodes are always among them.
const neighbours = (episodes: EpisodeSummary[], episodeNumber: number) => {
  const index = episodes.findIndex((episode) => episode.episodeNumber === episodeNumber);

  if (index === -1) {
    return [];
  }

  const picked: EpisodeSummary[] = [];

  for (let distance = 1; picked.length < COUNT && distance < episodes.length; distance += 1) {
    for (const candidate of [episodes[index - distance], episodes[index + distance]]) {
      if (candidate && picked.length < COUNT) {
        picked.push(candidate);
      }
    }
  }

  return picked.toSorted((a, b) => b.episodeNumber - a.episodeNumber);
};

/** Neighbouring episodes, filling the space under the player. */
export const MoreEpisodes = ({ episodeNumber }: { episodeNumber: number }) => {
  const { data: episodes } = useQuery(allEpisodesQuery);
  const shown = episodes ? neighbours(episodes, episodeNumber) : [];

  if (shown.length === 0) {
    return null;
  }

  return (
    <section className="@container mobile:px-4">
      <h2 className="mb-4 text-[15px] font-semibold">More episodes</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 @[720px]:grid-cols-3">
        {shown.map((episode) => (
          <EpisodeCard key={episode.episodeNumber} episode={episode} />
        ))}
      </div>
    </section>
  );
};
