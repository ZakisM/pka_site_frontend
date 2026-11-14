import { describe, expect, test } from "vite-plus/test";
import { formatDuration } from "./time";

describe("formatDuration", () => {
  test("seconds, minutes, then hours and minutes", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(7 * 60)).toBe("7m");
    expect(formatDuration(2 * 3600 + 10 * 60)).toBe("2h 10m");
  });

  // Minutes round, so the last half minute before the hour read "60m".
  test("never says 60m", () => {
    expect(formatDuration(3569)).toBe("59m");
    expect(formatDuration(3570)).toBe("1h 0m");
    expect(formatDuration(3599)).toBe("1h 0m");
    expect(formatDuration(3600)).toBe("1h 0m");
  });
});
