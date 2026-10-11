import { Link, useSearch } from "@tanstack/react-router";
import { Search, Shuffle } from "lucide-react";
import { useRef, useState } from "react";
import { SearchField } from "@/search/SearchField";
import { Wordmark } from "./Wordmark";
import { flushSync } from "react-dom";
import { useCloseSearch } from "@/search/searchState";

const buttonStyles =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center border border-line text-secondary transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-ink";

/**
 * Wordmark, search, random moment — the search box centred on the page, with
 * The outer columns sharing what is left. On phones it folds into an icon so
 * The full wordmark keeps its room, unfolding while typing or showing a query.
 */
export const AppHeader = () => {
  const closeSearch = useCloseSearch();
  const query = useSearch({ strict: false, select: (search) => search.q });
  const [unfolded, setUnfolded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searching = unfolded || Boolean(query);

  // Tapping the icon counts as clicking into the box: it focuses it and, with
  // A query kept from before, brings those results straight back. Unfolded
  // Synchronously so the focus lands inside the tap itself, which is the only
  // Time iOS will raise the keyboard for it.
  const unfold = () => {
    flushSync(() => setUnfolded(true));
    inputRef.current?.focus();
    inputRef.current?.click();
  };

  return (
    <header
      data-searching={searching ? true : undefined}
      className="group/header sticky top-0 z-20 grid h-(--header-h) grid-cols-[minmax(max-content,1fr)_minmax(0,640px)_minmax(max-content,1fr)] items-center gap-7 border-b border-line bg-bg px-6 mobile:flex mobile:gap-3 mobile:px-4"
    >
      <Link
        to="/"
        aria-label="PKA Index home"
        className="shrink-0 justify-self-start mobile:group-data-searching/header:hidden"
      >
        <Wordmark className="h-7 text-[19px] mobile:h-[25px] mobile:text-[17px]" />
      </Link>
      <div className="flex min-w-0 items-center gap-3 mobile:hidden mobile:flex-1 mobile:group-data-searching/header:flex mobile:group-data-searching/header:animate-fade-in">
        <SearchField inputRef={inputRef} onEscape={() => setUnfolded(false)} />
        {/* Phones close the results here; desktops beside the results' sort. */}
        <button
          type="button"
          className="hidden h-10 shrink-0 cursor-pointer items-center border border-line px-3 text-[14px] text-secondary transition-colors duration-150 hover:border-line-strong hover:text-ink mobile:flex"
          onClick={() => {
            setUnfolded(false);

            if (query !== undefined) {
              closeSearch();
            }
          }}
        >
          Close
        </button>
      </div>
      <div className="flex gap-2 justify-self-end mobile:ml-auto mobile:group-data-searching/header:hidden">
        <button type="button" aria-label="Search" className={`${buttonStyles} desktop:hidden`} onClick={unfold}>
          <Search className="size-[17px] stroke-2" />
        </button>
        <Link
          to="/watch/$episodeId"
          params={{ episodeId: "random-event" }}
          aria-label="Random moment"
          title="Play a random moment"
          className={buttonStyles}
        >
          <Shuffle className="size-4 stroke-[1.75]" />
        </Link>
      </div>
    </header>
  );
};
