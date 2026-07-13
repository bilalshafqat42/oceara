"use client";

import { forwardRef } from "react";
import Image from "next/image";

import styles from "./About.module.css";

const About = forwardRef(function About({ className = "" }, ref) {
  return (
    <section
      ref={ref}
      id="about"
      className={`${styles.about} ${className}`}
      aria-labelledby="about-title"
    >
      <div className={styles.leftPanel} data-about-left>
        <div className={styles.content} data-about-content>
          <p className={styles.eyebrow}>Where The</p>

          <h2 id="about-title" className={styles.title}>
            City Softens Into The Sea
          </h2>
        </div>
      </div>

      <div className={styles.rightPanel} data-about-right data-about-media>
        <Image
          src="/images/about/green.jpg"
          alt=""
          fill
          quality={90}
          sizes="(max-width: 767px) 100vw, 50vw"
          className={styles.image}
        />

        <div className={styles.imageOverlay} aria-hidden="true" />
      </div>
    </section>
  );
});

About.displayName = "About";

export default About;
