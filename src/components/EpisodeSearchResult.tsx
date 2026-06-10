import type { PkaEpisodeSearchResult } from "@/lib_wasm";
import { SearchResultCard } from "./SearchResultCard";

interface EpisodeResultProps {
  item: PkaEpisodeSearchResult;
  index: number;
}

export const EpisodeSearchResult = ({ item, index }: EpisodeResultProps) => {
  const formattedLengthSeconds = () => {
    const hours = Math.floor(item.lengthSeconds / 3600);
    const minutes = Math.floor(item.lengthSeconds / 60) % 60;

    return `${hours}h ${minutes}m`;
  };

  return (
    <SearchResultCard
      title={item.title}
      episodeNumber={item.episodeNumber}
      uploadDate={item.uploadDate}
      detail={formattedLengthSeconds()}
      index={index}
      navigateOptions={{
        to: "/watch/$episodeId",
        params: { episodeId: item.episodeNumber.toString() },
      }}
    />
  );
};
