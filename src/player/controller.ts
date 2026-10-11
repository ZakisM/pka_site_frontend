import { type Pending, pendingAt, settle } from "./settle";
import { PlayerState, type YouTubePlayer, loadYouTubeApi } from "@/lib/youtube";
import { positionOf, savePosition } from "./watchHistory";
import { createStore } from "@/lib/store";
import { spend } from "@/lib/intents";

/**
 * The one owner of the YouTube iframe. Whatever wants the player to do
 * Something asks here, and nothing else holds it.
 *
 * YouTube's API is fire-and-forget: commands cross into the iframe, its
 * Getters report a cache that lags, startSeconds is not always honoured, and a
 * Seek sent while a video loads can be lost. So no command is trusted to have
 * Worked. This keeps what *should* be on screen — a video and, until it has
 * Been seen playing there, a position — and a poll compares the player with
 * It and corrects it for as long as it takes. Nothing ever falls back to 0.
 */

export interface StartRequest {
  // Acted on once (see lib/intents): re-renders, Back and reloads resend it.
  id: string;
  seconds: number;
  // Play straight away (a click), or wait for the viewer (a link opened cold).
  play: boolean;
}

const POLL_MS = 250;
const SWITCH_RETRY_MS = 3000;
const SWITCH_RETRIES = 2;

const timers: {
  poll?: ReturnType<typeof setInterval>;
  reset?: ReturnType<typeof setTimeout>;
} = {};

let host: HTMLElement | null = null;
let creatingIn: HTMLElement | null = null;
let yt: YouTubePlayer | null = null;
let ready = false;

// What should be on screen.
let videoId: string | null = null;
let wantPlay = false;
let pending: Pending | null = null;
// The video last sent to the iframe: tells a switch from a seek.
let sent: { videoId: string; at: number; retries: number; seen: boolean } | null = null;
// Asked for before the iframe could take commands, so sent once it can.
let unsent = false;

// The search results cover the page: nothing plays under them, and what they
// Paused resumes when they close.
let obscured = false;
let resumeOnReveal = false;

export const playerReady = createStore(false);

const now = () => Date.now();

const isPlaying = (state: number) => state === PlayerState.PLAYING || state === PlayerState.BUFFERING;

const publish = (seconds: number) => {
  // Once a second is plenty, for the UI and for the saved position.
  if (videoId && Math.floor(seconds) !== Math.floor(positionOf(videoId))) {
    savePosition(videoId, seconds);
  }
};

// Load rather than cue when it should play: a load is never dropped, and if
// It starts from 0 anyway the poll moves it.
const switchVideo = (player: YouTubePlayer, id: string, seconds: number) => {
  if (wantPlay && !obscured) {
    player.loadVideoById(id, Math.floor(seconds));
  } else {
    player.cueVideoById(id, Math.floor(seconds));
  }
};

const send = () => {
  if (!yt || !ready || !videoId) {
    unsent = true;

    return;
  }

  unsent = false;
  const seconds = pending?.seconds ?? positionOf(videoId);
  // Seen, then left: the viewer picked another video inside YouTube's player.
  const left = sent?.seen === true && yt.getVideoData()?.video_id !== videoId;

  if (sent?.videoId === videoId && !left) {
    yt.seekTo(seconds, true);

    if (wantPlay && !obscured) {
      yt.playVideo();
    }
  } else {
    sent = { videoId, at: now(), retries: 0, seen: false };
    switchVideo(yt, videoId, seconds);
  }

  if (pending) {
    pending.seekedAt = now();
  }

  resumeOnReveal = wantPlay && obscured;
};

// Points the player at `seconds` of the current video, and keeps it there
// Until it is seen playing from it.
const aim = (seconds: number, play: boolean) => {
  pending = pendingAt(seconds, now());
  wantPlay = play;
  publish(seconds);
  send();
};

