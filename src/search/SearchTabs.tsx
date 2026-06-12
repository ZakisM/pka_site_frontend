import { SEARCH_TABS, type SearchTab } from "./searchState";

const LABELS: Record<SearchTab, string> = {
  moments: "Moments",
  episodes: "Episodes",
};

interface SearchTabsProps {
  tab: SearchTab;
  counts: Record<SearchTab, number>;
  onSelect: (tab: SearchTab) => void;
}

export const SearchTabs = ({ tab, counts, onSelect }: SearchTabsProps) => (
  <div className="flex shrink-0 items-end justify-between border-b border-hairline px-3.5 pt-3 desktop:px-[26px] desktop:pt-3.5">
    <div className="flex gap-5 desktop:gap-6">
      {SEARCH_TABS.map((name) => {
        const active = tab === name;

        return (
          <button
            key={name}
            type="button"
            className={`relative flex cursor-pointer items-center gap-2 pb-3 font-raleway text-[15px] font-bold tracking-[0.01em] ${active ? "text-ink" : "text-dimmer"}`}
            onClick={() => onSelect(name)}
          >
            {LABELS[name]}
            <span
              className={`text-[12px] font-medium tabular-nums ${active ? "text-primary" : "text-fainter"}`}
            >
              {counts[name].toLocaleString()}
            </span>
            {/* Sits on the row's own bottom hairline. */}
            {active && (
              <span
                aria-hidden
                className="absolute right-0 -bottom-px left-0 h-0.5 bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  </div>
);
