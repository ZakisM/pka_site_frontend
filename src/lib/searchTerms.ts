// Matching as the server's search does it (catalog/search.rs in the backend):
// Every word of the query, in any case, with curly and straight quotes the
// Same. Phones type curly quotes while most descriptions use straight ones,
// So without this "kyle’s" finds nothing the server found for it.

const foldQuotes = (text: string) => text.replaceAll(/[‘’]/gu, "'").replaceAll(/[“”]/gu, '"');

/** The distinct words of a query, lowercased, with straight quotes. */
export const searchTerms = (query: string) => [
  ...new Set(foldQuotes(query.toLowerCase()).split(/\s+/u).filter(Boolean)),
];

/** Whether `text` contains every one of `terms`. */
export const matchesTerms = (text: string, terms: string[]) => {
  const folded = foldQuotes(text.toLowerCase());

  return terms.every((term) => folded.includes(term));
};

const escapeRegExp = (term: string) => term.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);

/**
 * Finds any of `terms` in text as written, so they can be marked: either
 * Quote style, and the longest term first, so "taylor" wins over "tay".
 */
export const termsPattern = (terms: string[]) => {
  const alternatives = terms
    .toSorted((a, b) => b.length - a.length)
    .map((term) => escapeRegExp(term).replaceAll("'", "['‘’]").replaceAll('"', '["“”]'));

  return new RegExp(`(${alternatives.join("|")})`, "giu");
};
