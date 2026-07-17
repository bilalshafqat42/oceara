/*
 * Site-wide crawling is fully blocked for now.
 *
 * Reason: the final domain and hosting for Oceara haven't been decided
 * yet, so whatever URL this is temporarily reachable at (a Vercel
 * preview link, a staging subdomain, etc.) should not get indexed by
 * Google, Bing, or AI crawlers. If that happened, it would show up as
 * duplicate content once the real domain goes live and could hurt
 * search visibility for the real site.
 *
 * To switch this on once the real domain and hosting are confirmed:
 * change `disallow: "/"` to `allow: "/"` below.
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
