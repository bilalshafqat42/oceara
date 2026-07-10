"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Hero.module.css";

export default function Hero() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  /*
   * Clicking Discover More or Scroll Down moves the
   * page to the end of the Hero/About scroll scene.
   *
   * The GSAP timeline in page.js follows the real
   * page scroll position, so clicks and mouse scrolling
   * produce the same visual transition.
   */
  const revealAbout = useCallback((event) => {
    event.preventDefault();

    const scene = document.getElementById("hero-about-scene");

    if (!scene) {
      return;
    }

    const destination =
      scene.offsetTop + scene.offsetHeight - window.innerHeight;

    window.scrollTo({
      top: destination,
      behavior: "smooth",
    });
  }, []);

  /*
   * Hero entrance animation only.
   *
   * The Hero-to-About scroll transition belongs
   * in page.js because it controls two sections.
   */
  useGSAP(
    () => {
      const image = imageRef.current;
      const content = contentRef.current;
      const scrollIndicator = scrollIndicatorRef.current;

      if (!image || !content) {
        return;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions;

          if (reduceMotion) {
            gsap.set([image, ...content.children, scrollIndicator], {
              clearProps: "all",
              opacity: 1,
            });

            return;
          }

          const entranceTimeline = gsap.timeline({
            defaults: {
              ease: "power3.out",
            },
          });

          entranceTimeline
            .fromTo(
              image,
              {
                scale: 1.08,
              },
              {
                scale: 1,
                duration: 1.8,
                ease: "power2.out",
              },
            )
            .fromTo(
              `.${styles.eyebrow}`,
              {
                opacity: 0,
                y: 28,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.9,
              },
              0.4,
            )
            .fromTo(
              `.${styles.title}`,
              {
                opacity: 0,
                y: 42,
              },
              {
                opacity: 1,
                y: 0,
                duration: 1.1,
              },
              0.52,
            )
            .fromTo(
              `.${styles.discoverLink}`,
              {
                opacity: 0,
                y: 22,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
              },
              0.72,
            );

          if (scrollIndicator) {
            entranceTimeline.fromTo(
              scrollIndicator,
              {
                opacity: 0,
                y: 16,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
              },
              0.95,
            );
          }
        },
      );

      return () => {
        matchMedia.revert();
      };
    },
    {
      scope: sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      id="home"
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div ref={imageRef} className={styles.imageWrapper}>
        <Image
          src="/images/hero/hero-bg.jpg"
          alt="Oceara coastal living surrounded by sea and nature"
          fill
          priority
          quality={90}
          sizes="100vw"
          className={styles.image}
        />
      </div>

      <div className={styles.imageOverlay} aria-hidden="true" />

      <div ref={contentRef} className={styles.content}>
        <p className={styles.eyebrow}>A Softer</p>

        <h1 id="hero-title" className={styles.title}>
          Life Shaped By Sea And Serenity
        </h1>

        <a href="#about" className={styles.discoverLink} onClick={revealAbout}>
          <span>Discover More</span>
        </a>
      </div>

      <a
        ref={scrollIndicatorRef}
        href="#about"
        className={styles.scrollIndicator}
        aria-label="Scroll down to discover Oceara"
        onClick={revealAbout}
      >
        <span className={styles.scrollText}>Scroll Down</span>

        <span className={styles.scrollLine} aria-hidden="true" />
      </a>
    </section>
  );
}
