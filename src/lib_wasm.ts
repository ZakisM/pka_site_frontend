export {
  deserialize_episodes,
  deserialize_events,
} from "./lib_wasm_out/lib_wasm";

export type PkaEpisodeSearchResult = {
  episodeNumber: number;
  uploadDate: number;
  title: string;
  lengthSeconds: number;
};

export type PkaEventSearchResult = {
  episodeNumber: number;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
};
