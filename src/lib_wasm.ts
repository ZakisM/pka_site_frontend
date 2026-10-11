export {
  deserialize_episodes,
  deserialize_events,
} from "./lib_wasm_out/lib_wasm";

export type PkaEpisodeSearchResult = {
  episodeNumber: number;
  uploadDate: number;
  title: string;
  lengthSeconds: number;
  // Not sent by the API yet: until it is, thumbnails fall back to a tile.
  videoId?: string;
  eventCount?: number;
};

export type PkaEventSearchResult = {
  episodeNumber: number;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
};
