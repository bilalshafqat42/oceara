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
   * Scroll to the end of the shared Hero/About scene.
   *
   * The Hero-to-About timeline remains controlled
   * by page.js, where both sections are available.
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

  useGSAP(
    () => {
      const section = sectionRef.current;
      const image = imageRef.current;
      const content = contentRef.current;
      const scrollIndicator = scrollIndicatorRef.current;

      if (!section || !image || !content) {
        return;
      }

      const eyebrow = content.querySelector(`.${styles.eyebrow}`);
      const title = content.querySelector(`.${styles.title}`);
      const subtitle = content.querySelector(`.${styles.subtitle}`);
      const discoverLink = content.querySelector(`.${styles.discoverLink}`);

      if (!eyebrow || !title || !subtitle || !discoverLink) {
        return;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const {
            desktop = false,
            mobile = false,
            reduceMotion = false,
          } = context.conditions ?? {};

          if (reduceMotion) {
            gsap.set(image, {
              scale: 1,
              yPercent: 0,
            });

            gsap.set(
              [eyebrow, title, subtitle, discoverLink, scrollIndicator],
              {
                autoAlpha: 1,
                y: 0,
              },
            );

            return;
          }

          /*
           * Initial Hero entrance sequence.
           */
          const entranceTimeline = gsap.timeline({
            defaults: {
              ease: "power3.out",
            },
          });

          entranceTimeline
            .fromTo(
              image,
              {
                scale: mobile ? 1.06 : 1.09,
              },
              {
                scale: 1,
                duration: mobile ? 1.5 : 1.9,
                ease: "power2.out",
              },
              0,
            )
            .fromTo(
              eyebrow,
              {
                autoAlpha: 0,
                y: mobile ? 22 : 30,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
              },
              0.38,
            )
            .fromTo(
              title,
              {
                autoAlpha: 0,
                y: mobile ? 32 : 46,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: mobile ? 1 : 1.15,
              },
              0.5,
            )
            .fromTo(
              subtitle,
              {
                autoAlpha: 0,
                y: mobile ? 20 : 28,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
              },
              0.68,
            )
            .fromTo(
              discoverLink,
              {
                autoAlpha: 0,
                y: mobile ? 18 : 24,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.82,
              },
              0.82,
            );

          if (scrollIndicator) {
            entranceTimeline.fromTo(
              scrollIndicator,
              {
                autoAlpha: 0,
                y: 16,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
              },
              1,
            );
          }

          /*
           * Subtle image movement while scrolling.
           *
           * The wrapper remains larger than the viewport,
           * allowing movement without revealing an empty edge.
           */
          gsap.to(image, {
            yPercent: desktop ? 7 : 4,
            ease: "none",

            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: mobile ? 0.55 : 0.85,
              invalidateOnRefresh: true,
            },
          });

          /*
           * Fade the scroll indicator once the visitor
           * begins moving through the Hero/About scene.
           */
          if (scrollIndicator) {
            gsap.to(scrollIndicator, {
              autoAlpha: 0,
              y: -12,
              ease: "none",

              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: mobile ? "12% top" : "18% top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
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
          alt="Oceara coastal residences surrounded by sea and nature"
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

        <p className={styles.subtitle}>Exclusive Residences At Dubai Islands</p>

        <a href="#contact" className={styles.discoverLink} data-contact-popup>
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
