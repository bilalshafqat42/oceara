"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./SeaSection.module.css";

export default function SeaSection() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const imageLayerRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const imageLayer = imageLayerRef.current;

      if (!section || !viewport || !imageLayer) {
        return;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile, reduceMotion } = context.conditions;

          if (reduceMotion) {
            gsap.set(viewport, {
              clipPath: "none",
            });

            gsap.set(imageLayer, {
              clearProps: "transform",
            });

            return;
          }

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              scrub: mobile ? 0.55 : 0.8,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .fromTo(
              viewport,
              {
                clipPath: "inset(100% 0% 0% 0%)",
              },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
                ease: "none",
              },
              0,
            )
            .fromTo(
              imageLayer,
              {
                yPercent: mobile ? 10 : 14,
                scale: mobile ? 1.06 : 1.1,
              },
              {
                yPercent: 0,
                scale: 1,
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
      <div ref={viewportRef} className={styles.viewport}>
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
    </section>
  );
}
