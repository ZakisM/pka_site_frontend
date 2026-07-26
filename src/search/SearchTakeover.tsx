import { Activity, useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import { SearchScreen } from "./SearchScreen";
import { playerObscuredAtom } from "@/player/playerState";
import { searchOpenAtom } from "./searchState";

/**
 * A takeover, not a centred dialog: full viewport, hard edges, no backdrop
 * Blur. ShowModal() is kept only for its focus trap and Esc handling, and
 * Activity keeps the screen's state while it is closed.
 */
export const SearchTakeover = () => {
  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom);
  const setPlayerObscured = useSetAtom(playerObscuredAtom);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // The takeover covers the player, so the video should not keep playing
  // Underneath it.
  useEffect(() => {
    setPlayerObscured(searchOpen);
  }, [searchOpen, setPlayerObscured]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setSearchOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (searchOpen && !dialog.open) {
      dialog.showModal();
    } else if (!searchOpen && dialog.open) {
      dialog.close();
    }
  }, [searchOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-x-auto bg-bg p-0 text-ink outline-none backdrop:bg-black/60"
      onClose={() => setSearchOpen(false)}
    >
      <Activity mode={searchOpen ? "visible" : "hidden"}>
        <SearchScreen />
      </Activity>
    </dialog>
  );
};
