// Splits on the query's words, so every term the search matched is marked.
const escapeRegExp = (term: string) => term.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);

export const searchTerms = (query: string) => query.toLowerCase().split(/\s+/u).filter(Boolean);

export const Highlight = ({ text, terms }: { text: string; terms: string[] }) => {
  if (terms.length === 0) {
    return text;
  }

  const pattern = new RegExp(`(${terms.map((term) => escapeRegExp(term)).join("|")})`, "giu");

  // Split with a capture group alternates plain, match, plain, match…
  return text.split(pattern).map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part));
};
