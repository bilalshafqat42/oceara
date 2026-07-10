"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./SeaSection.module.css";

export default function SeaSection() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const imageRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const image = imageRef.current;

      if (!section || !viewport || !image) {
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
            gsap.set([viewport, image], {
              clearProps: "all",
            });

            return;
          }

          gsap.set(viewport, {
            clipPath: "inset(100% 0% 0% 0%)",
          });

          gsap.fromTo(
            image,
            {
              scale: mobile ? 1.05 : 1.09,
              yPercent: mobile ? 4 : 7,
            },
            {
              scale: 1,
              yPercent: 0,
              ease: "none",

              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: mobile ? 0.55 : 0.75,
                invalidateOnRefresh: true,
              },
            },
          );

          gsap.to(viewport, {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",

            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              scrub: mobile ? 0.55 : 0.75,
              invalidateOnRefresh: true,
            },
          });
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
        <Image
          ref={imageRef}
          src="/images/sections/sea.jpg"
          alt="Luxury yacht above the sea with divers exploring underwater"
          fill
          priority={false}
          quality={90}
          sizes="100vw"
          className={styles.image}
        />

        <div className={styles.overlay} aria-hidden="true" />
      </div>
    </section>
  );
}