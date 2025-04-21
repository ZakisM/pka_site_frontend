import {
  deserialize_episodes,
  deserialize_events,
} from './lib_wasm_out/lib_wasm';

type PkaEpisodeSearchResult = {
  episodeNumber: number;
  uploadDate: number;
  title: string;
  lengthSeconds: number;
};

type PkaEventSearchResult = {
  episodeNumber: number;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
};

export {
  deserialize_episodes,
  deserialize_events,
  type PkaEpisodeSearchResult,
  type PkaEventSearchResult,
};
