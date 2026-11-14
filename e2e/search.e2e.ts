import { SOURCE, TARGET, clock, expect, playingMoment, test } from "./fixtures";
import type { Page } from "@playwright/test";

const searchBox = (page: Page) => page.getByRole("textbox", { name: "Search every episode and moment" });

test("finds moments, grouped by episode", async ({ page }) => {
  await page.goto("/");
  await searchBox(page).fill("hellraiser");

  await expect(page.getByText("2 moments in 2 episodes")).toBeVisible();
  await expect(page.locator("[data-hit]")).toHaveText([
    new RegExp(SOURCE.description, "u"),
    new RegExp(TARGET.description, "u"),
  ]);
});

test("Esc and Close keep the query, and clicking the box brings the results back", async ({ page }) => {
  await page.goto("/");

  const box = searchBox(page);
  const hits = page.locator("[data-hit]");

  await box.fill("hellraiser");
  await expect(hits).toHaveCount(2);

  await box.press("Escape");
  await expect(hits).toHaveCount(0);
  await expect(box).toHaveValue("hellraiser");
  await expect(page).toHaveURL("/");

  await box.click();
  await expect(hits).toHaveCount(2);

  await page.getByRole("button", { name: "Close" }).click();
  await expect(hits).toHaveCount(0);
  await expect(box).toHaveValue("hellraiser");
});

test("a search with no matches says so", async ({ page }) => {
  await page.goto("/");
  await searchBox(page).fill("zzzqqq");

  await expect(page.getByText("Nothing matches “zzzqqq”.")).toBeVisible();
});

test("a moment opens its episode, with that moment in view", async ({ page }) => {
  await page.goto("/");
  await searchBox(page).fill("hellraiser");
  await page.locator("[data-hit]", { hasText: TARGET.description }).click();

  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });
});

test("arrow keys pick a moment and Enter plays it", async ({ page }) => {
  await page.goto("/");

  const box = searchBox(page);

  await box.fill("hellraiser");
  await expect(page.locator("[data-hit]")).toHaveCount(2);
  await box.press("ArrowDown");
  await box.press("ArrowDown");
  await box.press("Enter");

  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });
});

test("over an episode, the results pause it and closing returns to it", async ({ page }) => {
  await page.goto(`/watch/${SOURCE.episode}?timestamp=${SOURCE.index * 300}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(SOURCE.index), inView: true });

  const box = searchBox(page);

  await box.fill("kyle");
  await expect(page.locator("[data-hit]").first()).toBeVisible();
  await box.press("Escape");

  await expect(page).toHaveURL(new RegExp(`/watch/${SOURCE.episode}`, "u"));
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(SOURCE.index), inView: true });
});

// Episodes in the order the results list them, as numbers.
const listedEpisodes = async (page: Page) =>
  page
    .locator("[data-hit]")
    .evaluateAll((hits) => [
      ...new Set(
        hits.map((hit) =>
          Number(hit.closest("section")?.querySelector("header a")?.getAttribute("href")?.split("/").pop()),
        ),
      ),
    ]);

// Scrolls the results to their end until every page has loaded.
const loadEvery = async (page: Page, count: number) => {
  await expect(async () => {
    await page.locator("[data-hit]").last().scrollIntoViewIfNeeded();
    expect(await listedEpisodes(page)).toHaveLength(count);
  }).toPass();
};

const descending = (from: number) => Array.from({ length: from }, (_, index) => from - index);

// "taylor" is in five moments of every episode, and a sixth in TARGET's.
test("results load page by page as they scroll, in the sort chosen", async ({ page }) => {
  await page.goto("/");
  await searchBox(page).fill("taylor");
  await expect(page.getByText("151 moments in 30 episodes")).toBeVisible();

  // Newest first, twelve episodes a page, every page in turn.
  await expect.poll(async () => listedEpisodes(page)).toHaveLength(12);
  await loadEvery(page, 30);
  expect(await listedEpisodes(page)).toEqual(descending(30));

  // Most matches: TARGET's episode first, the rest still newest first.
  await page.getByRole("button", { name: "Most matches" }).click();
  await expect(page.getByRole("button", { name: "Most matches" })).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      const [first] = await listedEpisodes(page);

      return first;
    })
    .toBe(TARGET.episode);
  await loadEvery(page, 30);
  expect(await listedEpisodes(page)).toEqual([TARGET.episode, ...descending(30).filter((n) => n !== TARGET.episode)]);
});

// The results set the tab's title to the query, and the page underneath, kept
// mounted, never sets its own again: closing them has to put it back.
test("closing the results gives the tab back the page's title", async ({ page }) => {
  await page.goto(`/watch/${TARGET.episode}`);
  await expect(page).toHaveTitle(/^12 · /u);

  const title = await page.title();

  await searchBox(page).fill("kyle");
  await expect(page).toHaveTitle("kyle · PKA Index");
  await searchBox(page).press("Escape");
  await expect(page).toHaveTitle(title);

  await page.goto("/");
  await expect(page).toHaveTitle("PKA Index");
  await searchBox(page).fill("kyle");
  await expect(page).toHaveTitle("kyle · PKA Index");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveTitle("PKA Index");
});
