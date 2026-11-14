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

// YouTube's API terms want these notices reachable from every page.
test("the header's (i) opens About & privacy, with YouTube's and Google's terms", async ({ page }) => {
  await page.goto("/watch/1");
  await page.getByRole("link", { name: "About & privacy" }).click();

  await expect(page).toHaveURL("/about");
  await expect(page.getByRole("heading", { name: "About & privacy" })).toBeVisible();
  await expect(page.getByRole("link", { name: "YouTube Terms of Service" })).toHaveAttribute(
    "href",
    "https://www.youtube.com/t/terms",
  );
  await expect(page.getByRole("link", { name: "Google Privacy Policy" })).toHaveAttribute(
    "href",
    "https://www.google.com/policies/privacy",
  );
});

// A refetch that fails keeps the episodes it already had: React Query holds on
// to them, and the archive on screen is still right.
test("a failed refetch leaves the archive on screen", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");

  const cards = page.locator("a[href^='/watch/']:not([href$='random-event'])");

  await expect(cards.first()).toHaveAttribute("href", "/watch/30");

  // The list goes stale, the API goes down, and home is opened again.
  let failed = 0;

  await page.route("**/api/v1/episodes", async (route) => {
    failed += 1;
    await route.fulfill({ status: 503, body: "" });
  });
  await page.clock.fastForward("10:00");
  await page.getByRole("link", { name: "About & privacy" }).click();
  await expect(page).toHaveURL("/about");
  await page.getByRole("link", { name: "PKA Index home" }).click();

  // The refetch and React Query's three retries all fail.
  await expect
    .poll(async () => {
      await page.clock.runFor(5000);

      return failed;
    })
    .toBeGreaterThanOrEqual(4);
  await page.clock.runFor(5000);

  await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeHidden();
  await expect(cards.first()).toHaveAttribute("href", "/watch/30");
});

// The watch page's loader asked for the episode once: a single failed request
// on a shared link showed the error page, though a retry would have worked.
test("an episode whose first request fails opens on the retry", async ({ page }) => {
  let failures = 0;

  await page.route("**/api/v1/episodes/12", async (route) => {
    if (failures === 0) {
      failures += 1;
      await route.fulfill({ status: 503, body: "" });
    } else {
      await route.fallback();
    }
  });
  await page.goto("/watch/12");

  await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeHidden();
  await expect(page.getByRole("textbox", { name: "Filter moments" })).toBeVisible();
  expect(failures).toBe(1);
});

// The id is decoded from the URL: put into the API's path as it was, an
// escaped slash asked a different endpoint and the page crashed on its answer.
test("an episode id is only ever an episode id", async ({ page }) => {
  await page.goto("/watch/..%2Fevents%2Frandom");

  await expect(page.getByText("That episode isn’t in the index")).toBeVisible();
});

// However the browser words a failed request, and for the API's own timeout,
// the page says the API couldn't be reached rather than showing the raw error.
test("an API that never answers is reported as unreachable", async ({ page }) => {
  await page.clock.install();
  await page.route("**/api/v1/episodes/12", async () => {
    // Never answered.
  });
  await page.goto("/watch/12");

  const heading = page.getByRole("heading", { name: "Something went wrong" });

  await expect
    .poll(async () => {
      await page.clock.runFor(30_000);

      return heading.isVisible();
    })
    .toBe(true);
  await expect(page.getByText("We couldn't reach the PKA Index API.")).toBeVisible();
});

// Clearing storage in one tab fires a storage event with no key, which the
// other tabs ignored: they kept the cleared list and wrote it back.
test("storage cleared in another tab stays cleared", async ({ page, context }) => {
  await seed(page, { watched: { 3: 600, 2: 600 } });
  await page.goto("/");
  await expect(page.locator("a[href='/watch/3']").first()).toBeVisible();

  const other = await context.newPage();

  await other.goto("/about");
  await other.evaluate(() => {
    localStorage.clear();
  });

  // Opening an episode here records it as the only one opened since.
  await page.locator("a[href='/watch/29']").first().click();
  await expect(page).toHaveURL("/watch/29");
  await expect.poll(async () => other.evaluate(() => localStorage.getItem("recent-episodes"))).toBe("[29]");
});
