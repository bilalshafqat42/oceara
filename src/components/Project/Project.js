"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Project.module.css";

const projectContent = {
  intro: {
    eyebrow: "A Residential",
    title: "Retreat On Dubai Islands",
    buttonLabel: "Submit Request",
  },

  description:
    "Oceara Park Views is a mid-rise residential development comprising 63 thoughtfully designed residences, offering a curated collection of 1–3 bedroom apartments and 3–4 bedroom townhouses. Defined by clean architectural lines, expansive terraces and light-filled interiors, every residence is designed to strengthen the connection between indoor comfort and outdoor living.",

  location:
    "Set within Dubai Islands, this distinctive address occupies a unique position where expansive parkland meets the coastline. Defined by open outlooks, natural surroundings and a sense of separation from the pace of the city, it offers a residential environment shaped by space, calm and connection to nature.",
};

const progressLabels = [
  "project-intro",
  "project-description",
  "project-location",
];

export default function Project() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);

  const imageSceneRef = useRef(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const introRef = useRef(null);
  const introContentRef = useRef(null);

  const beigeSceneRef = useRef(null);
  const descriptionOneRef = useRef(null);
  const descriptionTwoRef = useRef(null);

  const progressRefs = useRef([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const sticky = stickyRef.current;

      const imageScene = imageSceneRef.current;
      const image = imageRef.current;
      const overlay = overlayRef.current;
      const intro = introRef.current;
      const introContent = introContentRef.current;

      const beigeScene = beigeSceneRef.current;
      const descriptionOne = descriptionOneRef.current;
      const descriptionTwo = descriptionTwoRef.current;

      const progressLines = progressRefs.current.filter(Boolean);

      if (
        !section ||
        !sticky ||
        !imageScene ||
        !image ||
        !overlay ||
        !intro ||
        !introContent ||
        !beigeScene ||
        !descriptionOne ||
        !descriptionTwo
      ) {
        return undefined;
      }

      const introChildren = Array.from(introContent.children);
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

            gsap.set(
              [
                imageScene,
                image,
                overlay,
                intro,
                ...introChildren,
                beigeScene,
                descriptionOne,
                descriptionTwo,
              ],
              {
                clearProps: "all",
                autoAlpha: 1,
                x: 0,
                y: 0,
                yPercent: 0,
              },
            );

            progressLines.forEach((line) => {
              if (line) {
                line.dataset.active = "false";
              }
            });

            return undefined;
          }

          /*
           * Initial scene state.
           */
          gsap.set(sticky, {
            clipPath: "inset(100% 0% 0% 0%)",
          });

          gsap.set(imageScene, {
            yPercent: 0,
          });

          /*
           * A smaller starting scale keeps the
           * architectural image sharper.
           */
          gsap.set(image, {
            scale: mobile ? 1.04 : 1.06,
            yPercent: mobile ? 3 : 5,
            transformOrigin: "center center",
          });

          gsap.set(overlay, {
            opacity: 0.42,
          });

          gsap.set(intro, {
            autoAlpha: 0,
            y: mobile ? 52 : 76,
            pointerEvents: "none",
          });

          gsap.set(introChildren, {
            autoAlpha: 0,
            y: mobile ? 20 : 28,
          });

          gsap.set(beigeScene, {
            yPercent: 100,
          });

          gsap.set([descriptionOne, descriptionTwo], {
            autoAlpha: 0,
            y: mobile ? 38 : 58,
            pointerEvents: "none",
          });

          setActiveProgress(0);

          /*
           * Phase 1:
           * reveal the complete Project section.
           */
          const entranceTimeline = gsap.timeline({
            defaults: {
              ease: "none",
            },

            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",

              scrub: mobile ? 0.55 : 0.8,
              invalidateOnRefresh: true,
            },
          });

          entranceTimeline
            .to(
              sticky,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
              },
              0,
            )
            .to(
              image,
              {
                scale: 1,
                yPercent: 0,
                duration: 1,
              },
              0,
            )
            .to(
              overlay,
              {
                opacity: 1,
                duration: 1,
              },
              0,
            );

          let activeProgressIndex = 0;

          /*
           * Phase 2:
           * complete Project storytelling sequence.
           */
          const storyTimeline = gsap.timeline({
            defaults: {
              ease: "none",
            },

            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",

              scrub: mobile ? 0.65 : 0.95,
              invalidateOnRefresh: true,

              snap: {
                snapTo: "labelsDirectional",

                duration: {
                  min: 0.35,
                  max: mobile ? 0.65 : 0.9,
                },

                delay: mobile ? 0.17 : 0.12,
                ease: "power2.inOut",
                inertia: false,
              },

              onUpdate: () => {
                const currentTime = storyTimeline.time();

                let nearestIndex = 0;
                let nearestDistance = Number.POSITIVE_INFINITY;

                progressLabels.forEach((label, index) => {
                  const labelTime = storyTimeline.labels[label];

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

              onRefresh: () => {
                const currentTime = storyTimeline.time();

                let nearestIndex = 0;
                let nearestDistance = Number.POSITIVE_INFINITY;

                progressLabels.forEach((label, index) => {
                  const labelTime = storyTimeline.labels[label];

                  if (typeof labelTime !== "number") {
                    return;
                  }

                  const distance = Math.abs(currentTime - labelTime);

                  if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                  }
                });

                activeProgressIndex = nearestIndex;
                setActiveProgress(nearestIndex);
              },
            },
          });

          storyTimeline
            /*
             * Intro card enters.
             */
            .to(intro, {
              autoAlpha: 1,
              y: 0,
              pointerEvents: "auto",
              duration: mobile ? 0.42 : 0.5,
              ease: "power3.out",
            })
            .to(
              introChildren,
              {
                autoAlpha: 1,
                y: 0,
                duration: mobile ? 0.3 : 0.38,
                stagger: 0.07,
                ease: "power3.out",
              },
              "-=0.24",
            )
            .addLabel("project-intro")

            /*
             * Intro reading time.
             */
            .to(
              {},
              {
                duration: mobile ? 0.48 : 0.66,
              },
            )

            /*
             * Building and intro composition move upward.
             *
             * A slight overlap prevents a one-pixel seam
             * between the image and beige scenes.
             */
            .to(imageScene, {
              yPercent: -101,
              duration: mobile ? 0.9 : 1.1,
              ease: "power2.inOut",
            })
            .to(
              beigeScene,
              {
                yPercent: 0,
                duration: mobile ? 0.9 : 1.1,
                ease: "power2.inOut",
              },
              "<",
            )

            /*
             * First editorial paragraph.
             */
            .to(descriptionOne, {
              autoAlpha: 1,
              y: 0,
              pointerEvents: "auto",
              duration: mobile ? 0.44 : 0.55,
              ease: "power3.out",
            })
            .addLabel("project-description")

            /*
             * First paragraph reading time.
             */
            .to(
              {},
              {
                duration: mobile ? 0.58 : 0.82,
              },
            )

            /*
             * First paragraph exits upward.
             */
            .to(descriptionOne, {
              autoAlpha: 0,
              y: mobile ? -34 : -52,
              pointerEvents: "none",
              duration: mobile ? 0.38 : 0.48,
              ease: "power2.inOut",
            })

            /*
             * Small pause between paragraphs.
             */
            .to(
              {},
              {
                duration: mobile ? 0.08 : 0.12,
              },
            )

            /*
             * Second editorial paragraph.
             */
            .to(descriptionTwo, {
              autoAlpha: 1,
              y: 0,
              pointerEvents: "auto",
              duration: mobile ? 0.44 : 0.55,
              ease: "power3.out",
            })
            .addLabel("project-location")

            /*
             * Final reading time.
             */
            .to(
              {},
              {
                duration: mobile ? 0.68 : 0.95,
              },
            );

          return () => {
            entranceTimeline.kill();
            storyTimeline.kill();
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
      aria-labelledby="project-section-title"
    >
      <div ref={stickyRef} className={styles.stickyViewport}>
        <h2 id="project-section-title" className={styles.visuallyHidden}>
          Oceara Park Views project
        </h2>

        {/* Building and intro composition */}
        <div ref={imageSceneRef} className={styles.imageScene}>
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

          <article
            ref={introRef}
            className={styles.introCard}
            aria-label="Oceara residential retreat"
          >
            <div ref={introContentRef} className={styles.introContent}>
              <div>
                <p className={styles.eyebrow}>{projectContent.intro.eyebrow}</p>

                <h3 className={styles.title}>{projectContent.intro.title}</h3>
              </div>

              <button
                type="button"
                className={styles.requestLink}
                data-contact-popup
              >
                {projectContent.intro.buttonLabel}
              </button>
            </div>
          </article>
        </div>

        {/* Beige editorial composition */}
        <div ref={beigeSceneRef} className={styles.beigeScene}>
          <article
            ref={descriptionOneRef}
            className={`${styles.descriptionBlock} ${styles.descriptionRight}`}
          >
            <p>{projectContent.description}</p>
          </article>

          <article
            ref={descriptionTwoRef}
            className={`${styles.descriptionBlock} ${styles.descriptionLeft}`}
          >
            <p>{projectContent.location}</p>
          </article>
        </div>

        <div className={styles.progress} aria-hidden="true">
          {progressLabels.map((label, index) => (
            <span
              key={label}
              ref={(element) => {
                progressRefs.current[index] = element;
              }}
              className={styles.progressLine}
              data-active={index === 0 ? "true" : "false"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
