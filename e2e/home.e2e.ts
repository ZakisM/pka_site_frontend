import { expect, seed, test, yearOf } from "./fixtures";

test("lists the archive newest first, and narrows it to a year", async ({ page }) => {
  await page.goto("/");

  // Episode cards: links to an episode, not the header's random moment.
  const cards = page.locator("a[href^='/watch/']:not([href$='random-event'])");

  await expect(cards.first()).toHaveAttribute("href", "/watch/30");

  const firstYear = String(yearOf(1));

  await page.getByRole("group", { name: "Filter by year" }).getByRole("button", { name: firstYear }).click();

  await expect(cards.first()).toHaveAttribute("href", "/watch/17");
  await expect(page.getByText("17 episodes")).toBeVisible();
});

test("continue watching holds every started episode in one row", async ({ page }) => {
  // Ten started episodes: more than a row fits at this width.
  await seed(page, { watched: Object.fromEntries(Array.from({ length: 10 }, (_, index) => [30 - index, 600])) });
  await page.goto("/");

  const shelf = page.locator("section", { has: page.getByRole("heading", { name: "Continue watching" }) });
  const cards = shelf.locator("a[href^='/watch/']");

  await expect(cards).toHaveCount(10);

  const tops = await cards.evaluateAll(
    (links) => new Set(links.map((link) => Math.round(link.getBoundingClientRect().top))).size,
  );

  expect(tops).toBe(1);

  const back = shelf.getByRole("button", { name: "Scroll back" });
  const forward = shelf.getByRole("button", { name: "Scroll forward" });

  await expect(back).toBeDisabled();
  await forward.click();
  await expect(back).toBeEnabled();
});

test("an episode that doesn't exist says so", async ({ page }) => {
  await page.goto("/watch/999");

  await expect(page.getByText("That episode isn’t in the index")).toBeVisible();
});
