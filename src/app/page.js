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
import Footer from "@/components/Footer/Footer";
import ContactPopup from "@/components/ContactPopup";

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

      if (!scene || !heroLayer || !aboutLayer) {
        return;
      }

      const aboutContent = aboutLayer.querySelector("[data-about-content]");

      const aboutMedia = aboutLayer.querySelector("[data-about-media]");

      const aboutImage = aboutMedia?.querySelector("img");

      if (!aboutContent || !aboutMedia || !aboutImage) {
        return;
      }

      const aboutContentChildren = Array.from(aboutContent.children);

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

          /*
           * Accessibility fallback:
           * remove scroll-driven transitions when the
           * visitor prefers reduced motion.
           */
          if (reduceMotion) {
            gsap.set(aboutLayer, {
              clipPath: "none",
            });

            gsap.set(heroLayer, {
              clearProps: "transform",
            });

            gsap.set(aboutContentChildren, {
              opacity: 1,
              y: 0,
              clearProps: "transform",
            });

            gsap.set(aboutImage, {
              clearProps: "transform",
            });

            return;
          }

          /*
           * Initial Hero/About scene state.
           *
           * About already covers the same viewport as Hero,
           * but clip-path hides it below the screen.
           */
          gsap.set(aboutLayer, {
            clipPath: "inset(100% 0% 0% 0%)",
          });

          gsap.set(heroLayer, {
            scale: 1,
            transformOrigin: "center center",
          });

          gsap.set(aboutContentChildren, {
            autoAlpha: 0,
            y: mobile ? 24 : 36,
          });

          /*
           * Internal image offset creates subtle depth while
           * the About section itself remains stationary.
           */
          gsap.set(aboutImage, {
            scale: 1.08,
            yPercent: 8,
            transformOrigin: "center center",
          });

          const timeline = gsap.timeline({
            defaults: {
              ease: "none",
            },

            scrollTrigger: {
              trigger: scene,
              start: "top top",
              end: "bottom bottom",

              scrub: mobile ? 0.5 : 0.75,

              invalidateOnRefresh: true,
              fastScrollEnd: true,

              snap: {
                /*
                 * Below 45% returns to Hero.
                 * At 45% or above completes About.
                 */
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
             * About is revealed vertically from bottom to top.
             * No x movement, margin or rounded clipping.
             */
            .to(
              aboutLayer,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
              },
              0,
            )

            /*
             * Hero stays fixed behind About and receives
             * only a very subtle depth scale.
             */
            .to(
              heroLayer,
              {
                scale: desktop ? 1.018 : 1.008,
                duration: 1,
              },
              0,
            )

            /*
             * The About image settles into its final position
             * while the section is revealed.
             */
            .to(
              aboutImage,
              {
                scale: 1,
                yPercent: 0,
                duration: 1,
              },
              0,
            )

            /*
             * About text appears after most of the panel
             * has already entered the viewport.
             */
            .to(
              aboutContentChildren,
              {
                autoAlpha: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.3,
                ease: "power2.out",
              },
              0.58,
            );

          return () => {
            timeline.kill();
          };
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
          aria-label="Oceara introduction"
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
        <Footer />
      </main>

      <ContactPopup />
    </>
  );
}
