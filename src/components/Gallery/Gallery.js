"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Gallery.module.css";

const galleryItems = [
  {
    image: "/images/gallery/gall1.jpg",
    alt: "Hot stone wellness treatment",
    title: "Wellness Resort",
    description:
      "Born from the fluidity of nature, Oceara is designed around restorative experiences and everyday wellbeing.",
  },
  {
    image: "/images/gallery/gall2.jpg",
    alt: "Woman enjoying an active outdoor lifestyle",
    title: "Active Living",
    description:
      "Thoughtfully planned spaces encourage movement, recreation and a more balanced way of living.",
  },
  {
    image: "/images/gallery/gall3.jpg",
    alt: "Landscaped outdoor community retreat",
    title: "Nature Retreat",
    description:
      "Immersive landscaped spaces create quiet moments for reflection, connection and relaxation.",
  },
  {
    image: "/images/gallery/gall4.jpg",
    alt: "Resort-inspired outdoor lifestyle",
    title: "Resort Moments",
    description:
      "Everyday life is elevated through carefully considered leisure spaces and resort-inspired surroundings.",
  },
];

export default function Gallery() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const activeIndexRef = useRef(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const cards = cardRefs.current.filter(Boolean);

      if (!section || !viewport || !track || cards.length === 0) {
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
            gsap.set(track, {
              clearProps: "transform",
            });

            cards.forEach((card) => {
              card.dataset.active = "true";
            });

            return;
          }

          const setActiveCard = (nextIndex) => {
            const safeIndex = gsap.utils.clamp(0, cards.length - 1, nextIndex);

            if (safeIndex === activeIndexRef.current) {
              return;
            }

            activeIndexRef.current = safeIndex;

            cards.forEach((card, index) => {
              card.dataset.active = index === safeIndex ? "true" : "false";
            });
          };

          /*
           * Ensure only the first image starts active.
           */
          cards.forEach((card, index) => {
            card.dataset.active = index === 0 ? "true" : "false";
          });

          activeIndexRef.current = 0;

          /*
           * The actual horizontal travel is measured
           * from the track instead of assuming fixed sizes.
           */
          const getHorizontalDistance = () => {
            return Math.max(0, track.scrollWidth - window.innerWidth);
          };

          const horizontalTween = gsap.to(track, {
            x: () => -getHorizontalDistance(),
            ease: "none",

            scrollTrigger: {
              trigger: section,
              start: "top top",

              /*
               * Each card receives approximately one
               * viewport of vertical scroll distance.
               */
              end: () => `+=${window.innerHeight * (cards.length - 1)}`,

              pin: viewport,
              pinSpacing: true,
              scrub: mobile ? 0.55 : 0.85,
              anticipatePin: 1,
              invalidateOnRefresh: true,

              snap: {
                snapTo: 1 / (cards.length - 1),

                duration: {
                  min: 0.3,
                  max: mobile ? 0.55 : 0.75,
                },

                delay: mobile ? 0.14 : 0.1,
                ease: "power2.inOut",
                inertia: false,
              },

              onUpdate: (self) => {
                const nextIndex = Math.round(
                  self.progress * (cards.length - 1),
                );

                setActiveCard(nextIndex);
              },

              onRefresh: (self) => {
                const nextIndex = Math.round(
                  self.progress * (cards.length - 1),
                );

                activeIndexRef.current = -1;
                setActiveCard(nextIndex);
              },
            },
          });

          return () => {
            horizontalTween.kill();
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
      id="gallery"
      className={styles.gallery}
      aria-labelledby="gallery-title"
    >
      <div ref={viewportRef} className={styles.viewport}>
        <header className={styles.headingGroup}>
          <p className={styles.eyebrow}>Designed</p>

          <h2 id="gallery-title" className={styles.heading}>
            Around Life&apos;s Better Moments
          </h2>
        </header>

        <div className={styles.galleryWindow}>
          <div ref={trackRef} className={styles.track}>
            {galleryItems.map((item, index) => (
              <article
                key={item.image}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className={styles.card}
                data-active={index === 0 ? "true" : "false"}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    quality={90}
                    sizes="(max-width: 767px) 76vw, 590px"
                    className={styles.image}
                  />
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>

                  <p className={styles.cardDescription}>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.progress} aria-hidden="true">
          {galleryItems.map((item, index) => (
            <span
              key={item.image}
              className={styles.progressItem}
              data-progress-index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
