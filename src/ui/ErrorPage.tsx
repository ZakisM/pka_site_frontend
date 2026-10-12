import { HTTPError } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

// The API answered, and the thing asked for doesn't exist: an old or mistyped
// Episode link, not an outage.
const isNotFound = (error: Error) => error instanceof HTTPError && error.response.status === 404;

// Raw fetch/parse failures mean the API returned nothing useful — usually the
// Backend is down and the SPA fallback HTML came back instead of JSON.
const isApiUnreachable = (error: Error) =>
  error instanceof HTTPError || /JSON\.parse|Unexpected token|Failed to fetch|NetworkError/iu.test(error.message);

const actionStyles =
  "cursor-pointer border border-line px-3.5 py-2 text-[13px] text-muted transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-ink";

// Router errors are typed unknown: anything can be thrown.
export const ErrorPage = ({ error: thrown }: { error: unknown }) => {
  const error = thrown instanceof Error ? thrown : new Error(String(thrown));

  if (isNotFound(error)) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--header-h))] flex-col items-start justify-center px-4 desktop:px-[26px]">
        <span aria-hidden className="block h-0.5 w-7 bg-primary" />
        <h1 className="pt-[18px] text-[23px] font-semibold">That episode isn’t in the index</h1>
        <p className="max-w-[520px] pt-3.5 text-[14px]/[1.6] text-muted">
          The link may be mistyped, or point to an episode that has been removed.
        </p>
        <div className="flex gap-2.5 pt-[22px]">
          <Link className={actionStyles} to="/">
            All episodes
          </Link>
        </div>
      </div>
    );
  }

  const unreachable = isApiUnreachable(error);

  return (
    <div className="flex min-h-[calc(100dvh-var(--header-h))] flex-col items-start justify-center px-4 desktop:px-[26px]">
      <span aria-hidden className="block h-0.5 w-7 bg-primary" />
      <h1 className="flex items-center gap-2.5 pt-[18px] text-[23px] font-semibold">
        <TriangleAlert className="size-5 text-primary" />
        Something went wrong
      </h1>
      <p className="max-w-[520px] pt-3.5 text-[14px]/[1.6] text-muted">
        {unreachable
          ? "We couldn't reach the PKA Index API. It might be down — try again in a moment."
          : error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-2.5 pt-[22px]">
        <button type="button" className={actionStyles} onClick={() => globalThis.location.reload()}>
          Try again
        </button>
        <Link className={actionStyles} to="/">
          All episodes
        </Link>
      </div>
      {unreachable && <p className="max-w-[520px] pt-5 text-[12px] text-dim">{error.message}</p>}
    </div>
  );
};
