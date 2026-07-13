"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

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

const getLoopedIndex = (index) => {
  return (index + galleryItems.length) % galleryItems.length;
};

export default function Gallery() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const carouselRef = useRef(null);

  const cardRefs = useRef([]);
  const imageWrapperRefs = useRef([]);
  const contentRefs = useRef([]);

  const activeIndexRef = useRef(0);
  const animationRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  /*
   * Exact Figma dimensions on desktop:
   *
   * Centre image: 670 × 768
   * Side image:   210 × 446
   *
   * Side vertical offset:
   * 768 - 446 = 322px
   *
   * That makes the side images align with the
   * bottom edge of the centre image.
   */
  const getResponsiveSizes = useCallback(() => {
    const viewportWidth = carouselRef.current?.clientWidth || window.innerWidth;

    if (viewportWidth <= 480) {
      const centreWidth = viewportWidth * 0.78;
      const centreHeight = centreWidth * (768 / 670);

      const sideWidth = Math.max(48, viewportWidth * 0.11);
      const sideHeight = sideWidth * (446 / 210);

      return {
        centreWidth,
        centreHeight,
        sideWidth,
        sideHeight,
        sideYOffset: centreHeight - sideHeight,
      };
    }

    if (viewportWidth <= 767) {
      const centreWidth = viewportWidth * 0.74;
      const centreHeight = centreWidth * (768 / 670);

      const sideWidth = Math.max(62, viewportWidth * 0.13);
      const sideHeight = sideWidth * (446 / 210);

      return {
        centreWidth,
        centreHeight,
        sideWidth,
        sideHeight,
        sideYOffset: centreHeight - sideHeight,
      };
    }

    if (viewportWidth <= 1024) {
      const centreWidth = Math.min(560, viewportWidth * 0.58);
      const centreHeight = centreWidth * (768 / 670);

      const sideWidth = 138;
      const sideHeight = sideWidth * (446 / 210);

      return {
        centreWidth,
        centreHeight,
        sideWidth,
        sideHeight,
        sideYOffset: centreHeight - sideHeight,
      };
    }

    if (viewportWidth <= 1350) {
      const centreWidth = Math.min(620, viewportWidth * 0.5);
      const centreHeight = centreWidth * (768 / 670);

      const sideWidth = 175;
      const sideHeight = sideWidth * (446 / 210);

      return {
        centreWidth,
        centreHeight,
        sideWidth,
        sideHeight,
        sideYOffset: centreHeight - sideHeight,
      };
    }

    return {
      centreWidth: 670,
      centreHeight: 768,
      sideWidth: 210,
      sideHeight: 446,
      sideYOffset: 322,
    };
  }, []);

  const getCardPosition = useCallback((cardIndex, nextActiveIndex) => {
    if (cardIndex === nextActiveIndex) {
      return "centre";
    }

    if (cardIndex === getLoopedIndex(nextActiveIndex - 1)) {
      return "left";
    }

    if (cardIndex === getLoopedIndex(nextActiveIndex + 1)) {
      return "right";
    }

    return "hidden";
  }, []);

