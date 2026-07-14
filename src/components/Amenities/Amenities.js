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
  const progressRefs = useRef([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      const imagePanel = imagePanelRef.current;
      const contentPanel = contentPanelRef.current;

      const items = itemRefs.current.filter(Boolean);
      const progressLines = progressRefs.current.filter(Boolean);

      if (
        !section ||
        !sticky ||
        !imagePanel ||
        !contentPanel ||
        items.length !== amenitiesData.length
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
          const { mobile = false, reduceMotion = false } =
            context.conditions ?? {};

          const setActiveProgress = (activeIndex) => {
            progressLines.forEach((line, index) => {
              if (!line) {
                return;
              }

              line.dataset.active = index === activeIndex ? "true" : "false";
            });
          };

          if (reduceMotion) {
            gsap.set(sticky, {
              clipPath: "none",
            });

            gsap.set([imagePanel, contentPanel], {
              clearProps: "transform",
            });

            gsap.set(items, {
              position: "relative",
              autoAlpha: 1,
              y: 0,
              pointerEvents: "auto",
              clearProps: "transform",
            });

            progressLines.forEach((line) => {
              if (line) {
                line.dataset.active = "false";
              }
            });

            return;
          }

          /*
           * Motion settings.
           *
           * These values keep the animation smooth
           * and editorial without making it feel slow.
           */
          const travelDistance = mobile ? 64 : 88;
          const openingHold = mobile ? 0.26 : 0.34;
          const readingHold = mobile ? 0.24 : 0.32;
          const exitDuration = mobile ? 0.4 : 0.46;
          const emptyGap = mobile ? 0.04 : 0.06;
          const enterDuration = mobile ? 0.56 : 0.64;
          const finalHold = mobile ? 0.32 : 0.4;

          /*
           * Initial section reveal from bottom to top.
           */
          gsap.set(sticky, {
            clipPath: "inset(100% 0% 0% 0%)",
          });

          const revealTween = gsap.to(sticky, {
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
           * Subtle image settling movement.
           */
          const imageTween = gsap.fromTo(
            imagePanel,
            {
              yPercent: mobile ? 6 : 9,
              scale: mobile ? 1.025 : 1.035,
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
           * Right panel settles gently into place.
           */
          const contentTween = gsap.fromTo(
            contentPanel,
            {
              y: mobile ? 28 : 42,
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
           * Only the first item is initially visible.
           */
          items.forEach((item, index) => {
            gsap.set(item, {
              autoAlpha: index === 0 ? 1 : 0,
              y: index === 0 ? 0 : travelDistance,
              pointerEvents: index === 0 ? "auto" : "none",
              force3D: true,
            });
          });

          setActiveProgress(0);

          let activeProgressIndex = 0;

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",

              scrub: mobile ? 0.65 : 0.9,
              invalidateOnRefresh: true,

              snap: {
                snapTo: "labelsDirectional",

                duration: {
                  min: 0.35,
                  max: mobile ? 0.62 : 0.82,
                },

                delay: mobile ? 0.2 : 0.16,
                ease: "power2.inOut",
                inertia: false,
              },

              onUpdate: () => {
                const duration = timeline.duration();

                if (!duration) {
                  return;
                }

                const currentTime = timeline.time();

                let nearestIndex = 0;
                let nearestDistance = Number.POSITIVE_INFINITY;

                amenitiesData.forEach((_, index) => {
                  const labelTime = timeline.labels[`item-${index}`];

                  if (typeof labelTime !== "number") {
                    return;
                  }

                  const distance = Math.abs(currentTime - labelTime);

                  if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                  }
                });

                if (nearestIndex !== activeProgressIndex) {
                  activeProgressIndex = nearestIndex;
                  setActiveProgress(nearestIndex);
                }
              },
            },
          });

          /*
           * First stable reading state.
           */
          timeline.addLabel("item-0", 0);

          /*
           * Give the first item enough time to be read
           * before starting the transition sequence.
           */
          timeline.to(
            {},
            {
              duration: openingHold,
            },
          );

          amenitiesData.slice(0, -1).forEach((_, index) => {
            const currentItem = items[index];
            const nextItem = items[index + 1];

            /*
             * Stable reading period.
             */
            timeline.to(
              {},
              {
                duration: readingHold,
              },
            );

            /*
             * Current content exits upward.
             */
            timeline.to(currentItem, {
              autoAlpha: 0,
              y: -travelDistance,
              pointerEvents: "none",
              duration: exitDuration,
              ease: "power2.inOut",
            });

            /*
             * Small visual pause between items.
             */
            timeline.to(
              {},
              {
                duration: emptyGap,
              },
            );

            /*
             * Next content rises smoothly from below.
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
                duration: enterDuration,
                ease: "power3.out",
              },
            );

            timeline.addLabel(`item-${index + 1}`);
          });

          /*
           * Keep the final item readable before
           * the sticky section releases.
           */
          timeline.to(
            {},
            {
              duration: finalHold,
            },
          );

          return () => {
            timeline.kill();
            revealTween.kill();
            imageTween.kill();
            contentTween.kill();
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
      id="amenities"
      className={styles.amenities}
      style={{
        "--amenities-height": `${amenitiesData.length * 100}svh`,
        "--amenities-mobile-height": `${amenitiesData.length * 90}svh`,
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

          <button
            type="button"
            className={styles.requestLink}
            data-contact-popup
          >
            Submit Request
          </button>

          <div className={styles.progress} aria-hidden="true">
            {amenitiesData.map((item, index) => (
              <span
                key={item.title}
                ref={(element) => {
                  progressRefs.current[index] = element;
                }}
                className={styles.progressLine}
                data-active={index === 0 ? "true" : "false"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
