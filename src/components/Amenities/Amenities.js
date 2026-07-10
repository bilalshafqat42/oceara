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
        items.length === 0
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

            gsap.set(imagePanel, {
              clearProps: "transform",
            });

            gsap.set(contentPanel, {
              clearProps: "transform",
            });

            gsap.set(items, {
              position: "relative",
              autoAlpha: 1,
              y: 0,
              pointerEvents: "auto",
              clearProps: "transform",
            });

            return;
          }

          const travelDistance = mobile ? 84 : 120;

          /*
           * Reveal the complete Amenities scene
           * vertically from the bottom.
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
              scrub: mobile ? 0.55 : 0.75,
              invalidateOnRefresh: true,
            },
          });

          /*
           * Subtle image movement during the
           * initial section appearance.
           */
          gsap.fromTo(
            imagePanel,
            {
              yPercent: mobile ? 7 : 10,
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
                scrub: mobile ? 0.55 : 0.75,
                invalidateOnRefresh: true,
              },
            },
          );

          /*
           * The content panel settles upward as
           * the section enters the viewport.
           */
          gsap.fromTo(
            contentPanel,
            {
              y: mobile ? 30 : 48,
            },
            {
              y: 0,
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

          /*
           * Only the first text item starts in
           * the vertical centre.
           *
           * All following items wait below.
           */
          items.forEach((item, index) => {
            gsap.set(item, {
              autoAlpha: index === 0 ? 1 : 0,
              y: index === 0 ? 0 : travelDistance,
              pointerEvents: index === 0 ? "auto" : "none",
              force3D: true,
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
               * Snap to the exact timeline labels.
               * Each label represents one text item
               * positioned clearly in the centre.
               */
              snap: {
                snapTo: "labelsDirectional",

                duration: {
                  min: 0.28,
                  max: mobile ? 0.5 : 0.7,
                },

                delay: mobile ? 0.16 : 0.12,
                ease: "power2.inOut",
                inertia: false,
              },
            },
          });

          /*
           * First readable state.
           */
          timeline.addLabel("item-0", 0);

          /*
           * Each transition has four phases:
           *
           * 1. Reading hold in the centre.
           * 2. Current item exits toward the top.
           * 3. Short empty gap.
           * 4. Next item enters from below.
           */
          for (let index = 0; index < items.length - 1; index += 1) {
            const currentItem = items[index];
            const nextItem = items[index + 1];

            /*
             * Keep the current item readable
             * before beginning its exit.
             */
            timeline.to(
              {},
              {
                duration: mobile ? 0.16 : 0.22,
              },
            );

            /*
             * Current text moves clearly above
             * the centre and fades away.
             */
            timeline.to(currentItem, {
              autoAlpha: 0,
              y: -travelDistance,
              pointerEvents: "none",
              duration: mobile ? 0.28 : 0.32,
              ease: "power2.in",
            });

            /*
             * Intentional breathing space.
             * This prevents both texts from
             * overlapping in the centre.
             */
            timeline.to(
              {},
              {
                duration: mobile ? 0.1 : 0.14,
              },
            );

            /*
             * Next text begins below the centre
             * and rises into its reading position.
             */
            timeline.fromTo(
              nextItem,
              {
                autoAlpha: 0,
                y: travelDistance,
                pointerEvents: "none",
              },
              {
                autoAlpha: 1,
                y: 0,
                pointerEvents: "auto",
                duration: mobile ? 0.38 : 0.44,
                ease: "power3.out",
              },
            );

            /*
             * Snap destination for this item.
             */
            timeline.addLabel(`item-${index + 1}`);
          }

          /*
           * Give the final item a little scroll
           * distance before the sticky scene releases.
           */
          timeline.to(
            {},
            {
              duration: mobile ? 0.18 : 0.24,
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
            {amenitiesData.map((item) => (
              <span key={item.title} className={styles.progressLine} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
