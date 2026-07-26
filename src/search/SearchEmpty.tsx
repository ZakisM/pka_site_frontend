const actionStyles =
  "cursor-pointer border border-control px-3.5 py-2 text-[13px] text-muted transition-colors duration-150 hover:bg-row-hover hover:text-ink";

interface SearchEmptyProps {
  query: string;
  onClear: () => void;
  onRandomMoment: () => void;
}

export const SearchEmpty = ({
  query,
  onClear,
  onRandomMoment,
}: SearchEmptyProps) => (
  <div className="grow px-4 pt-10 desktop:px-[26px] desktop:pt-14">
    <span aria-hidden className="block h-0.5 w-7 bg-primary" />
    <h3 className="pt-[18px] font-raleway text-[23px] font-bold text-pretty">
      No results for <span className="text-muted">&ldquo;{query}&rdquo;</span>
    </h3>
    {/* The archive is indexed by hand-written moment titles, not transcripts —
        saying so is more useful than "try a different term". */}
    <p className="max-w-[520px] pt-3.5 text-[14px]/[1.6] text-muted">
      Moment titles are written by hand, so try the words that were said — a
      name, a game, a car — rather than a description.
    </p>
    <div className="flex gap-2.5 pt-[22px]">
      <button type="button" className={actionStyles} onClick={onClear}>
        Clear search
      </button>
      <button type="button" className={actionStyles} onClick={onRandomMoment}>
        Random moment
      </button>
    </div>
  </div>
);
