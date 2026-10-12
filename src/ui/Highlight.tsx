import { termsPattern } from "@/lib/searchTerms";

// Splits on the query's words, so every term the search matched is marked.
export const Highlight = ({ text, terms }: { text: string; terms: string[] }) => {
  if (terms.length === 0) {
    return text;
  }

  const pattern = termsPattern(terms);

  // Split with a capture group alternates plain, match, plain, match… Each
  // Match is keyed by where it starts in the text, which is what it is.
  let offset = 0;

  return text.split(pattern).map((part, index) => {
    const start = offset;

    offset += part.length;

    return index % 2 === 1 ? <mark key={start}>{part}</mark> : part;
  });
};
