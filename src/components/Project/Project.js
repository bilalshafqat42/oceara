"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Project.module.css";

const projectSlides = [
  {
    id: "project-intro",
    type: "intro",
    eyebrow: "A Residential",
    title: "Retreat On Dubai Islands",
    linkLabel: "Submit Request",
    href: "#contact",
  },
  {
    id: "project-description",
    type: "descriptionRight",
    text: "Oceara Park Views is a mid-rise residential development comprising 63 thoughtfully designed residences, offering a curated collection of 1–3 bedroom apartments and 3–4 bedroom townhouses. Defined by clean architectural lines, expansive terraces and light-filled interiors, every residence is designed to strengthen the connection between indoor comfort and outdoor living.",
  },
  {
    id: "project-location",
    type: "descriptionLeft",
    text: "Set within Dubai Islands, this distinctive address occupies a unique position where expansive parkland meets the coastline. Defined by open outlooks, natural surroundings and a sense of separation from the pace of the city, it offers a residential environment shaped by space, calm and connection to nature.",
  },
];

export default function Project() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const slideRefs = useRef([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      const image = imageRef.current;
      const overlay = overlayRef.current;
      const slides = slideRefs.current.filter(Boolean);

      if (!section || !sticky || !image || !overlay || slides.length === 0) {
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

            gsap.set(image, {
              clearProps: "transform",
            });

            gsap.set(slides, {
              position: "relative",
              autoAlpha: 1,
              y: 0,
              pointerEvents: "auto",
            });

            return;
          }

          /*
           * Premium transition settings.
           * These control the text movement only.
           */
          const travelDistance = mobile ? 68 : 96;
          const readingHold = mobile ? 0.24 : 0.32;
          const exitDuration = mobile ? 0.42 : 0.5;
          const emptyGap = mobile ? 0.04 : 0.06;
          const enterDuration = mobile ? 0.58 : 0.68;

          /*
           * Reveal the complete Project scene
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
           * Subtle internal background movement.
           * The image remains fixed while its content
           * gently settles into place.
           */
          gsap.fromTo(
            image,
            {
              scale: 1.08,
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

          gsap.fromTo(
            overlay,
            {
              opacity: 0.45,
            },
            {
              opacity: 1,
              ease: "none",

              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: mobile ? 0.55 : 0.75,
              },
            },
          );

          /*
           * Only the first composition starts visible.
           * The remaining compositions wait below.
           */
          slides.forEach((slide, index) => {
            gsap.set(slide, {
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

              scrub: mobile ? 0.65 : 0.95,
              invalidateOnRefresh: true,

              /*
               * Each label represents a stable,
               * fully readable composition.
               */
              snap: {
                snapTo: "labelsDirectional",

                duration: {
                  min: 0.35,
                  max: mobile ? 0.6 : 0.82,
                },

                delay: mobile ? 0.16 : 0.12,
                ease: "power2.inOut",
                inertia: false,
              },
            },
          });

          timeline.addLabel("project-slide-0", 0);

          for (let index = 0; index < slides.length - 1; index += 1) {
            const currentSlide = slides[index];
            const nextSlide = slides[index + 1];

            /*
             * Hold the current composition briefly
             * in its readable position.
             */
            timeline.to(
              {},
              {
                duration: readingHold,
              },
            );

            /*
             * Current composition exits upward.
             */
            timeline.to(currentSlide, {
              autoAlpha: 0,
              y: -travelDistance,
              pointerEvents: "none",
              duration: exitDuration,
              ease: "power2.inOut",
            });

            /*
             * Very short empty interval prevents
             * text overlap without feeling disconnected.
             */
            timeline.to(
              {},
              {
                duration: emptyGap,
              },
            );

            /*
             * Next composition rises from below
             * and settles in its designed position.
             */
            timeline.fromTo(
              nextSlide,
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

            timeline.addLabel(`project-slide-${index + 1}`);
          }

          /*
           * Allow the final paragraph to remain
           * readable before the scene releases.
           */
          timeline.to(
            {},
            {
              duration: mobile ? 0.25 : 0.32,
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
      id="project"
      className={styles.project}
      style={{
        "--project-slide-count": projectSlides.length,
      }}
      aria-labelledby="project-section-title"
    >
      <div ref={stickyRef} className={styles.stickyViewport}>
        <div className={styles.background}>
          <Image
            ref={imageRef}
            src="/images/project/building.jpg"
            alt="Oceara residential building overlooking Dubai Islands"
            fill
            quality={90}
            sizes="100vw"
            className={styles.backgroundImage}
          />

          <div
            ref={overlayRef}
            className={styles.backgroundOverlay}
            aria-hidden="true"
          />
        </div>

        <h2 id="project-section-title" className={styles.visuallyHidden}>
          Oceara Park Views project
        </h2>

        <div className={styles.slides}>
          {projectSlides.map((slide, index) => {
            const slideClassName = [styles.slide, styles[slide.type]]
              .filter(Boolean)
              .join(" ");

            return (
              <article
                key={slide.id}
                ref={(element) => {
                  slideRefs.current[index] = element;
                }}
                className={slideClassName}
              >
                {slide.type === "intro" ? (
                  <div className={styles.introCard}>
                    <div>
                      <p className={styles.eyebrow}>{slide.eyebrow}</p>

                      <h3 className={styles.title}>{slide.title}</h3>
                    </div>

                    <a href={slide.href} className={styles.requestLink}>
                      {slide.linkLabel}
                    </a>
                  </div>
                ) : (
                  <p className={styles.description}>{slide.text}</p>
                )}
              </article>
            );
          })}
        </div>

        <div className={styles.progress} aria-hidden="true">
          {projectSlides.map((slide) => (
            <span key={slide.id} className={styles.progressLine} />
          ))}
        </div>
      </div>
    </section>
  );
}
