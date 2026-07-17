import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { inter, kinan, minervaModern } from "@/lib/fonts";
import Loader from "@/components/Loader";

export const metadata = {
  metadataBase: new URL("https://oceara.com"), // ← replace with your real live domain
  title: "Oceara by Refine | A Life Shaped by Sea and Serenity",
  description:
    "A life shaped by sea and serenity. Discover Oceara, a Refine waterfront development in Dubai.",
  openGraph: {
    title: "Oceara by Refine | A Life Shaped by Sea and Serenity",
    description:
      "A life shaped by sea and serenity. Discover Oceara, a Refine waterfront development in Dubai.",
    url: "https://oceara.com", // ← same domain as above
    siteName: "Oceara",
    images: [
      {
        url: "/images/og/og.jpg",
        width: 1200,
        height: 630,
        alt: "Oceara by Refine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oceara by Refine | A Life Shaped by Sea and Serenity",
    description:
      "A life shaped by sea and serenity. Discover Oceara, a Refine waterfront development in Dubai.",
    images: ["/images/og/og.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={[inter.variable, kinan.variable, minervaModern.variable].join(
        " ",
      )}
    >
      <body>
        <Loader />
        {children}
      </body>
    </html>
  );
}
