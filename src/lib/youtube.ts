// A direct binding to YouTube's IFrame API.
//
// We hold the real player rather than going through a wrapper library: those
// Return a promise-proxied player whose calls are queued, and a queued
// `cueVideoById` issued while the previous video was playing got silently
// Dropped — the episode never changed. Owning the instance means every call is
// Synchronous and its effect can be verified on the next line.

export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}

export interface YouTubePlayer {
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => PlayerState;
  getVideoData: () => { video_id?: string } | undefined;
  destroy: () => void;
}

export interface PlayerEvent {
  target: YouTubePlayer;
  data: number;
}

export interface YouTubeApi {
  Player: new (
    host: HTMLElement,
    options: {
      videoId?: string;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: PlayerEvent) => void;
      };
    },
  ) => YouTubePlayer;
}

declare global {
  var YT: YouTubeApi | undefined;
  var onYouTubeIframeAPIReady: (() => void) | undefined;
}

const API_SRC = "https://www.youtube.com/iframe_api";

// YouTube's own 16:9 thumbnail (320×180). Linked rather than proxied, which is
// How the embed terms expect thumbnails to be used.
export const thumbnailUrl = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

let apiPromise: Promise<YouTubeApi> | null = null;

// Fetched once per page and shared by every player.
export const loadYouTubeApi = async () => {
  apiPromise ??= new Promise<YouTubeApi>((resolve) => {
    if (globalThis.YT?.Player) {
      resolve(globalThis.YT);

      return;
    }

    // The API calls this global exactly once; chain onto anything already
    // Registered rather than clobbering it.
    const previous = globalThis.onYouTubeIframeAPIReady;

    globalThis.onYouTubeIframeAPIReady = () => {
      previous?.();

      if (globalThis.YT) {
        resolve(globalThis.YT);
      }
    };

    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const script = document.createElement("script");

      script.src = API_SRC;
      script.async = true;
      document.head.append(script);
    }
  });

  return apiPromise;
};

interface EmbedOptions {
  videoId: string;
  startSeconds: number;
  autoplay: boolean;
  onReady: () => void;
  onStateChange: () => void;
}

/** A player in place of `host`, with the only chrome the embed terms allow. */
export const embedPlayer = (api: YouTubeApi, host: HTMLElement, options: EmbedOptions) =>
  new api.Player(host, {
    videoId: options.videoId,
    playerVars: {
      autoplay: options.autoplay ? 1 : 0,
      // YouTube's own controls are the only in-frame chrome: nothing of ours
      // May sit over the iframe, per the embed terms.
      controls: 1,
      playsinline: 1,
      rel: 0,
      start: Math.floor(options.startSeconds),
    },
    events: { onReady: options.onReady, onStateChange: options.onStateChange },
  });
