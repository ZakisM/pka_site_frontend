import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Search, Shuffle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SearchField } from "@/search/SearchField";
import { Wordmark } from "./Wordmark";

const buttonStyles =
  "flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 border border-line px-3.5 text-[14px] text-secondary transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-ink mobile:w-10 mobile:px-0";

/**
 * Wordmark, search, random moment. On phones the search box folds into an
 * Icon so the full wordmark keeps its room; it unfolds while typing and while
 * A query is showing.
 */
export const AppHeader = () => {
  const navigate = useNavigate();
  const query = useSearch({ strict: false, select: (search) => search.q });
  const [unfolded, setUnfolded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searching = unfolded || Boolean(query);

  // ⌘K anywhere, or "/" when not already typing, like YouTube.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      const shortcut =
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") ||
        (event.key === "/" && !typing);

      if (shortcut) {
        event.preventDefault();
        setUnfolded(true);

        const focusInput = () => {
          inputRef.current?.focus();
          inputRef.current?.select();
        };

        // Synchronously where the box is already visible, or the keystroke
        // Typed straight after the shortcut is lost; on phones it only exists
        // Once the unfold has rendered.
        focusInput();

        if (document.activeElement !== inputRef.current) {
          requestAnimationFrame(focusInput);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const unfold = () => {
    setUnfolded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <header
      data-searching={searching ? true : undefined}
      className="group/header sticky top-0 z-20 flex h-(--header-h) items-center gap-7 border-b border-line bg-bg px-6 mobile:gap-3 mobile:px-4"
    >
      <Link
        to="/"
        aria-label="PKA Index home"
        className="shrink-0 mobile:group-data-searching/header:hidden"
      >
        <Wordmark className="h-7 text-[19px] mobile:h-[25px] mobile:text-[17px]" />
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-3 desktop:max-w-[600px] mobile:hidden mobile:group-data-searching/header:flex">
        <SearchField inputRef={inputRef} onEscape={() => setUnfolded(false)} />
        <button
          type="button"
          className="hidden h-10 shrink-0 cursor-pointer px-1 text-[14px] text-secondary mobile:block"
          onClick={() => {
            setUnfolded(false);
            navigate({ to: ".", search: (previous) => ({ ...previous, q: undefined }), replace: true });
          }}
        >
          Cancel
        </button>
      </div>
      <div className="ml-auto flex gap-2 mobile:group-data-searching/header:hidden">
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
          <span className="mobile:hidden">Random moment</span>
        </Link>
      </div>
    </header>
  );
};
