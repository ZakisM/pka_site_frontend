import { TARGET, clock, expect, playingMoment, seed, test, timestampOf } from "./fixtures";

test("the search icon brings kept results back on the first tap", async ({ page }) => {
  await page.goto("/");

  const icon = page.getByRole("button", { name: "Search", exact: true });
  const box = page.getByRole("textbox", { name: "Search every episode and moment" });
  const hits = page.locator("[data-hit]");

  await icon.tap();
  await expect(box).toBeFocused();
  await box.fill("hellraiser");
  await expect(hits).toHaveCount(2);

  // The header's Close folds the box away and keeps the query...
  await page.getByRole("button", { name: "Close" }).tap();
  await expect(hits).toHaveCount(0);
  await expect(icon).toBeVisible();

  // ...and one tap on the icon brings those results straight back.
  await icon.tap();
  await expect(hits).toHaveCount(2);
  await expect(box).toHaveValue("hellraiser");
});

test("a moment opens its episode, with that moment in view", async ({ page }) => {
  await page.goto(`/watch/1?q=hellraiser`);
  await page.locator("[data-hit]", { hasText: TARGET.description }).tap();

  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });
});

test("continue watching is a row to swipe, without paging buttons", async ({ page }) => {
  await seed(page, { watched: { 30: 600, 29: 600, 28: 600, 27: 600, 26: 600 } });
  await page.goto("/");

  const shelf = page.locator("section", { has: page.getByRole("heading", { name: "Continue watching" }) });
  const cards = shelf.locator("a[href^='/watch/']");

  await expect(cards).toHaveCount(5);
  await expect(shelf.getByRole("button", { name: "Scroll forward" })).toBeHidden();

  const row = await cards.evaluateAll((links) => ({
    rows: new Set(links.map((link) => Math.round(link.getBoundingClientRect().top))).size,
    pageScrollsSideways: document.documentElement.scrollWidth > window.innerWidth,
  }));

  expect(row).toEqual({ rows: 1, pageScrollsSideways: false });
});

// Phones resize the list as their toolbars slide away while the page scrolls.
// The list used to re-centre on every resize, so scrolling down to the
// Related moments scrolled the list too, by itself.
test("scrolling the page leaves the moments list where it is", async ({ page }) => {
  await page.goto(`/watch/${TARGET.episode}?timestamp=${timestampOf(TARGET.index)}`);
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });

  const list = page.locator("aside [data-index]").first().locator("..");

  // Browsing the list away from the playing moment...
  await list.evaluate((element) => {
    element.scrollTop = 0;
  });

  // ...then the toolbar sliding away: the page is taller, no wider.
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };

  await page.setViewportSize({ width, height: height + 80 });
  await page.waitForTimeout(300);

  expect(await list.evaluate((element) => element.scrollTop)).toBe(0);
});

// A tapped element stays :hover on a phone, and the list doesn't follow
// Playback while hovered (so it never moves under a mouse), so after one tap
// It stopped following altogether.
test("after tapping a moment, the list keeps following playback", async ({ page }) => {
  await page.goto(`/watch/${TARGET.episode}`);
  await page.locator("aside [data-index='2']").tap();
  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(2), inView: true });

  // Playback moves far down the list, with no further taps. Repeated until
  // The player has settled on the tapped moment and lets the jump stand.
  await expect
    .poll(async () => {
      await page.evaluate((seconds) => globalThis.fakePlayer?.scrubTo(seconds), timestampOf(TARGET.index));

      return playingMoment(page);
    })
    .toEqual({ time: clock(TARGET.index), inView: true });
});

test("About & privacy is a tap away on a phone too", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About & privacy" }).tap();

  await expect(page.getByRole("heading", { name: "About & privacy" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
