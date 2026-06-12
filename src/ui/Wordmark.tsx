// Logo direction 4b, "Knockout block": INDEX reversed out of a solid red slab
// With PKA butted against it in the same weight. Set in markup rather than
// Loaded from the brand SVGs — those set their type in Raleway, which an <img>
// Never loads, so they would render as a bare slab.
//
// Rules from pka_index_brand_assets/README.md: no rounding, no shadow, no
// Gradient, no gap between PKA and the slab, never recolour the slab. The
// Lockup has a 120px minimum width; below that use the square IX mark.

interface WordmarkProps {
  className?: string;
}

export const Wordmark = ({ className = "" }: WordmarkProps) => (
  <span
    className={`flex select-none items-stretch font-raleway font-black uppercase ${className}`}
  >
    <span className="flex items-center pr-[0.06em] tracking-[0.02em] text-ink">
      PKA
    </span>
    <span className="flex items-center bg-primary px-[0.22em] tracking-[0.02em] text-white">
      Index
    </span>
  </span>
);

// The lockup cropped to IX, for anywhere too tight for 120px of lockup.
export const WordmarkIcon = ({ className = "" }: WordmarkProps) => (
  <span
    aria-hidden
    className={`flex select-none items-center justify-center bg-primary font-raleway font-black uppercase text-white ${className}`}
  >
    IX
  </span>
);
