import { SOURCE, TARGET, clock, expect, playingMoment, seed, test, timestampOf } from "./fixtures";

test("a shared link starts at its moment", async ({ page }) => {
  await page.goto(`/watch/${TARGET.episode}?timestamp=${timestampOf(TARGET.index)}`);

  await expect.poll(async () => playingMoment(page)).toEqual({ time: clock(TARGET.index), inView: true });
});

// Resize observers report every element once when first observed. Here that
// First report is withheld, as if it had already arrived before the router's
// Scroll restore: which comes first is a race the test can't otherwise fix.
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
// Last episode's list position onto the next episode's list. That hid the
// Moment when the list opened on it straight away (an episode already watched
// Up to that point) and nothing scrolled the list again afterwards.
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
});

// Each tab saved its own position every second and took the other's from
// Storage, so both lists flicked between the two tabs' moments.
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
