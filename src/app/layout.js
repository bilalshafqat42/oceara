import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { inter, kinan, minervaModern } from "@/lib/fonts";

export const metadata = {
  title: "Oceara",
  description: "A life shaped by sea and serenity.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={[inter.variable, kinan.variable, minervaModern.variable].join(
        " ",
      )}
    >
      <body>{children}</body>
    </html>
  );
}
