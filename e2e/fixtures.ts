import { answer, videoIdOf } from "./archive";
import type { Page } from "@playwright/test";
import { test as base } from "@playwright/test";

declare global {
  // The fake player below, for tests to drive playback with.
  var fakePlayer: { scrubTo: (seconds: number) => void } | undefined;
}

/**
 * A stand-in for YouTube's IFrame API, installed before the app loads so its
 * Loader finds `YT` already there: no network, no video, no audio. It answers
 * The player controller the way YouTube does, minus the clock moving.
 */
const installFakeYouTube = () => {
  const CUED = 5;
  const PLAYING = 1;
  const PAUSED = 2;

  interface Events {
    onReady?: (event: { target: unknown; data: number }) => void;
    onStateChange?: (event: { target: unknown; data: number }) => void;
  }

  class FakePlayer {
    private videoId: string;
    private time: number;
    private state: number;
    private readonly events: Events;

    public constructor(
      host: HTMLElement,
      options: { videoId: string; playerVars: { start: number; autoplay: number }; events: Events },
    ) {
      this.videoId = options.videoId;
      this.time = options.playerVars.start;
      this.state = options.playerVars.autoplay ? PLAYING : CUED;
      this.events = options.events;
      host.dataset.fakePlayer = "true";
      // For tests to move playback the way YouTube's own controls would.
      Object.assign(globalThis, { fakePlayer: this });
      setTimeout(() => this.events.onReady?.({ target: this, data: this.state }), 0);
    }

    // As if the viewer dragged YouTube's scrubber and playback carried on.
    public scrubTo(seconds: number) {
      this.time = seconds;
      this.change(PLAYING);
    }

    public cueVideoById(videoId: string, seconds = 0) {
      this.videoId = videoId;
      this.time = seconds;
      this.change(CUED);
    }

    public loadVideoById(videoId: string, seconds = 0) {
      this.videoId = videoId;
      this.time = seconds;
      this.change(PLAYING);
    }

    public playVideo() {
      this.change(PLAYING);
    }

    public pauseVideo() {
      this.change(PAUSED);
    }

    public seekTo(seconds: number) {
      this.time = seconds;
    }

    public getCurrentTime() {
      return this.time;
    }

    public getPlayerState() {
      return this.state;
    }

    public getVideoData() {
      return { video_id: this.videoId };
    }

    // eslint-disable-next-line class-methods-use-this
    public destroy() {
      // Nothing to tear down: there is no iframe.
    }

    private change(state: number) {
      this.state = state;
      setTimeout(() => this.events.onStateChange?.({ target: this, data: state }), 0);
    }
  }

  Object.assign(globalThis, { YT: { Player: FakePlayer } });
};

interface Seed {
  // Seconds watched, per episode number.
  watched?: Record<number, number>;
}

// Saved progress, as the app keeps it: a position per video id, and the
// Episodes most recently opened.
const seedStorage = ({ positions, recent }: { positions: Record<string, number>; recent: number[] }) => {
  for (const [videoId, seconds] of Object.entries(positions)) {
    localStorage.setItem(videoId, JSON.stringify(seconds));
  }

  localStorage.setItem("recent-episodes", JSON.stringify(recent));
};

export const seed = async (page: Page, { watched = {} }: Seed) => {
  const entries = Object.entries(watched).map(([episode, seconds]) => [Number(episode), seconds] as const);

  await page.addInitScript(seedStorage, {
    positions: Object.fromEntries(entries.map(([episode, seconds]) => [videoIdOf(episode), seconds])),
    recent: entries.map(([episode]) => episode),
  });
};

/** Every page gets the fake API and player, and no traffic leaves the machine. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript(installFakeYouTube);
    await page.route("**/api/v1/**", answer);
    await page.route(/^https?:\/\/(?!localhost)/u, async (route) => route.abort());
    await provide(page);
  },
});

/** Which moment the list marks as playing, and whether it can be seen. */
export const playingMoment = async (page: Page) =>
  page.locator("aside").evaluate((aside) => {
    const active = aside.querySelector("[data-active]");
    const list = active?.parentElement;

    if (!active || !list) {
      return { time: null, inView: false };
    }

    const row = active.getBoundingClientRect();
    const box = list.getBoundingClientRect();

    return {
      time: active.querySelector("time")?.textContent ?? null,
      inView: row.top >= box.top && row.bottom <= box.bottom,
    };
  });

export { expect } from "@playwright/test";
export { SOURCE, TARGET, clock, timestampOf, videoIdOf, yearOf } from "./archive";
