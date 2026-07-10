"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Amenities.module.css";

const amenitiesData = [
  {
    title: "63 Exclusive Residences",
    description:
      "A limited collection that creates a more private and low-density living experience.",
  },
  {
    title: "1 To 4-Bedroom Homes",
    description:
      "A flexible unit mix that suits singles, couples, families, and larger households.",
  },
  {
    title: "3 And 4-Bedroom Townhouses",
    description: "Rare townhouse options within a coastal mid-rise project.",
  },
  {
    title: "2 Amenity Zones",
    description:
      "Top-off podium and rooftop levels create distinct lifestyle areas for fitness, leisure, and relaxation.",
  },
  {
    title: "Q1 2028 Completion",
    description: "A clear handover timeline for buyers planning ahead.",
  },
];

export default function Amenities() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const imagePanelRef = useRef(null);
  const contentPanelRef = useRef(null);
  const itemRefs = useRef([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      const imagePanel = imagePanelRef.current;
      const contentPanel = contentPanelRef.current;

      const items = itemRefs.current.filter(Boolean);

      if (
        !section ||
        !sticky ||
        !imagePanel ||
        !contentPanel ||
        !items.length
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
          const { mobile, reduceMotion } = context.conditions;

          if (reduceMotion) {
            gsap.set(sticky, {
              clearProps: "clipPath",
            });

            gsap.set(items, {
              position: "relative",
              opacity: 1,
              visibility: "visible",
              y: 0,
            });

            return;
          }

          /*
           * Initial section reveal.
           * The complete Amenities viewport rises
           * cleanly from the bottom.
           */
          gsap.set(sticky, {
            clipPath: "inset(100% 0% 0% 0%)",
          });

          gsap.to(sticky, {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",

            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          });

          /*
           * Small internal movement makes the section
           * feel scroll-driven without moving the fixed layout.
           */
          gsap.fromTo(
            imagePanel,
            {
              yPercent: mobile ? 8 : 12,
              scale: 1.04,
            },
            {
              yPercent: 0,
              scale: 1,
              ease: "none",

              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            },
          );

          gsap.fromTo(
            contentPanel,
            {
              y: mobile ? 34 : 56,
            },
            {
              y: 0,
              ease: "none",

              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            },
          );

          /*
           * Prepare the text slides.
           * Only the first item is visible initially.
           */
          items.forEach((item, index) => {
            gsap.set(item, {
              autoAlpha: index === 0 ? 1 : 0,
              y: index === 0 ? 0 : 70,
              pointerEvents: index === 0 ? "auto" : "none",
            });
          });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",

              scrub: mobile ? 0.55 : 0.8,
              invalidateOnRefresh: true,

              /*
               * Snaps to each text item after scrolling stops.
               */
              snap: {
                snapTo: 1 / (amenitiesData.length - 1),

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

          /*
           * Each step:
           * 1. Current item exits upward.
           * 2. Next item enters from below.
           */
          for (let index = 0; index < items.length - 1; index += 1) {
            const currentItem = items[index];
            const nextItem = items[index + 1];

            timeline
              .to(currentItem, {
                autoAlpha: 0,
                y: -70,
                pointerEvents: "none",
                duration: 0.45,
                ease: "power2.in",
              })
              .fromTo(
                nextItem,
                {
                  autoAlpha: 0,
                  y: 70,
                },
                {
                  autoAlpha: 1,
                  y: 0,
                  pointerEvents: "auto",
                  duration: 0.55,
                  ease: "power3.out",
                },
                "<0.12",
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
      id="amenities"
      className={styles.amenities}
      style={{
        "--amenities-count": amenitiesData.length,
      }}
      aria-labelledby="amenities-heading"
    >
      <div ref={stickyRef} className={styles.stickyViewport}>
        <div ref={imagePanelRef} className={styles.imagePanel}>
          <Image
            src="/images/amenities/curtan.jpg"
            alt="Curtains overlooking a serene natural landscape"
            fill
            quality={90}
            sizes="(max-width: 767px) 100vw, 50vw"
            className={styles.image}
          />

          <div className={styles.imageOverlay} aria-hidden="true" />
        </div>

        <div ref={contentPanelRef} className={styles.contentPanel}>
          <h2 id="amenities-heading" className={styles.visuallyHidden}>
            Oceara residences and amenities
          </h2>

          <div className={styles.items}>
            {amenitiesData.map((item, index) => (
              <article
                key={item.title}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className={styles.item}
              >
                <h3 className={styles.title}>{item.title}</h3>

                <p className={styles.description}>{item.description}</p>
              </article>
            ))}
          </div>

          <a href="#contact" className={styles.requestLink}>
            Submit Request
          </a>

          <div className={styles.progress} aria-hidden="true">
            {amenitiesData.map((item, index) => (
              <span
                key={item.title}
                className={styles.progressLine}
                style={{
                  "--progress-index": index,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
