import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { TriangleAlert } from "lucide-react";

interface ErrorPageProps {
  error: Error;
}

// Raw fetch/parse failures mean the API returned nothing useful.
// Usually the backend is down and the SPA fallback HTML came back instead of JSON.
const isApiUnreachable = (error: Error) =>
  error.name === "HTTPError" ||
  /JSON\.parse|Unexpected token|Failed to fetch|NetworkError/iu.test(
    error.message,
  );

export const ErrorPage = ({ error }: ErrorPageProps) => {
  const apiUnreachable = isApiUnreachable(error);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-6">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/25">
        <TriangleAlert className="size-5 text-primary" />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-lg font-semibold text-white">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-zinc-500">
          {apiUnreachable
            ? "We couldn't reach the PKA Index API. It might be down — try again in a moment."
            : error.message || "An unexpected error occurred."}
        </p>
      </div>
      <div className="flex gap-2.5">
        <Button intent="secondary" onClick={() => globalThis.location.reload()}>
          Try again
        </Button>
        <LinkButton to="/watch/$episodeId" params={{ episodeId: "latest" }}>
          Go home
        </LinkButton>
      </div>
      {apiUnreachable && (
        <p className="max-w-md text-center text-xs text-zinc-700">
          {error.message}
        </p>
      )}
    </div>
  );
};
