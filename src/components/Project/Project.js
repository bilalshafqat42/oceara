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

      if (
        !section ||
        !sticky ||
        !image ||
        !overlay ||
        slides.length !== projectSlides.length
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
            gsap.set(sticky, {
              clipPath: "none",
            });

            gsap.set([image, overlay], {
              clearProps: "all",
            });

            gsap.set(slides, {
              position: "relative",
              autoAlpha: 1,
              y: 0,
              pointerEvents: "auto",
            });

            return undefined;
          }

          /*
           * Text movement and pacing settings.
           *
           * Increase slideTravel to create more distance
           * between the entering and exiting cards.
           *
           * Increase readingHold to leave each card visible longer.
           */
          const slideTravel = mobile ? 74 : 110;
          const entranceDuration = mobile ? 0.65 : 0.82;
          const readingHold = mobile ? 0.42 : 0.58;
          const exitDuration = mobile ? 0.52 : 0.68;
          const transitionGap = mobile ? 0.08 : 0.12;

          /*
           * Initial state:
           *
           * The entire project viewport is hidden below.
           * All text cards are also hidden.
           */
          gsap.set(sticky, {
            clipPath: "inset(100% 0% 0% 0%)",
          });

          gsap.set(image, {
            scale: mobile ? 1.06 : 1.1,
            yPercent: mobile ? 5 : 8,
            transformOrigin: "center center",
          });

          gsap.set(overlay, {
            opacity: 0.4,
          });

          slides.forEach((slide) => {
            gsap.set(slide, {
              autoAlpha: 0,
              y: slideTravel,
              pointerEvents: "none",
              force3D: true,
            });
          });

          /*
           * Phase 1:
           *
           * Reveal the complete background from bottom to top.
           *
           * This finishes before the text-card timeline starts.
           */
          const revealTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",

              scrub: mobile ? 0.55 : 0.8,
              invalidateOnRefresh: true,
            },
          });

          revealTimeline
            .to(
              sticky,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
                ease: "none",
              },
              0,
            )
            .to(
              image,
              {
                scale: 1,
                yPercent: 0,
                duration: 1,
                ease: "none",
              },
              0,
            )
            .to(
              overlay,
              {
                opacity: 1,
                duration: 1,
                ease: "none",
              },
              0,
            );

          /*
           * Phase 2:
           *
           * This timeline begins only after the background
           * has fully reached the top of the viewport.
           *
           * One text composition is shown at a time.
           */
          const slidesTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",

              scrub: mobile ? 0.7 : 1,
              invalidateOnRefresh: true,

              snap: {
                snapTo: "labelsDirectional",

                duration: {
                  min: 0.35,
                  max: mobile ? 0.65 : 0.9,
                },

                delay: mobile ? 0.16 : 0.12,
                ease: "power2.inOut",
                inertia: false,
              },
            },
          });

          /*
           * First card enters only after the image
           * has completed its full-screen reveal.
           */
          slidesTimeline
            .fromTo(
              slides[0],
              {
                autoAlpha: 0,
                y: slideTravel,
                pointerEvents: "none",
              },
              {
                autoAlpha: 1,
                y: 0,
                pointerEvents: "auto",
                duration: entranceDuration,
                ease: "power3.out",
              },
            )
            .addLabel("project-slide-0");

          /*
           * Each card:
           *
           * 1. Remains readable.
           * 2. Moves upward and fades out.
           * 3. Leaves a small empty transition.
           * 4. Allows the next card to rise from below.
           */
          for (let index = 0; index < slides.length - 1; index += 1) {
            const currentSlide = slides[index];
            const nextSlide = slides[index + 1];

            slidesTimeline
              .to(
                {},
                {
                  duration: readingHold,
                },
              )
              .to(currentSlide, {
                autoAlpha: 0,
                y: -slideTravel,
                pointerEvents: "none",
                duration: exitDuration,
                ease: "power2.inOut",
              })
              .to(
                {},
                {
                  duration: transitionGap,
                },
              )
              .fromTo(
                nextSlide,
                {
                  autoAlpha: 0,
                  y: slideTravel,
                  pointerEvents: "none",
                },
                {
                  autoAlpha: 1,
                  y: 0,
                  pointerEvents: "auto",
                  duration: entranceDuration,
                  ease: "power3.out",
                },
              )
              .addLabel(`project-slide-${index + 1}`);
          }

          /*
           * Keep the final paragraph visible before
           * releasing the sticky section.
           */
          slidesTimeline.to(
            {},
            {
              duration: mobile ? 0.45 : 0.62,
            },
          );

          return () => {
            revealTimeline.kill();
            slidesTimeline.kill();
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

                    <a
                      href={slide.href}
                      className={styles.requestLink}
                      data-contact-popup
                    >
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
