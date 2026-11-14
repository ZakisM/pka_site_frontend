import { SOURCE, TARGET, clock, expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

const searchBox = (page: Page) => page.getByRole("textbox", { name: "Search every episode and moment" });

// Opening a result takes focus out of the search box (on phones, to put the
// keyboard away) and left it on nothing: a keyboard or screen reader user
// landed on the episode without being told, at the top of the page.
test("opening a result moves focus to the episode's title", async ({ page }) => {
  await page.goto("/");

  const box = searchBox(page);
  const title = page.getByRole("heading", { level: 1 });

  await box.fill("hellraiser");
  await expect(page.locator("[data-hit]")).toHaveCount(2);
  await box.press("ArrowDown");
  await box.press("ArrowDown");
  await box.press("Enter");
  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await expect(title).toBeFocused();

  // And when the result is in the episode already underneath.
  await box.click();
  await expect(page.locator("[data-hit]")).toHaveCount(2);
  await page.locator("[data-hit]", { hasText: TARGET.description }).click();
  await expect(page.locator("[data-hit]")).toHaveCount(0);
  await expect(title).toBeFocused();

  // Once: coming Back to the episode doesn't take focus again.
  await page.getByRole("link", { name: "About & privacy" }).click();
  await expect(page).toHaveURL("/about");
  await page.goBack();
  await expect(page).toHaveURL(`/watch/${TARGET.episode}`);
  await expect(page.getByRole("textbox", { name: "Filter moments" })).toBeVisible();
  await expect(title).not.toBeFocused();
});

// Focus stays in the search box while the results change under it and the
// arrow keys move through them, so none of it reached a screen reader.
test("the result count and the moment the arrow keys pick are announced", async ({ page }) => {
  await page.goto("/");

  const box = searchBox(page);
  const announced = page.locator("output.sr-only");

  await box.fill("hellraiser");
  await expect(announced.filter({ hasText: "2 moments in 2 episodes" })).toHaveCount(1);
  await box.press("ArrowDown");
  await expect(
    announced.filter({ hasText: `Episode ${SOURCE.episode}, ${clock(SOURCE.index)}, ${SOURCE.description}` }),
  ).toHaveCount(1);
  await box.press("ArrowDown");
  await expect(
    announced.filter({ hasText: `Episode ${TARGET.episode}, ${clock(TARGET.index)}, ${TARGET.description}` }),
  ).toHaveCount(1);

  await box.fill("zzzqqq");
  await expect(announced.filter({ hasText: "Nothing matches “zzzqqq”." })).toHaveCount(1);
});
