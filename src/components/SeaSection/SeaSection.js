"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./SeaSection.module.css";

export default function SeaSection() {
  const sectionRef = useRef(null);
  const revealRef = useRef(null);
  const imageLayerRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const reveal = revealRef.current;
      const imageLayer = imageLayerRef.current;

      if (!section || !reveal || !imageLayer) {
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
          const { mobile, reduceMotion } = context.conditions;

          if (reduceMotion) {
            gsap.set(reveal, {
              yPercent: 0,
            });

            gsap.set(imageLayer, {
              clearProps: "transform",
            });

            return;
          }

          /*
           * The image panel starts completely below
           * the visible viewport.
           */
          gsap.set(reveal, {
            yPercent: 100,
          });

          gsap.set(imageLayer, {
            scale: mobile ? 1.06 : 1.1,
            yPercent: mobile ? -3 : -5,
          });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,

              /*
               * Animation begins as the Sea section
               * starts entering from the bottom.
               */
              start: "top bottom",

              /*
               * Animation finishes when the Sea section
               * reaches the top of the viewport.
               */
              end: "top top",

              scrub: mobile ? 0.55 : 0.85,
              invalidateOnRefresh: true,

              // markers: true,
            },
          });

          timeline
            .to(
              reveal,
              {
                yPercent: 0,
                duration: 1,
                ease: "none",
              },
              0,
            )
            .to(
              imageLayer,
              {
                scale: 1,
                yPercent: 0,
                duration: 1,
                ease: "none",
              },
              0,
            );
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
        <div ref={revealRef} className={styles.reveal}>
          <div ref={imageLayerRef} className={styles.imageLayer}>
            <Image
              src="/images/sections/sea-view.jpg"
              alt="Luxury yacht above the sea with divers exploring underwater"
              fill
              quality={90}
              sizes="100vw"
              className={styles.image}
            />
          </div>

          <div className={styles.overlay} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
