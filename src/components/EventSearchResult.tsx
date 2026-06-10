import type { PkaEventSearchResult } from "@/lib_wasm";
import { SearchResultCard } from "./SearchResultCard";

interface EventResultProps {
  item: PkaEventSearchResult;
  index: number;
}

const formatLength = (lengthSeconds: number) => {
  const minutes = Math.floor(lengthSeconds / 60);
  const seconds = lengthSeconds % 60;

  return `${minutes}m ${seconds}s`;
};

export const EventSearchResult = ({ item, index }: EventResultProps) =>
  (
    <SearchResultCard
      title={item.description}
      episodeNumber={item.episodeNumber}
      uploadDate={item.uploadDate}
      detail={formatLength(item.lengthSeconds)}
      index={index}
      navigateOptions={{
        to: "/watch/$episodeId",
        params: { episodeId: item.episodeNumber.toString() },
        search: { timestamp: item.timestamp },
      }}
    />
  )
;
