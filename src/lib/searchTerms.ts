// The words of a query, as search and the moments filter match them.
export const searchTerms = (query: string) => query.toLowerCase().split(/\s+/u).filter(Boolean);
