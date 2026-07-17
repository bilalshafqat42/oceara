/*
 * Search engine and AI crawling is blocked for now.
 *
 * Reason: the final domain and hosting for Oceara haven't been decided
 * yet, so whatever URL this is temporarily reachable at (a Vercel
 * preview link, a staging subdomain, etc.) should not get indexed by
 * Google, Bing, or AI crawlers. If that happened, it would show up as
 * duplicate content once the real domain goes live and could hurt
 * search visibility for the real site.
 *
 * Link-preview bots (WhatsApp, Facebook, Slack, etc.) are explicitly
 * allowed through below. They only fetch a page once to build a share
 * card, they don't index it or feed any search engine, so letting them
 * through doesn't conflict with the block above.
 *
 * To switch off the block once the real domain and hosting are
 * confirmed: change the first rule's `disallow: "/"` to `allow: "/"`.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
      {
        userAgent: [
          "facebookexternalhit",
          "WhatsApp",
          "Twitterbot",
          "LinkedInBot",
          "Slackbot",
          "TelegramBot",
          "Discordbot",
        ],
        allow: "/",
      },
    ],
  };
}
