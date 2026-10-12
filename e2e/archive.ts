import type { Route } from "@playwright/test";

// A small archive the fake API serves, built so the tests can rely on it:
// Enough moments per episode that the moments list scrolls, and two episodes
// About the same subject, one halfway down its list and one near the end.

const DAY = 86_400;
// Episode 1 a week after this, then weekly: 2024 for the first seventeen.
const FIRST_UPLOAD = Date.UTC(2024, 8, 1) / 1000;
const EPISODES = 30;
const MOMENTS_PER_EPISODE = 40;
const MOMENT_SECONDS = 300;

const TOPICS = [
  "Kyle's prison stories",
  "Taylor reads the sponsors",
  "Woody's garage update",
  "Movie talk",
  "Conspiracy corner",
  "Gaming news",
  "Listener emails",
  "Car crash compilation",
];

// Episode 20 opens on this moment, halfway down its list: far enough that the
// List has scrolled to show it, which is what the router then carried over...
export const SOURCE = { episode: 20, index: 20, description: "Why Hellraiser still terrifies Kyle" };
// ...which is related to this one, near the end of episode 12's.
export const TARGET = { episode: 12, index: 38, description: "Taylor watches Hellraiser for the first time" };

export const timestampOf = (index: number) => index * MOMENT_SECONDS;

// As the app shows them (lib/time formatTimestamp).
export const clock = (index: number) => {
  const seconds = timestampOf(index);
  const hours = Math.floor(seconds / 3600);
  const mmss = `${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return hours > 0 ? `${hours}:${mmss}` : mmss;
};

// Eleven characters, like a real YouTube id: saved positions are keyed by it.
export const videoIdOf = (episode: number) => `vid${String(episode).padStart(8, "0")}`;

const uploadDateOf = (episode: number) => FIRST_UPLOAD + episode * 7 * DAY;

export const yearOf = (episode: number) => new Date(uploadDateOf(episode) * 1000).getUTCFullYear();

const descriptionOf = (episode: number, index: number) => {
  for (const special of [SOURCE, TARGET]) {
    if (special.episode === episode && special.index === index) {
      return special.description;
    }
  }

  return `${TOPICS[(episode * 3 + index) % TOPICS.length]}, part ${index + 1}`;
};

const momentsOf = (episode: number) =>
  Array.from({ length: MOMENTS_PER_EPISODE }, (_, index) => ({
    timestamp: timestampOf(index),
    description: descriptionOf(episode, index),
    lengthSeconds: MOMENT_SECONDS,
    uploadDate: uploadDateOf(episode),
  }));

const summaryOf = (episode: number) => ({
  episodeNumber: episode,
  uploadDate: uploadDateOf(episode),
  title: `The one with guest number ${episode}`,
  lengthSeconds: MOMENTS_PER_EPISODE * MOMENT_SECONDS,
  videoId: videoIdOf(episode),
  eventCount: MOMENTS_PER_EPISODE,
});

// Newest first, as the API lists them.
const NUMBERS = Array.from({ length: EPISODES }, (_, index) => EPISODES - index);

const detailsOf = (episode: number) => ({
  episode: { number: episode, name: `PKA ${episode}`, uploadDate: uploadDateOf(episode) },
  youtubeDetails: {
    videoId: videoIdOf(episode),
    title: summaryOf(episode).title,
    lengthSeconds: MOMENTS_PER_EPISODE * MOMENT_SECONDS,
  },
  events: momentsOf(episode),
});

const GROUPS_PER_PAGE = 12;

// Every word must appear, in any case: the backend's rule.
const matches = (text: string, words: string[]) => words.every((word) => text.toLowerCase().includes(word));

const searchPage = (query: string, sort: string, page: number) => {
  const words = query.toLowerCase().split(/\s+/u).filter(Boolean);
  const groups = NUMBERS.map((episode) => {
    const hits = momentsOf(episode)
      .filter((moment) => matches(moment.description, words))
      .map(({ timestamp, description, lengthSeconds }) => ({ timestamp, description, lengthSeconds }));

    return { episode: summaryOf(episode), matchCount: hits.length, hits };
  }).filter((group) => group.hits.length > 0 || matches(group.episode.title, words));

  if (sort === "matches") {
    groups.sort((a, b) => b.matchCount - a.matchCount);
  }

  const start = page * GROUPS_PER_PAGE;

  return {
    totalMoments: groups.reduce((sum, group) => sum + group.matchCount, 0),
    totalEpisodes: groups.length,
    groups: groups.slice(start, start + GROUPS_PER_PAGE),
    nextPage: start + GROUPS_PER_PAGE < groups.length ? page + 1 : null,
  };
};

const related = (episode: number, timestamp: number) =>
  episode === SOURCE.episode && timestamp === timestampOf(SOURCE.index)
    ? [
        {
          episode: summaryOf(TARGET.episode),
          timestamp: timestampOf(TARGET.index),
          description: TARGET.description,
          lengthSeconds: MOMENT_SECONDS,
          sharedTerms: ["hellraiser"],
        },
      ]
    : [];

const json = async (route: Route, data: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(status === 200 ? { code: 200, data } : data),
  });

const notFound = async (route: Route) => json(route, { message: "That episode isn't in the index.", code: 404 }, 404);

/** Answers the app's API requests from the archive above, as the backend would. */
export const answer = async (route: Route) => {
  const url = new URL(route.request().url());
  const path = url.pathname.replace("/api/v1/", "");
  const episodeId = /^episodes\/(?<id>[^/]+)$/u.exec(path)?.groups?.id;

  if (path === "episodes") {
    return json(
      route,
      NUMBERS.map((episode) => summaryOf(episode)),
    );
  }

  const parameter = (name: string) => url.searchParams.get(name) ?? "";

  if (path === "search") {
    const page = Number(parameter("page") || 0);

    return json(route, searchPage(parameter("q"), parameter("sort") || "newest", page));
  }

  if (path === "events/related") {
    const episode = Number(parameter("episode"));
    const timestamp = Number(parameter("timestamp"));

    return json(route, related(episode, timestamp));
  }

  if (path === "events/random") {
    return json(route, { ...momentsOf(TARGET.episode)[TARGET.index], episodeNumber: TARGET.episode });
  }

  if (episodeId === "latest") {
    return json(route, detailsOf(EPISODES));
  }

  const number = Number(episodeId);

  return NUMBERS.includes(number) ? json(route, detailsOf(number)) : notFound(route);
};
