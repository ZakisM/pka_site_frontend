import init from './lib_wasm_out/lib_wasm';
import {
    deserialize_episodes,
    deserialize_events,
} from './lib_wasm_out/lib_wasm';
import wasm_bg from './lib_wasm_out/lib_wasm_bg.wasm';

await init(wasm_bg);

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