const poll = () => {
  if (!yt || !ready || !videoId) {
    return;
  }

  const state = yt.getPlayerState();

  // Checked on every poll, so it holds whatever order the calls landed in.
  if (obscured && isPlaying(state)) {
    yt.pauseVideo();
    resumeOnReveal = true;
  }

  const showing = yt.getVideoData()?.video_id;

  // Mid-switch the clock is the old video's and means nothing here. The old
  // Video still up long after a switch means it was lost: resend it. Once the
  // New one has been seen, another video is the viewer's pick inside YouTube.
  if (showing !== videoId) {
    if (showing && sent && !sent.seen && now() - sent.at > SWITCH_RETRY_MS && sent.retries < SWITCH_RETRIES) {
      sent = { ...sent, at: now(), retries: sent.retries + 1 };
      switchVideo(yt, videoId, pending?.seconds ?? positionOf(videoId));
    }

    return;
  }

  if (sent) {
    sent.seen = true;
  }

  const time = yt.getCurrentTime();

  if (pending) {
    const verdict = settle(pending, { state, time, at: now() });

    if (verdict === "seek") {
      yt.seekTo(pending.seconds, true);
      pending.seekedAt = now();
    } else if (verdict !== "wait") {
      pending = null;
    }
  }

  // While a position is pending the UI shows it, not the stale clock.
  publish(pending ? pending.seconds : time);
};

const onReady = () => {
  ready = true;
  playerReady.set(true);
  clearInterval(timers.poll);
  timers.poll = setInterval(poll, POLL_MS);

  if (unsent) {
    send();
  } else if (resumeOnReveal && !obscured) {
    // Revealed before the iframe could take the command.
    resumeOnReveal = false;
    yt?.playVideo();
  }
};

const create = () => {
  const element = host;

  if (!element || !videoId || yt || creatingIn === element) {
    return;
  }

  creatingIn = element;

  loadYouTubeApi().then((YT) => {
    if (creatingIn !== element || host !== element || !videoId) {
      return;
    }

    creatingIn = null;
    sent = { videoId, at: now(), retries: 0, seen: false };
    unsent = false;
    resumeOnReveal = wantPlay && obscured;

    yt = new YT.Player(element, {
      // Whatever is wanted by now, not when creation began: a navigation can
      // Land while the API script loads.
      videoId,
      playerVars: {
        autoplay: wantPlay && !obscured ? 1 : 0,
        // YouTube's own controls are the only in-frame chrome: nothing of
        // Ours may sit over the iframe, per the embed terms.
        controls: 1,
        playsinline: 1,
        rel: 0,
        start: Math.floor(pending?.seconds ?? positionOf(videoId)),
      },
      events: { onReady, onStateChange: poll },
    });
  });
};

const destroy = () => {
  clearInterval(timers.poll);
  yt?.destroy();
  yt = null;
  ready = false;
  creatingIn = null;
  playerReady.set(false);
};

const reset = () => {
  destroy();
  host = null;
  videoId = null;
  wantPlay = false;
  pending = null;
  sent = null;
  unsent = false;
  resumeOnReveal = false;
};

export const player = {
  /**
   * The watch screen shows `id`, and `start` (if any) asks for a position in
   * It. A new video resumes where it was left unless `start` is new; the
   * Same video only moves for a new `start`.
   */
  request: (id: string, start: StartRequest | undefined) => {
    const fresh = start !== undefined && spend(start.id);

    if (id !== videoId) {
      videoId = id;
      // Switching videos inside a running player keeps it playing.
      aim(fresh ? start.seconds : positionOf(id), fresh ? start.play : yt !== null);
      create();
    } else if (fresh) {
      aim(start.seconds, start.play);
    }
  },

  // A moment in the video on screen: the moments rail.
  seek: (seconds: number) => {
    if (videoId) {
      aim(seconds, true);
    }
  },

  setObscured: (next: boolean) => {
    if (obscured === next) {
      return;
    }

    obscured = next;

    if (!yt || !ready) {
      return;
    }

    if (next && (isPlaying(yt.getPlayerState()) || (pending && wantPlay))) {
      yt.pauseVideo();
      resumeOnReveal = true;
    } else if (!next && resumeOnReveal) {
      resumeOnReveal = false;
      yt.playVideo();
    }
  },

  // Puts the iframe in `element`; the returned function takes it out a tick
  // Later, so an immediate re-attach to the same element (React re-running
  // Effects in development) keeps the player and its requests.
  attach: (element: HTMLElement) => {
    clearTimeout(timers.reset);

    if (element !== host) {
      destroy();
      host = element;
    }

    create();

    return () => {
      timers.reset = setTimeout(reset, 0);
    };
  },
};
