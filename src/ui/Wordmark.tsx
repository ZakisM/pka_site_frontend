// Logo direction 4b, "Knockout block": INDEX reversed out of a solid red slab
// With PKA butted against it in the same weight. Set in markup rather than
// Loaded from the brand SVGs — those set their type in Raleway, which an <img>
// Never loads, so they would render as a bare slab.
//
// Rules from pka_index_brand_assets/README.md: no rounding, no shadow, no
// Gradient, no gap between PKA and the slab, never recolour the slab. The full
// Lockup is shown at every size; phones fold the search box away instead.

export const Wordmark = ({ className = "" }: { className?: string }) => (
  <span className={`flex select-none items-stretch font-raleway font-black uppercase ${className}`}>
    <span className="flex items-center pr-[0.06em] tracking-[0.02em] text-ink">PKA</span>
    <span className="flex items-center bg-primary px-[0.22em] tracking-[0.02em] text-white">Index</span>
  </span>
);
