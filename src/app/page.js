"use client";

import { useRef } from "react";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Amenities from "@/components/Amenities";
import Project from "@/components/Project";
import Location from "@/components/Location";
import SeaSection from "@/components/SeaSection";
import Gallery from "@/components/Gallery";
import Payment from "@/components/Payment";
import Contact from "@/components/Contact";

import { gsap, useGSAP } from "@/lib/gsap";

import styles from "./page.module.css";

const SNAP_THRESHOLD = 0.45;

export default function Home() {
  const sceneRef = useRef(null);
  const heroLayerRef = useRef(null);
  const aboutLayerRef = useRef(null);

  useGSAP(
    () => {
      const scene = sceneRef.current;
      const heroLayer = heroLayerRef.current;
      const aboutLayer = aboutLayerRef.current;

      const aboutContent = aboutLayer?.querySelector("[data-about-content]");

      const aboutMedia = aboutLayer?.querySelector("[data-about-media]");

      const aboutImage = aboutMedia?.querySelector("img");

      if (
        !scene ||
        !heroLayer ||
        !aboutLayer ||
        !aboutContent ||
        !aboutMedia ||
        !aboutImage
      ) {
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
          const { desktop, mobile, reduceMotion } = context.conditions;

          if (reduceMotion) {
            gsap.set(aboutLayer, {
              clipPath: "none",
            });

            gsap.set(heroLayer, {
              clearProps: "transform",
            });

            gsap.set(aboutContent.children, {
              opacity: 1,
              y: 0,
            });

            gsap.set(aboutImage, {
              clearProps: "transform",
            });

            return;
          }

          /*
           * About stays fixed in place.
           * Only its visible area is revealed upward.
           */
          gsap.set(aboutLayer, {
            clipPath: "inset(100% 0% 0% 0%)",
          });

          /*
           * Keep Hero stationary behind About.
           */
          gsap.set(heroLayer, {
            scale: 1,
            y: 0,
          });

          gsap.set(aboutContent.children, {
            opacity: 0,
            y: mobile ? 24 : 36,
          });

          /*
           * Small internal image offset adds depth,
           * but the About panel itself never slides.
           */
          gsap.set(aboutImage, {
            scale: 1.08,
            yPercent: 8,
          });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: scene,
              start: "top top",
              end: "bottom bottom",

              scrub: mobile ? 0.5 : 0.75,
              invalidateOnRefresh: true,

              snap: {
                snapTo: (progress) => (progress < SNAP_THRESHOLD ? 0 : 1),

                duration: {
                  min: 0.3,
                  max: mobile ? 0.55 : 0.75,
                },

                delay: mobile ? 0.16 : 0.12,
                ease: "power2.inOut",
                inertia: false,
              },
            },
          });

          timeline
            /*
             * Straight vertical wipe:
             * bottom edge rises toward the top.
             */
            .to(
              aboutLayer,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
                ease: "none",
              },
              0,
            )

            /*
             * Very subtle Hero zoom only.
             * No upward movement.
             */
            .to(
              heroLayer,
              {
                scale: desktop ? 1.018 : 1.008,
                duration: 1,
                ease: "none",
              },
              0,
            )

            /*
             * Internal image parallax makes
             * the reveal feel scroll-driven.
             */
            .to(
              aboutImage,
              {
                scale: 1,
                yPercent: 0,
                duration: 1,
                ease: "none",
              },
              0,
            )

            /*
             * Text appears after enough of the
             * section has been revealed.
             */
            .to(
              aboutContent.children,
              {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.3,
                ease: "power2.out",
              },
              0.58,
            );
        },
      );

      return () => {
        matchMedia.revert();
      };
    },
    {
      scope: sceneRef,
    },
  );

  return (
    <>
      <Header />

      <main>
        <section
          ref={sceneRef}
          id="hero-about-scene"
          className={styles.heroAboutScene}
        >
          <div className={styles.stickyViewport}>
            <div ref={heroLayerRef} className={styles.heroLayer}>
              <Hero />
            </div>

            <About ref={aboutLayerRef} className={styles.aboutLayer} />
          </div>
        </section>

        <Amenities />
        <Project />
        <Location />
        <SeaSection />
        <Gallery />
        <Payment />
        <Contact />
        <section id="contact" className={styles.standardSection}>
          <h2>Contact</h2>
        </section>
      </main>
    </>
  );
}
