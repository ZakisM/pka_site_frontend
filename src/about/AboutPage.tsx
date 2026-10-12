import { useEffect } from "react";

const linkStyles = "text-ink underline decoration-line-strong underline-offset-3 hover:decoration-ink";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-9 first:mt-0">
    <h2 className="mb-2.5 text-[15px] font-semibold">{title}</h2>
    <div className="flex flex-col gap-3 text-[14px]/[1.6] text-secondary">{children}</div>
  </section>
);

/**
 * What the site is, where its videos and moments come from, and what it
 * Stores. YouTube's API terms require sites using them to say most of this,
 * And to keep it easy to reach from every page: hence the header's (i).
 */
export const AboutPage = () => {
  useEffect(() => {
    document.title = "About & privacy · PKA Index";
  }, []);

  return (
    <main className="mx-auto max-w-[680px] px-6 pt-10 pb-18 mobile:px-4 mobile:pt-7">
      <h1 className="mb-8 text-[24px]/[1.25] font-medium tracking-[-0.01em] mobile:text-[21px]/[1.25]">
        About &amp; privacy
      </h1>
      <Section title="About PKA Index">
        <p>
          A fan-made index of every Painkiller Already episode and its moments, so any part of the show can be found and
          played. It isn’t affiliated with PKA, YouTube or Google.
        </p>
      </Section>
      <Section title="Videos come from YouTube">
        <p>
          Episodes play in YouTube’s own player, and the site uses YouTube API Services to keep each episode’s details
          up to date. By using the site you agree to the{" "}
          <a className={linkStyles} href="https://www.youtube.com/t/terms">
            YouTube Terms of Service
          </a>
          . How YouTube and Google handle data is covered by the{" "}
          <a className={linkStyles} href="https://www.google.com/policies/privacy">
            Google Privacy Policy
          </a>
          .
        </p>
      </Section>
      <Section title="Where the moments come from">
        <p>
          Each episode’s moments come from the timestamps in its YouTube description, checked against YouTube every day.
          Older episodes whose descriptions have none use timelines written by the PKA community.
        </p>
      </Section>
      <Section title="What’s stored">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-dim">
          <li>
            <b className="font-medium text-ink">About you, on our server:</b> nothing. No accounts, no analytics, no
            visitor logs and no cookies of our own.
          </li>
          <li>
            <b className="font-medium text-ink">In your browser:</b> how far you got in each episode and the episodes
            you opened recently, so you can carry on where you left off. It never leaves your browser, and clearing this
            site’s data removes it.
          </li>
          <li>
            <b className="font-medium text-ink">YouTube’s player</b> may set its own cookies and collect data when it
            loads or plays a video, under Google’s Privacy Policy.
          </li>
          <li>
            <b className="font-medium text-ink">Cloudflare</b> handles traffic to the site and sees visitors’ IP
            addresses, under{" "}
            <a className={linkStyles} href="https://www.cloudflare.com/privacypolicy/">
              its own privacy policy
            </a>
            .
          </li>
        </ul>
      </Section>
    </main>
  );
};
