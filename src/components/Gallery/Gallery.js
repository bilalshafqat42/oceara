"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";

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

  const leftCardRef = useRef(null);
  const centreCardRef = useRef(null);
  const rightCardRef = useRef(null);

  const centreImageRef = useRef(null);
  const centreContentRef = useRef(null);

  const animationRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const previousIndex = getLoopedIndex(activeIndex - 1);
  const nextIndex = getLoopedIndex(activeIndex + 1);

  const previousItem = galleryItems[previousIndex];
  const activeItem = galleryItems[activeIndex];
  const nextItem = galleryItems[nextIndex];

  /*
   * Initial section entrance only.
   */
  useGSAP(
    () => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      const leftCard = leftCardRef.current;
      const centreCard = centreCardRef.current;
      const rightCard = rightCardRef.current;

      if (!section || !heading || !leftCard || !centreCard || !rightCard) {
        return;
      }

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
            gsap.set([...heading.children, leftCard, centreCard, rightCard], {
              clearProps: "all",
              autoAlpha: 1,
            });

            return;
          }

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              once: true,
            },
          });

          timeline
            .fromTo(
              heading.children,
              {
                autoAlpha: 0,
                y: mobile ? 22 : 34,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.85,
                stagger: 0.12,
                ease: "power3.out",
              },
            )
            .fromTo(
              centreCard,
              {
                autoAlpha: 0,
                y: mobile ? 32 : 48,
                scale: 0.95,
              },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.95,
                ease: "power3.out",
              },
              "-=0.48",
            )
            .fromTo(
              leftCard,
              {
                autoAlpha: 0,
                x: mobile ? -22 : -48,
              },
              {
                autoAlpha: 0.62,
                x: 0,
                duration: 0.82,
                ease: "power3.out",
              },
              "-=0.7",
            )
            .fromTo(
              rightCard,
              {
                autoAlpha: 0,
                x: mobile ? 22 : 48,
              },
              {
                autoAlpha: 0.62,
                x: 0,
                duration: 0.82,
                ease: "power3.out",
              },
              "<",
            );

          return () => {
            timeline.kill();
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

  const createMovingImage = useCallback((sourceWrapper) => {
    const sourceRect = sourceWrapper.getBoundingClientRect();
    const sourceImage = sourceWrapper.querySelector("img");

    if (!sourceImage) {
      return null;
    }

    const movingImage = document.createElement("div");

    movingImage.className = styles.movingImage;

    Object.assign(movingImage.style, {
      position: "fixed",
      top: `${sourceRect.top}px`,
      left: `${sourceRect.left}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      zIndex: "2000",
      overflow: "hidden",
      pointerEvents: "none",
      margin: "0",
      padding: "0",
      transformOrigin: "center center",
    });

    const clonedImage = sourceImage.cloneNode(true);

    Object.assign(clonedImage.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center center",
      transform: "none",
    });

    movingImage.appendChild(clonedImage);
    document.body.appendChild(movingImage);

    return movingImage;
  }, []);

  const changeSlide = useCallback(
    (direction) => {
      if (isAnimating) {
        return;
      }

      const selectedCard =
        direction > 0 ? rightCardRef.current : leftCardRef.current;

      const oppositeCard =
        direction > 0 ? leftCardRef.current : rightCardRef.current;

      const centreCard = centreCardRef.current;
      const centreImage = centreImageRef.current;
      const centreContent = centreContentRef.current;

      const selectedWrapper = selectedCard?.querySelector(
        `.${styles.sideImageWrapper}`,
      );

      if (
        !selectedCard ||
        !oppositeCard ||
        !centreCard ||
        !centreImage ||
        !centreContent ||
        !selectedWrapper
      ) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const updateGallery = () => {
        flushSync(() => {
          setActiveIndex((currentIndex) =>
            getLoopedIndex(currentIndex + direction),
          );
        });
      };

      if (reduceMotion) {
        updateGallery();
        setIsAnimating(false);
        return;
      }

      setIsAnimating(true);

      animationRef.current?.kill();

      const movingImage = createMovingImage(selectedWrapper);

      if (!movingImage) {
        updateGallery();
        setIsAnimating(false);
        return;
      }

      const sourceRect = selectedWrapper.getBoundingClientRect();
      const centreRect = centreImage.getBoundingClientRect();

      /*
       * The old centre image travels toward the opposite side.
       */
      const centreExitRect =
        oppositeCard
          .querySelector(`.${styles.sideImageWrapper}`)
          ?.getBoundingClientRect() ?? sourceRect;

      const centreExitX =
        centreExitRect.left +
        centreExitRect.width / 2 -
        (centreRect.left + centreRect.width / 2);

      const centreExitY =
        centreExitRect.top +
        centreExitRect.height / 2 -
        (centreRect.top + centreRect.height / 2);

      const centreExitScaleX = centreExitRect.width / centreRect.width;

      const centreExitScaleY = centreExitRect.height / centreRect.height;

      const timeline = gsap.timeline({
        defaults: {
          overwrite: true,
        },

        onComplete: () => {
          updateGallery();

          movingImage.remove();

          gsap.set(
            [
              centreCard,
              centreImage,
              selectedCard,
              oppositeCard,
              ...centreContent.children,
            ],
            {
              clearProps: "transform,opacity,visibility,pointerEvents",
            },
          );

          setIsAnimating(false);
          animationRef.current = null;
        },
      });

      animationRef.current = timeline;

      timeline
        /*
         * Hide the real clicked side card while its
         * visual copy travels into the centre.
         */
        .set(selectedCard, {
          autoAlpha: 0,
        })

        /*
         * Centre text gently leaves first.
         */
        .to(
          centreContent.children,
          {
            autoAlpha: 0,
            y: -16,
            duration: 0.3,
            stagger: 0.025,
            ease: "power2.in",
          },
          0,
        )

        /*
         * Current large image shrinks and travels
         * toward the opposite side position.
         */
        .to(
          centreImage,
          {
            x: centreExitX,
            y: centreExitY,
            scaleX: centreExitScaleX,
            scaleY: centreExitScaleY,
            autoAlpha: 0.32,
            duration: 0.9,
            ease: "power3.inOut",
          },
          0,
        )

        /*
         * Clicked side image smoothly moves into
         * the exact centre image dimensions.
         */
        .to(
          movingImage,
          {
            top: centreRect.top,
            left: centreRect.left,
            width: centreRect.width,
            height: centreRect.height,
            duration: 0.9,
            ease: "power3.inOut",
          },
          0,
        )

        /*
         * The unused side card softly leaves.
         */
        .to(
          oppositeCard,
          {
            autoAlpha: 0.25,
            x: direction > 0 ? -22 : 22,
            duration: 0.55,
            ease: "power2.inOut",
          },
          0,
        );
    },
    [createMovingImage, isAnimating],
  );

  const showPrevious = useCallback(() => {
    changeSlide(-1);
  }, [changeSlide]);

  const showNext = useCallback(() => {
    changeSlide(1);
  }, [changeSlide]);

  const handlePaginationClick = useCallback(
    (index) => {
      if (isAnimating || index === activeIndex) {
        return;
      }

      const forwardDistance =
        (index - activeIndex + galleryItems.length) % galleryItems.length;

      const backwardDistance =
        (activeIndex - index + galleryItems.length) % galleryItems.length;

      const direction = forwardDistance <= backwardDistance ? 1 : -1;

      changeSlide(direction);
    },
    [activeIndex, changeSlide, isAnimating],
  );

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
        className={styles.carousel}
        role="region"
        aria-roledescription="carousel"
        aria-label="Oceara lifestyle gallery"
      >
        <button
          type="button"
          ref={leftCardRef}
          className={`${styles.sideCard} ${styles.leftCard}`}
          onClick={showPrevious}
          aria-label={`Show ${previousItem.title}`}
          disabled={isAnimating}
        >
          <span className={styles.sideImageWrapper}>
            <Image
              key={previousItem.image}
              src={previousItem.image}
              alt={previousItem.alt}
              fill
              quality={90}
              sizes="210px"
              className={styles.image}
            />
          </span>
        </button>

        <article
          ref={centreCardRef}
          className={styles.centreCard}
          aria-live="polite"
        >
          <div ref={centreImageRef} className={styles.centreImageWrapper}>
            <Image
              key={activeItem.image}
              src={activeItem.image}
              alt={activeItem.alt}
              fill
              quality={90}
              sizes="(max-width: 767px) 76vw, 670px"
              className={styles.image}
            />
          </div>

          <div ref={centreContentRef} className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{activeItem.title}</h3>

            <p className={styles.cardDescription}>{activeItem.description}</p>
          </div>
        </article>

        <button
          type="button"
          ref={rightCardRef}
          className={`${styles.sideCard} ${styles.rightCard}`}
          onClick={showNext}
          aria-label={`Show ${nextItem.title}`}
          disabled={isAnimating}
        >
          <span className={styles.sideImageWrapper}>
            <Image
              key={nextItem.image}
              src={nextItem.image}
              alt={nextItem.alt}
              fill
              quality={90}
              sizes="210px"
              className={styles.image}
            />
          </span>
        </button>
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
            onClick={() => handlePaginationClick(index)}
          />
        ))}
      </div>
    </section>
  );
}
