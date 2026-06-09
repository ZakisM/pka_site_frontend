import { searchOpenAtom, searchSelectedIndexAtom } from "@/atoms/searchAtoms";
import { useAtom, useSetAtom } from "jotai";
import { useNavigate, useRouter } from "@tanstack/react-router";
import clsx from "clsx";

export interface SearchNavigateOptions {
  to: "/watch/$episodeId";
  params: { episodeId: string };
  search?: { timestamp?: number };
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Manual date formatting because date-fns format() is too slow here.
// Rows mount dozens of times per frame while scrolling a virtualized list.
const formatUploadDate = (uploadDate: number) => {
  const date = new Date(uploadDate * 1000);

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

interface SearchResultCardProps {
  title: string;
  episodeNumber: number;
  uploadDate: number;
  detail: string;
  index: number;
  navigateOptions: SearchNavigateOptions;
}

export const SearchResultCard = ({
  title,
  episodeNumber,
  uploadDate,
  detail,
  index,
  navigateOptions,
}: SearchResultCardProps) => {
  const router = useRouter();
  const navigate = useNavigate();
  const setSearchOpen = useSetAtom(searchOpenAtom);
  const [selectedIndex, setSelectedIndex] = useAtom(searchSelectedIndexAtom);

  const selected = selectedIndex === index;

  // Router-derived href keeps native anchor affordances (new tab, copy link).
  // Plain clicks go through navigate() below.
  // The <Link> component is avoided here: its per-mount hook stack is too heavy for rows that mount continuously while scrolling.
  const { href } = router.buildLocation(navigateOptions);

  return (
    <a
      href={href}
      className={clsx(
        "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5",
        selected && "bg-white/[0.06]",
      )}
      onMouseMove={() => setSelectedIndex(index)}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        event.preventDefault();
        navigate(navigateOptions);
        setSearchOpen(false);
      }}
    >
      <span
        className={clsx(
          "line-clamp-2 text-sm",
          selected ? "text-white" : "text-zinc-300",
        )}
      >
        {title}
      </span>
      <span className="flex items-center gap-2 text-xs text-zinc-500">
        <span
          className={clsx(
            "font-medium tabular-nums",
            selected ? "text-accent" : "text-zinc-600",
          )}
        >
          #{Number(episodeNumber.toFixed(1))}
        </span>
        <span aria-hidden>·</span>
        <time>{formatUploadDate(uploadDate)}</time>
        <span aria-hidden>·</span>
        <span className="tabular-nums">{detail}</span>
      </span>
    </a>
  );
};

