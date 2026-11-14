import { SOURCE, TARGET, clock, expect, playback, playingMoment, test } from "./fixtures";
import type { Page } from "@playwright/test";

const PLAYING = 1;
const PAUSED = 2;

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
  // Playing, so there is something for the results to pause.
  await page.locator(`aside [data-index='${SOURCE.index}']`).click();
  await expect.poll(async () => playback(page)).toEqual({ state: PLAYING, time: SOURCE.index * 300 });

  const box = searchBox(page);

  await box.fill("kyle");
  await expect(page.locator("[data-hit]").first()).toBeVisible();
  await expect.poll(async () => playback(page)).toEqual({ state: PAUSED, time: SOURCE.index * 300 });
  await box.press("Escape");

  await expect(page).toHaveURL(new RegExp(`/watch/${SOURCE.episode}`, "u"));
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(SOURCE.index), inView: true });
  await expect.poll(async () => playback(page)).toEqual({ state: PLAYING, time: SOURCE.index * 300 });
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

// The router reads an unquoted ?q=2024 as the number 2024: a hand-written or
// shared link like that was dropped, leaving an empty box and no results.
test("a link searching for a number opens its results", async ({ page }) => {
  await page.goto("/?q=2024");

  await expect(searchBox(page)).toHaveValue("2024");
  await expect(page.getByText("Nothing matches “2024”.")).toBeVisible();
});

// A search still settling must not reopen results the viewer just closed.
test("Close straight after typing keeps the results closed", async ({ page }) => {
  await page.goto("/");

  const box = searchBox(page);
  const hits = page.locator("[data-hit]");

  await box.fill("hellraiser");
  await expect(hits).toHaveCount(2);
  await box.press("End");
  await box.pressSequentially(" kyle");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(hits).toHaveCount(0);

  // Well past the moment typing settles.
  await page.waitForTimeout(1000);
  await expect(hits).toHaveCount(0);
  await expect(page).toHaveURL("/");
});

const isSearch = (url: URL) => url.pathname === "/api/v1/search";
const pageOf = (url: string) => new URL(url).searchParams.get("page");
const loadMoreFailed = (page: Page) => page.getByText("Couldn’t load more results.");

// Scrolls to the end of the results, running the fake clock so React Query's
// retries play out, until `done` holds.
const scrollUntil = async (page: Page, done: () => Promise<boolean>) => {
  await expect
    .poll(async () => {
      await page.locator("[data-hit]").last().scrollIntoViewIfNeeded();
      await page.clock.runFor(5000);

      return done();
    })
    .toBe(true);
};

test("a failed next page's message goes while its retry runs", async ({ page }) => {
  await page.clock.install();

  const held = Promise.withResolvers<boolean>();
  let attempts = 0;

  await page.route(isSearch, async (route) => {
    if (pageOf(route.request().url()) !== "1") {
      await route.fallback();

      return;
    }

    attempts += 1;

    // Every automatic try fails; the one Try again asks for waits to answer.
    if (attempts <= 4) {
      await route.fulfill({ status: 503, body: "" });
    } else {
      await held.promise;
      await route.fallback();
    }
  });
  await page.goto("/?q=taylor");
  await scrollUntil(page, async () => loadMoreFailed(page).isVisible());

  await page.getByRole("button", { name: "Try again" }).click();
  await expect(loadMoreFailed(page)).toBeHidden({ timeout: 1000 });
  held.resolve(true);
  await expect.poll(async () => listedEpisodes(page)).toHaveLength(24);
});

// A background refresh can clear a failed next page without loading it. The
// end-of-list marker then came back as a new element nothing watched, so the
// rest of the results never loaded, with no Try again left to ask for them.
test("results go on loading after a background refresh clears a failed page", async ({ page }) => {
  await page.clock.install();

  let failing = true;

  await page.route(isSearch, async (route) => {
    await (failing && pageOf(route.request().url()) === "1"
      ? route.fulfill({ status: 503, body: "" })
      : route.fallback());
  });
  await page.goto("/?q=taylor");
  await scrollUntil(page, async () => loadMoreFailed(page).isVisible());

  // The results go stale, and the tab is looked at again.
  failing = false;
  await page.clock.fastForward("02:00");
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange", { bubbles: true })));
  await expect(loadMoreFailed(page)).toBeHidden();

  await scrollUntil(page, async () => {
    const listed = await listedEpisodes(page);

    return listed.length === 24;
  });
});

// Each episode's thumbnail repeats the link of its title beside it, and was
// named only by the running time on it ("3:20:00, link").
test("every link in the results is named by what it opens", async ({ page }) => {
  await page.goto("/");
  await searchBox(page).fill("hellraiser");
  await expect(page.locator("[data-hit]")).toHaveCount(2);

  await expect(page.getByRole("link", { name: /^[\d:\s]+$/u })).toHaveCount(0);
});
