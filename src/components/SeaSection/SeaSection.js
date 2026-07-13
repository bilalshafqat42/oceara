"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./SeaSection.module.css";

export default function SeaSection() {
  const sectionRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const leftImageRef = useRef(null);
  const rightImageRef = useRef(null);
  const overlayRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const leftPanel = leftPanelRef.current;
      const rightPanel = rightPanelRef.current;
      const leftImage = leftImageRef.current;
      const rightImage = rightImageRef.current;
      const overlay = overlayRef.current;

      if (
        !section ||
        !leftPanel ||
        !rightPanel ||
        !leftImage ||
        !rightImage ||
        !overlay
      ) {
        return undefined;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile = false, reduceMotion = false } =
            context.conditions ?? {};

          if (reduceMotion) {
            gsap.set([leftPanel, rightPanel], {
              clipPath: "none",
            });

            gsap.set([leftImage, rightImage, overlay], {
              clearProps: "all",
            });

            return undefined;
          }

          /*
           * Left panel:
           * Hidden from the bottom.
           * Reveals from top to bottom.
           */
          gsap.set(leftPanel, {
            clipPath: "inset(0% 0% 100% 0%)",
          });

          /*
           * Right panel:
           * Hidden from the top.
           * Reveals from bottom to top.
           */
          gsap.set(rightPanel, {
            clipPath: "inset(100% 0% 0% 0%)",
          });

          /*
           * The image itself stays in position.
           * Only a very subtle zoom settles during reveal.
           */
          gsap.set([leftImage, rightImage], {
            scale: mobile ? 1.035 : 1.05,
            transformOrigin: "center center",
          });

          gsap.set(overlay, {
            opacity: 0.35,
          });

          const timeline = gsap.timeline({
            defaults: {
              ease: "none",
            },

            scrollTrigger: {
              trigger: section,

              /*
               * Start as the section enters the viewport.
               */
              start: "top bottom",

              /*
               * Finish when the section reaches the top.
               */
              end: "top top",

              scrub: mobile ? 0.55 : 0.8,
              invalidateOnRefresh: true,

              // markers: true,
            },
          });

          timeline
            /*
             * Left image opens downward.
             */
            .to(
              leftPanel,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
              },
              0,
            )

            /*
             * Right image opens upward.
             */
            .to(
              rightPanel,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
              },
              0,
            )

            /*
             * Identical movement keeps both image halves aligned.
             */
            .to(
              [leftImage, rightImage],
              {
                scale: 1,
                duration: 1,
              },
              0,
            )

            .to(
              overlay,
              {
                opacity: 1,
                duration: 1,
              },
              0,
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
      scope: sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      className={styles.seaSection}
      aria-label="Oceara sea lifestyle"
    >
      <div className={styles.stickyViewport}>
        <div className={styles.columns}>
          {/* Left half — reveals from top to bottom */}
          <div
            ref={leftPanelRef}
            className={`${styles.panel} ${styles.leftPanel}`}
          >
            <div
              ref={leftImageRef}
              className={`${styles.imageCanvas} ${styles.leftImageCanvas}`}
            >
              <Image
                src="/images/sections/sea-view.jpg"
                alt="Luxury yacht above the sea with divers exploring underwater"
                fill
                quality={90}
                sizes="100vw"
                className={styles.image}
              />
            </div>
          </div>

          {/* Right half — reveals from bottom to top */}
          <div
            ref={rightPanelRef}
            className={`${styles.panel} ${styles.rightPanel}`}
          >
            <div
              ref={rightImageRef}
              className={`${styles.imageCanvas} ${styles.rightImageCanvas}`}
            >
              <Image
                src="/images/sections/sea-view.jpg"
                alt=""
                fill
                quality={90}
                sizes="100vw"
                className={styles.image}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div ref={overlayRef} className={styles.overlay} aria-hidden="true" />
      </div>
    </section>
  );
}
