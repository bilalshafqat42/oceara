"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Location.module.css";

const locationItems = [
  {
    time: "15 Min",
    destination: "Dubai International Airport (DXB)",
  },
  {
    time: "20 Min",
    destination: "Downtown Dubai, Burj Khalifa",
  },
  {
    time: "20 Min",
    destination: "Dubai Creek Golf Club",
  },
  {
    time: "30 Min",
    destination: "Dubai Marina",
  },
];

export default function Location() {
  const sectionRef = useRef(null);
  const introRef = useRef(null);
  const mapRef = useRef(null);
  const imageRef = useRef(null);
  const itemRefs = useRef([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const intro = introRef.current;
      const map = mapRef.current;
      const image = imageRef.current;
      const items = itemRefs.current.filter(Boolean);

      if (!section || !intro || !map || !image || items.length === 0) {
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
            gsap.set([intro.children, map, image, items], {
              clearProps: "all",
              opacity: 1,
            });

            return;
          }

          /*
           * Intro content appears as the user approaches
           * the Location section.
           */
          gsap.fromTo(
            intro.children,
            {
              opacity: 0,
              y: mobile ? 34 : 52,
            },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              stagger: 0.1,
              ease: "power3.out",

              scrollTrigger: {
                trigger: intro,
                start: "top 82%",
                once: true,
              },
            },
          );

          /*
           * The map reveals upward rather than sliding
           * the complete element physically into place.
           */
          gsap.fromTo(
            map,
            {
              clipPath: "inset(100% 0% 0% 0%)",
            },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",

              scrollTrigger: {
                trigger: map,
                start: "top bottom",
                end: "top 12%",
                scrub: mobile ? 0.55 : 0.75,
                invalidateOnRefresh: true,
              },
            },
          );

          /*
           * Subtle image depth while the map is uncovered.
           */
          gsap.fromTo(
            image,
            {
              scale: 1.07,
              yPercent: 6,
            },
            {
              scale: 1,
              yPercent: 0,
              ease: "none",

              scrollTrigger: {
                trigger: map,
                start: "top bottom",
                end: "top 12%",
                scrub: mobile ? 0.55 : 0.75,
                invalidateOnRefresh: true,
              },
            },
          );

          /*
           * Location details rise into place one by one.
           */
          gsap.fromTo(
            items,
            {
              opacity: 0,
              y: mobile ? 30 : 48,
            },
            {
              opacity: 1,
              y: 0,
              duration: mobile ? 0.72 : 0.9,
              stagger: mobile ? 0.08 : 0.12,
              ease: "power3.out",

              scrollTrigger: {
                trigger: map,
                start: "top 48%",
                once: true,
              },
            },
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
      id="location"
      className={styles.location}
      aria-labelledby="location-title"
    >
      <div ref={introRef} className={styles.intro}>
        <p className={styles.eyebrow}>Connected To The</p>

        <h2 id="location-title" className={styles.heading}>
          City, Grounded By Nature
        </h2>

        <p className={styles.introText}>
          Enjoy the tranquillity of island living while remaining effortlessly
          connected to Dubai&apos;s most important destinations, business
          districts, lifestyle hubs and leisure experiences.
        </p>
      </div>

      <div ref={mapRef} className={styles.map}>
        <div className={styles.imageWrapper}>
          <Image
            ref={imageRef}
            src="/images/map/map.jpg"
            alt="Map showing Oceara Park Views on Dubai Islands and nearby destinations"
            fill
            quality={90}
            sizes="100vw"
            className={styles.image}
          />
        </div>

        <div className={styles.mapOverlay} aria-hidden="true" />

        <div className={styles.locationList}>
          {locationItems.map((item, index) => (
            <article
              key={`${item.time}-${item.destination}`}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              className={styles.locationItem}
            >
              <h3 className={styles.time}>{item.time}</h3>

              <p className={styles.destination}>{item.destination}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}