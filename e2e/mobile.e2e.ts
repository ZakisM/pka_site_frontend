import { TARGET, clock, expect, playingMoment, seed, test } from "./fixtures";

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
