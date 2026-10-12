import { describe, expect, test } from "bun:test";
import { matchesTerms, searchTerms, termsPattern } from "./searchTerms";

// The first three mirror the backend's own matcher tests (catalog/search.rs),
// So the moments filter finds exactly what search found.
describe("matchesTerms", () => {
  test("every word must match, in any case", () => {
    const terms = searchTerms("KYLE taylor");

    expect(matchesTerms("Taylor and Kyle argue", terms)).toBe(true);
    expect(matchesTerms("Taylor reads the sponsors", terms)).toBe(false);
  });

  test("repeated and overlapping words still match", () => {
    expect(matchesTerms("Kyle stories", searchTerms("kyle kyle"))).toBe(true);
    expect(matchesTerms("Taylor's bible story", searchTerms("tay taylor"))).toBe(true);
  });

  test("curly and straight apostrophes match each other", () => {
    expect(matchesTerms("Kyle's new bike", searchTerms("kyle’s"))).toBe(true);
    expect(matchesTerms("Kyle’s new bike", searchTerms("kyle's"))).toBe(true);
    expect(matchesTerms("Kyles new bike", searchTerms("kyle’s"))).toBe(false);
  });

  test("curly and straight double quotes match each other", () => {
    expect(matchesTerms("The “cool guy” bit", searchTerms('"cool'))).toBe(true);
    expect(matchesTerms('The "cool guy" bit', searchTerms("“cool"))).toBe(true);
  });
});

// What a highlight would mark: split with a capture group alternates plain
// Text and matches.
const marked = (text: string, query: string) =>
  text.split(termsPattern(searchTerms(query))).filter((_, index) => index % 2 === 1);

describe("termsPattern", () => {
  test("marks a word written with either apostrophe", () => {
    expect(marked("Kyle's new bike", "kyle’s")).toEqual(["Kyle's"]);
    expect(marked("Kyle’s new bike", "kyle's")).toEqual(["Kyle’s"]);
  });

  test("marks the longer of two overlapping words", () => {
    expect(marked("Taylor's bible story", "tay taylor")).toEqual(["Taylor"]);
  });

  test("treats the query as text, not a pattern", () => {
    expect(marked("What (really) happened?", "(really) happened?")).toEqual(["(really)", "happened?"]);
  });
});
