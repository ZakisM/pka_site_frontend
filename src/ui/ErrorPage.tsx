import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

// Raw fetch/parse failures mean the API returned nothing useful — usually the
// Backend is down and the SPA fallback HTML came back instead of JSON.
const isApiUnreachable = (error: Error) =>
  error.name === "HTTPError" ||
  /JSON\.parse|Unexpected token|Failed to fetch|NetworkError/iu.test(
    error.message,
  );

const actionStyles =
  "cursor-pointer border border-control px-3.5 py-2 text-[13px] text-muted transition-colors duration-150 hover:bg-row-hover hover:text-ink";

export const ErrorPage = ({ error }: { error: Error }) => {
  const unreachable = isApiUnreachable(error);

  return (
    <div className="flex h-full flex-col items-start justify-center px-4 desktop:px-[26px]">
      <span aria-hidden className="block h-0.5 w-7 bg-primary" />
      <h1 className="flex items-center gap-2.5 pt-[18px] font-raleway text-[23px] font-bold">
        <TriangleAlert className="size-5 text-primary" />
        Something went wrong
      </h1>
      <p className="max-w-[520px] pt-3.5 text-[14px]/[1.6] text-muted">
        {unreachable
          ? "We couldn't reach the PKA Index API. It might be down — try again in a moment."
          : error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-2.5 pt-[22px]">
        <button
          type="button"
          className={actionStyles}
          onClick={() => globalThis.location.reload()}
        >
          Try again
        </button>
        <Link
          className={actionStyles}
          to="/watch/$episodeId"
          params={{ episodeId: "latest" }}
        >
          Latest episode
        </Link>
      </div>
      {unreachable && (
        <p className="max-w-[520px] pt-5 text-[12px] text-faint">
          {error.message}
        </p>
      )}
    </div>
  );
};
