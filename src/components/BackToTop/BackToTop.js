"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./BackToTop.module.css";

const SHOW_AFTER = 600;

export default function BackToTop() {
  const buttonRef = useRef(null);
  const arrowRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);

  /*
   * Show the button only after the user
   * has scrolled away from the Hero.
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SHOW_AFTER);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
   * Visibility animation.
   */
  useGSAP(
    () => {
      const button = buttonRef.current;
      const arrow = arrowRef.current;

      if (!button || !arrow) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.killTweensOf([button, arrow]);

      if (reduceMotion) {
        gsap.set(button, {
          autoAlpha: isVisible ? 1 : 0,
          y: 0,
          scale: 1,
          pointerEvents: isVisible ? "auto" : "none",
        });

        gsap.set(arrow, {
          y: 0,
        });

        return;
      }

      if (isVisible) {
        const timeline = gsap.timeline();

        timeline
          .to(button, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.48,
            ease: "back.out(1.35)",
            pointerEvents: "auto",
            overwrite: true,
          })
          .fromTo(
            arrow,
            {
              y: 3,
            },
            {
              y: 0,
              duration: 0.4,
              ease: "power3.out",
            },
            "-=0.25",
          );

        return;
      }

      gsap.to(button, {
        autoAlpha: 0,
        y: 14,
        scale: 0.92,
        duration: 0.3,
        ease: "power2.in",
        pointerEvents: "none",
        overwrite: true,
      });
    },
    {
      dependencies: [isVisible],
      scope: buttonRef,
    },
  );

  const handleMouseEnter = useCallback(() => {
    const button = buttonRef.current;
    const arrow = arrowRef.current;

    if (!button || !arrow) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    gsap.to(button, {
      y: -4,
      scale: 1.04,
      duration: 0.35,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to(arrow, {
      y: -3,
      duration: 0.35,
      ease: "power3.out",
      overwrite: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const button = buttonRef.current;
    const arrow = arrowRef.current;

    if (!button || !arrow) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    gsap.to(button, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to(arrow, {
      y: 0,
      duration: 0.4,
      ease: "power3.out",
      overwrite: true,
    });
  }, []);

  const handleBackToTop = useCallback(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.backToTop}
      aria-label="Back to top"
      title="Back to top"
      onClick={handleBackToTop}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={arrowRef} className={styles.arrow} aria-hidden="true" />
    </button>
  );
}
