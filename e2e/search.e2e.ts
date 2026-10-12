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