const getCardState = useCallback(
  (cardIndex, nextActiveIndex) => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return null;
    }

    const {
      centreWidth,
      centreHeight,
      sideWidth,
      sideHeight,
      sideYOffset,
    } = getResponsiveSizes();

    const carouselWidth = carousel.clientWidth;
    const position = getCardPosition(cardIndex, nextActiveIndex);

    const leftX = -(carouselWidth / 2) + sideWidth / 2;
    const rightX = carouselWidth / 2 - sideWidth / 2;

    if (position === "centre") {
      return {
        position: "centre",
        x: 0,
        y: 0,
        width: centreWidth,
        imageHeight: centreHeight,
        cardOpacity: 1,
        contentOpacity: 1,
        contentY: 0,
        visibility: "visible",
        zIndex: 4,
        pointerEvents: "auto",
      };
    }

    if (position === "left") {
      return {
        position: "left",
        x: leftX,
        y: sideYOffset,
        width: sideWidth,
        imageHeight: sideHeight,
        cardOpacity: 0.62,
        contentOpacity: 0,
        contentY: 14,
        visibility: "visible",
        zIndex: 2,
        pointerEvents: "auto",
      };
    }

    if (position === "right") {
      return {
        position: "right",
        x: rightX,
        y: sideYOffset,
        width: sideWidth,
        imageHeight: sideHeight,
        cardOpacity: 0.62,
        contentOpacity: 0,
        contentY: 14,
        visibility: "visible",
        zIndex: 2,
        pointerEvents: "auto",
      };
    }

    return {
      position: "hidden",
      x: 0,
      y: sideYOffset,
      width: sideWidth,
      imageHeight: sideHeight,
      cardOpacity: 0,
      contentOpacity: 0,
      contentY: 14,
      visibility: "hidden",
      zIndex: 1,
      pointerEvents: "none",
    };
  },
  [getCardPosition, getResponsiveSizes],
);

  const positionCards = useCallback(
    ({ nextActiveIndex, immediate = false, duration = 0.95, onComplete }) => {
      const cards = cardRefs.current;
      const imageWrappers = imageWrapperRefs.current;
      const contents = contentRefs.current;

      if (
        cards.filter(Boolean).length !== galleryItems.length ||
        imageWrappers.filter(Boolean).length !== galleryItems.length ||
        contents.filter(Boolean).length !== galleryItems.length
      ) {
        onComplete?.();
        return;
      }

      animationRef.current?.kill();

      /*
       * Immediate positioning is used during the first render
       * and browser resizing.
       */
      if (immediate) {
        cards.forEach((card, index) => {
          const imageWrapper = imageWrappers[index];
          const content = contents[index];
          const state = getCardState(index, nextActiveIndex);

          if (!card || !imageWrapper || !content || !state) {
            return;
          }

          card.dataset.position = state.position;

          gsap.set(card, {
            xPercent: -50,
            x: state.x,
            y: state.y,
            width: state.width,
            autoAlpha: state.cardOpacity,
            visibility: state.visibility,
            zIndex: state.zIndex,
            pointerEvents: state.pointerEvents,
          });

          gsap.set(imageWrapper, {
            height: state.imageHeight,
          });

          gsap.set(content, {
            autoAlpha: state.contentOpacity,
            y: state.contentY,
          });
        });

        onComplete?.();
        return;
      }

      const timeline = gsap.timeline({
        defaults: {
          overwrite: "auto",
        },

        onComplete: () => {
          /*
           * Ensure every card finishes in its exact state.
           * This prevents leftover transforms after several loops.
           */
          cards.forEach((card, index) => {
            const state = getCardState(index, nextActiveIndex);

            if (!card || !state) {
              return;
            }

            card.dataset.position = state.position;

            gsap.set(card, {
              visibility: state.visibility,
              pointerEvents: state.pointerEvents,
              zIndex: state.zIndex,
            });
          });

          animationRef.current = null;
          onComplete?.();
        },
      });

      animationRef.current = timeline;

      cards.forEach((card, index) => {
        const imageWrapper = imageWrappers[index];
        const content = contents[index];
        const state = getCardState(index, nextActiveIndex);

        if (!card || !imageWrapper || !content || !state) {
          return;
        }

        const previousPosition = card.dataset.position;
        const isCurrentlyHidden = previousPosition === "hidden";
        const willBecomeHidden = state.position === "hidden";

        /*
         * The card that was previously hidden must not travel
         * behind the centre image.
         *
         * Position it immediately at its new side location while
         * invisible, then fade it in gently.
         */
        if (isCurrentlyHidden && !willBecomeHidden) {
          gsap.set(card, {
            xPercent: -50,
            x: state.x,
            y: state.y,
            width: state.width,
            autoAlpha: 0,
            visibility: "visible",
            zIndex: state.zIndex,
            pointerEvents: "none",
          });

          gsap.set(imageWrapper, {
            height: state.imageHeight,
          });

          gsap.set(content, {
            autoAlpha: 0,
            y: state.contentY,
          });

          card.dataset.position = state.position;

          timeline.to(
            card,
            {
              autoAlpha: state.cardOpacity,
              pointerEvents: state.pointerEvents,
              duration: 0.42,
              ease: "power2.out",
            },
            duration * 0.48,
          );

          return;
        }

        /*
         * A card leaving the visible carousel fades out in its
         * current position. It does not travel behind the others.
         */
        if (willBecomeHidden) {
          timeline.to(
            content,
            {
              autoAlpha: 0,
              y: 14,
              duration: 0.2,
              ease: "power2.in",
            },
            0,
          );

          timeline.to(
            card,
            {
              autoAlpha: 0,
              pointerEvents: "none",
              duration: 0.35,
              ease: "power2.in",
            },
            0,
          );

          timeline.set(
            card,
            {
              visibility: "hidden",
              zIndex: 1,
            },
            0.36,
          );

          timeline.set(
            imageWrapper,
            {
              height: state.imageHeight,
            },
            0.36,
          );

          card.dataset.position = "hidden";

          return;
        }

        /*
         * Normal visible movement:
         *
         * side → centre
         * centre → side
         */
        card.dataset.position = state.position;

        timeline.to(
          card,
          {
            xPercent: -50,
            x: state.x,
            y: state.y,
            width: state.width,
            autoAlpha: state.cardOpacity,
            visibility: "visible",
            zIndex: state.zIndex,
            pointerEvents: state.pointerEvents,
            duration,
            ease: "power3.inOut",
          },
          0,
        );

        timeline.to(
          imageWrapper,
          {
            height: state.imageHeight,
            duration,
            ease: "power3.inOut",
          },
          0,
        );

        if (state.position === "centre") {
          timeline.to(
            content,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.46,
              ease: "power3.out",
            },
            duration * 0.52,
          );
        } else {
          timeline.to(
            content,
            {
              autoAlpha: 0,
              y: 14,
              duration: 0.22,
              ease: "power2.in",
            },
            0,
          );
        }
      });
    },
    [getCardState],
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      const carousel = carouselRef.current;

      if (!section || !heading || !carousel) {
        return;
      }

      positionCards({
        nextActiveIndex: activeIndexRef.current,
        immediate: true,
      });

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile = false, reduceMotion = false } =
            context.conditions ?? {};

          if (reduceMotion) {
            gsap.set(heading.children, {
              autoAlpha: 1,
              y: 0,
            });

            return;
          }

          gsap.set(heading.children, {
            autoAlpha: 0,
            y: mobile ? 20 : 32,
          });

          const visibleCards = cardRefs.current.filter(Boolean);

          gsap.set(visibleCards, {
            autoAlpha: 0,
          });

          const entranceTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              once: true,
            },
          });

          entranceTimeline
            .to(heading.children, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
            })
            .to(
              visibleCards,
              {
                autoAlpha: (index) => {
                  const position = visibleCards[index]?.dataset.position;

                  if (position === "centre") {
                    return 1;
                  }

                  if (position === "left" || position === "right") {
                    return 0.62;
                  }

                  return 0;
                },
                duration: 0.85,
                stagger: 0.06,
                ease: "power3.out",
              },
              "-=0.42",
            );

          return () => {
            entranceTimeline.kill();
          };
        },
      );

      let resizeTimer;

      const handleResize = () => {
        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(() => {
          positionCards({
            nextActiveIndex: activeIndexRef.current,
            immediate: true,
          });
        }, 100);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", handleResize);

        animationRef.current?.kill();
        matchMedia.revert();
      };
    },
    {
      scope: sectionRef,
    },
  );

  const selectSlide = useCallback(
    (nextIndex) => {
      if (isAnimating || nextIndex === activeIndexRef.current) {
        return;
      }

      setIsAnimating(true);

      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);

      positionCards({
        nextActiveIndex: nextIndex,
        duration: 1,

        onComplete: () => {
          setIsAnimating(false);
        },
      });
    },
    [isAnimating, positionCards],
  );

  const showPrevious = useCallback(() => {
    selectSlide(getLoopedIndex(activeIndexRef.current - 1));
  }, [selectSlide]);

  const showNext = useCallback(() => {
    selectSlide(getLoopedIndex(activeIndexRef.current + 1));
  }, [selectSlide]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    },
    [showPrevious, showNext],
  );

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className={styles.gallery}
      aria-labelledby="gallery-title"
      onKeyDown={handleKeyDown}
    >
      <header ref={headingRef} className={styles.headingGroup}>
        <p className={styles.eyebrow}>Designed</p>

        <h2 id="gallery-title" className={styles.heading}>
          Around Life&apos;s Better Moments
        </h2>
      </header>

      <div
        ref={carouselRef}
        className={styles.carousel}
        role="region"
        aria-roledescription="carousel"
        aria-label="Oceara lifestyle gallery"
      >
        {galleryItems.map((item, index) => {
          const initialPosition =
            index === 0
              ? "centre"
              : index === 1
                ? "right"
                : index === galleryItems.length - 1
                  ? "left"
                  : "hidden";

          return (
            <article
              key={item.image}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className={styles.card}
              data-position={initialPosition}
            >
              <button
                type="button"
                className={styles.cardButton}
                disabled={isAnimating || index === activeIndex}
                aria-label={
                  index === activeIndex
                    ? `${item.title}, current image`
                    : `Show ${item.title}`
                }
                onClick={() => selectSlide(index)}
              >
                <span
                  ref={(element) => {
                    imageWrapperRefs.current[index] = element;
                  }}
                  className={styles.imageWrapper}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    quality={90}
                    sizes="(max-width: 767px) 78vw, 670px"
                    className={styles.image}
                  />
                </span>
              </button>

              <div
                ref={(element) => {
                  contentRefs.current[index] = element;
                }}
                className={styles.cardContent}
              >
                <h3 className={styles.cardTitle}>{item.title}</h3>

                <p className={styles.cardDescription}>{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.pagination} aria-label="Gallery pagination">
        {galleryItems.map((item, index) => (
          <button
            key={item.image}
            type="button"
            className={styles.paginationButton}
            data-active={index === activeIndex ? "true" : "false"}
            aria-label={`Show ${item.title}`}
            aria-current={index === activeIndex ? "true" : undefined}
            disabled={isAnimating}
            onClick={() => selectSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
