import { SOURCE, TARGET, clock, expect, playback, playingMoment, seed, test, timestampOf, videoIdOf } from "./fixtures";

test("a shared link starts at its moment", async ({ page }) => {
  await page.goto(`/watch/${TARGET.episode}?timestamp=${timestampOf(TARGET.index)}`);

  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });
  // The player itself is there, cued rather than playing: the list alone shows
  // the position asked for, whatever the player did with it.
  await expect.poll(async () => playback(page)).toEqual({ state: 5, time: timestampOf(TARGET.index) });
});

// Resize observers report every element once when first observed. Here that
// first report is withheld, as if it had already arrived before the router's
// scroll restore: which comes first is a race the test can't otherwise fix.
const withholdFirstResizeReports = () => {
  const Native = globalThis.ResizeObserver;

  globalThis.ResizeObserver = class extends Native {
    public constructor(report: ResizeObserverCallback) {
      const reported = new WeakSet<Element>();

      super((entries, observer) => {
        const later = entries.filter((entry) => reported.has(entry.target));

        for (const entry of entries) {
          reported.add(entry.target);
        }

        if (later.length > 0) {
          report(later, observer);
        }
      });
    }
  };
};

// The router restores the scroll of anything that scrolled, and carried the
// last episode's list position onto the next episode's list. That hid the
// moment when the list opened on it straight away (an episode already watched
// up to that point) and nothing scrolled the list again afterwards.
test("a moment in another episode opens with that moment in view", async ({ page }) => {
  await page.addInitScript(withholdFirstResizeReports);
  await seed(page, { watched: { [TARGET.episode]: timestampOf(TARGET.index) } });
  await page.goto(`/watch/${SOURCE.episode}?timestamp=${timestampOf(SOURCE.index)}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(SOURCE.index), inView: true });

  const related = page.locator("section", { has: page.getByRole("heading", { name: "In other episodes" }) });

  await related.getByRole("button", { name: new RegExp(TARGET.description, "u") }).click();

  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });

  // And Back returns to the first episode, its moment still in view.
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/watch/${SOURCE.episode}`, "u"));
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(SOURCE.index), inView: true });
});

test("clearing the filter brings the playing moment back into view", async ({ page }) => {
  await page.goto(`/watch/${TARGET.episode}?timestamp=${timestampOf(TARGET.index)}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });

  const filter = page.getByRole("textbox", { name: "Filter moments" });
  const rows = page.locator("aside [data-index]");

  await filter.fill("garage");
  await expect(rows).not.toHaveCount(40);
  await expect(rows.first()).toContainText("garage");

  await page.getByRole("button", { name: "Clear filter" }).click();
  await expect(rows).toHaveCount(40);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });
});

test("clicking a moment plays from it", async ({ page }) => {
  await page.goto(`/watch/${TARGET.episode}`);

  await page.locator("aside [data-index='5']").click();

  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(5), inView: true });
  await expect.poll(async () => playback(page)).toEqual({ state: 1, time: timestampOf(5) });
});

// Each tab saved its own position every second and took the other's from
// storage, so both lists flicked between the two tabs' moments.
test("another tab playing the same episode leaves this one's moment alone", async ({ page, context }) => {
  await page.goto(`/watch/${TARGET.episode}`);
  await page.locator("aside [data-index='5']").click();
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(5), inView: true });

  const other = await context.newPage();

  await other.goto(`/watch/${TARGET.episode}`);
  await other.locator("aside [data-index='10']").click();
  await expect.poll(async () => playingMoment(other)).toEqual({ time: clock(10), inView: true });

  // Every moment either list marks as playing over a couple of seconds.
  const marked = async (tab: typeof page) =>
    tab.evaluate(
      async () =>
        new Promise<string[]>((resolve) => {
          const seen = new Set<string>();
          const sample = setInterval(() => {
            seen.add(document.querySelector("aside [data-active] time")?.textContent ?? "");
          }, 50);

          setTimeout(() => {
            clearInterval(sample);
            resolve([...seen]);
          }, 2000);
        }),
    );

  const [here, there] = await Promise.all([marked(page), marked(other)]);

  expect(here).toEqual([clock(5)]);
  expect(there).toEqual([clock(10)]);
});

// A search hit asks the watch page to start at its moment once. Reloading the
// page, or coming Back to it, keeps the same history entry and its request:
// acting on it again would throw the viewer back to the hit's moment.
test("a moment opened from search is played once: a reload or Back resumes instead", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Search every episode and moment" }).fill("hellraiser");
  await page.locator("[data-hit]", { hasText: TARGET.description }).click();
  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });

  // The viewer moves on to another moment, and the position is saved.
  await page.locator("aside [data-index='5']").click();
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(5), inView: true });
  await expect
    .poll(async () => page.evaluate((id) => localStorage.getItem(id), videoIdOf(TARGET.episode)))
    .toBe(String(timestampOf(5)));

  const settlesOn = async (index: number) => {
    await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(index), inView: true });
    // A request acted on again would land a moment after the page settles.
    await page.waitForTimeout(1000);
    expect(await playingMoment(page)).toEqual({ time: clock(index), inView: true });
  };

  await page.reload();
  await settlesOn(5);

  await page.getByRole("link", { name: "About & privacy" }).click();
  await page.goBack();
  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await settlesOn(5);
});

test("the header's random moment opens its episode at that moment", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Random moment" }).click();

  // The fake API's random moment is TARGET; the URL is the episode's own.
  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });
});

// A moment counted as reached only once the player was seen playing there, so
// pausing first left the request open: the controller went on seeking back to
// it, and closing search resumed a video the viewer had paused.
test("a moment the viewer pauses on at once stays paused through a search", async ({ page }) => {
  await page.goto(`/watch/${TARGET.episode}`);
  await expect(page.locator("aside [data-index='5']")).toBeVisible();

  // The click and the pause land together, before the player is seen playing.
  await page.evaluate(() => {
    document.querySelector<HTMLElement>("aside [data-index='5']")?.click();
    globalThis.fakePlayer?.pauseVideo();
  });
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(5), inView: true });
  // Long enough for the player's polls to see it paused at the moment.
  await page.waitForTimeout(1000);

  const box = page.getByRole("textbox", { name: "Search every episode and moment" });

  await box.fill("kyle");
  await expect(page.locator("[data-hit]").first()).toBeVisible();
  await box.press("Escape");
  await expect(page.locator("[data-hit]")).toHaveCount(0);
  await page.waitForTimeout(1000);

  const PAUSED = 2;

  expect(await page.evaluate(() => globalThis.fakePlayer?.getPlayerState())).toBe(PAUSED);
});

test.describe("without YouTube's script", () => {
  // The real IFrame API script, blocked like every request leaving the machine.
  test.use({ fakeYouTube: false });

  // The script's promise never settled when it failed, so the player spun for
  // good and nothing tried again until a reload.
  test("a player whose script can't load says so, and tries again", async ({ page }) => {
    let requests = 0;

    page.on("request", (request) => {
      if (request.url() === "https://www.youtube.com/iframe_api") {
        requests += 1;
      }
    });
    await page.goto(`/watch/${TARGET.episode}`);

    await expect(page.getByText("YouTube’s player didn’t load.")).toBeVisible();

    // The route's loader may already have tried once before the player did.
    const before = requests;

    await page.getByRole("button", { name: "Try again" }).click();
    await expect.poll(() => requests).toBe(before + 1);
    await expect(page.getByText("YouTube’s player didn’t load.")).toBeVisible();
  });
});
