/** The API answered with an error status; ErrorPage reads its response. */
export class HTTPError extends Error {
  public readonly response: Response;

  public constructor(response: Response) {
    super(`Request failed with status ${response.status}`);
    this.name = "HTTPError";
    this.response = response;
  }
}

// Long enough for a slow connection to get the first byte of the episode list;
// A request with no answer by then has stalled, and React Query retries it.
const RESPONSE_TIMEOUT_MS = 30_000;

// Every response is `{ data }`; anything else (the SPA's HTML coming back
// While the backend is down) is an error rather than a bad cast.
const hasData = (payload: unknown): payload is { data: unknown } =>
  typeof payload === "object" && payload !== null && "data" in payload;

interface GetOptions {
  signal?: AbortSignal;
  searchParams?: Record<string, string | number>;
}

/**
 * A GET against the API, unwrapping its `{ data }` envelope. Plain fetch:
 * React Query already retries failures, so this needs nothing more than a
 * Timeout on the response arriving (the body may then take as long as it needs).
 */
const get = async <T>(path: string, { signal, searchParams }: GetOptions = {}): Promise<T> => {
  const query = searchParams
    ? `?${new URLSearchParams(Object.entries(searchParams).map(([key, value]) => [key, String(value)])).toString()}`
    : "";
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  const timeout = setTimeout(
    () => controller.abort(new DOMException("The API took too long to answer", "TimeoutError")),
    RESPONSE_TIMEOUT_MS,
  );

  signal?.addEventListener("abort", abort, { once: true });

  try {
    const response = await fetch(`/api/v1/${path}${query}`, { signal: controller.signal });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new HTTPError(response);
    }

    const payload: unknown = await response.json();

    if (!hasData(payload)) {
      throw new Error("Unexpected API response");
    }

    // The API is ours and typed here; checking every field of every response
    // Would cost more than it could catch.
    // eslint-disable-next-line typescript/no-unsafe-type-assertion
    return payload.data as T;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
};

export interface PkaEpisode {
  number: number;
  name: string;
  youtubeLink: string;
  uploadDate: number;
}

export interface PkaYoutubeDetails {
  videoId: string;
  episodeNumber: number;
  title: string;
  lengthSeconds: number;
}

// Exactly what GET /episodes/:id returns per event — no id and no episode
// Number, so callers must supply the episode from their own context and key
// Rows by timestamp.
export interface PkaEvent {
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
}

export interface PkaEpisodeWithAll {
  episode: PkaEpisode;
  youtubeDetails: PkaYoutubeDetails;
  events: PkaEvent[];
}

export interface RandomPkaEvent {
  episodeNumber: number;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  uploadDate: number;
}

export const fetchEpisodeById = async (episodeId: string) => get<PkaEpisodeWithAll>(`episodes/${episodeId}`);

export const fetchRandomEvent = async () => get<RandomPkaEvent>("events/random");

// An episode as lists and search results show it.
export interface EpisodeSummary {
  episodeNumber: number;
  uploadDate: number;
  title: string;
  lengthSeconds: number;
  videoId: string;
  eventCount: number;
}

export interface SearchHit {
  timestamp: number;
  description: string;
  lengthSeconds: number;
}

// One episode in the results: its first few matching moments, in order, and
// How many matched altogether.
export interface SearchGroup {
  episode: EpisodeSummary;
  matchCount: number;
  hits: SearchHit[];
}

export interface SearchPage {
  totalMoments: number;
  totalEpisodes: number;
  groups: SearchGroup[];
  nextPage: number | null;
}

export type SearchSort = "newest" | "matches";

// A moment in another episode about the same thing, with the words they share.
export interface RelatedMoment {
  episode: EpisodeSummary;
  timestamp: number;
  description: string;
  lengthSeconds: number;
  sharedTerms: string[];
}

export const fetchRelated = async (signal: AbortSignal, episodeNumber: number, timestamp: number) =>
  get<RelatedMoment[]>("events/related", { signal, searchParams: { episode: episodeNumber, timestamp } });

// Every episode, newest first.
export const fetchEpisodes = async (signal: AbortSignal) => get<EpisodeSummary[]>("episodes", { signal });

// Searching and grouping happen on the server, which returns one page of
// Episode groups at a time — the device only ever handles a page.
export const searchPage = async ({
  signal,
  query,
  sort,
  page,
}: {
  signal: AbortSignal;
  query: string;
  sort: SearchSort;
  page: number;
}) => get<SearchPage>("search", { signal, searchParams: { q: query, sort, page } });
