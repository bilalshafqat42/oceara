import Link from "next/link";

import styles from "./thank-you.module.css";

export const metadata = {
  title: "Thank You | Oceara Park Views",
  description:
    "Thank you for your interest in Oceara Park Views. Our team will contact you shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return (
    <main className={styles.page}>
      <div className={styles.background} aria-hidden="true" />

      <div className={styles.overlay} aria-hidden="true" />

      <section className={styles.content} aria-labelledby="thank-you-title">
        <p className={styles.eyebrow}>Thank You</p>

        <h1 id="thank-you-title" className={styles.heading}>
          Your Request Has Been Received
        </h1>

        <p className={styles.description}>
          Thank you for your interest in Oceara Park Views. A member of our
          dedicated team will contact you shortly.
        </p>

        <Link href="/" className={styles.homeLink}>
          <span>Return To Home</span>
        </Link>
      </section>
    </main>
  );
}
