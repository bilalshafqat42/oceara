"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Footer.module.css";

export default function Footer() {
  const footerRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      const footer = footerRef.current;
      const content = contentRef.current;

      if (!footer || !content) {
        return;
      }

      const items = Array.from(content.children);

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          desktop: "(min-width: 601px)",
          mobile: "(max-width: 600px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile, reduceMotion } = context.conditions;

          if (reduceMotion) {
            gsap.set(content, {
              clearProps: "transform",
            });

            gsap.set(items, {
              clearProps: "all",
              autoAlpha: 1,
            });

            return;
          }

          /*
           * Parallax:
           *
           * The whole content block drifts up into place a
           * little slower than the page scroll as the footer
           * enters the viewport, then settles as it centres.
           */
          gsap.fromTo(
            content,
            {
              y: mobile ? 32 : 60,
            },
            {
              y: 0,
              ease: "none",

              scrollTrigger: {
                trigger: footer,
                start: "top bottom",
                end: "top 45%",

                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            },
          );

          /*
           * Text entrance:
           *
           * Each block fades up from below and appears
           * one at a time, with a small delay between them.
           */
          gsap.fromTo(
            items,
            {
              autoAlpha: 0,
              y: mobile ? 20 : 28,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.08,
              ease: "power3.out",

              scrollTrigger: {
                trigger: footer,
                start: "top 78%",
                once: true,
              },
            },
          );
        },
      );

      return () => {
        matchMedia.revert();
      };
    },
    {
      scope: footerRef,
    },
  );

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div ref={contentRef} className={styles.inner}>
        <a
          href="#home"
          className={styles.logo}
          aria-label="Oceara Park Views home"
        >
          <span className={styles.logoMark} aria-hidden="true" />
        </a>

        <div className={`${styles.contactBlock} ${styles.telephone}`}>
          <p className={styles.label}>Tel</p>

          <a href="tel:+97143300299" className={styles.value}>
            +971 4 330 0299
          </a>
        </div>

        <div className={`${styles.contactBlock} ${styles.tollFree}`}>
          <p className={styles.label}>UAE Toll Free:</p>

          <a href="tel:800733463" className={styles.value}>
            800 Refine (800 733463)
          </a>
        </div>

        <div className={`${styles.contactBlock} ${styles.email}`}>
          <p className={styles.label}>Email</p>

          <a href="mailto:sales@refinedubai.com" className={styles.value}>
            sales@refinedubai.com
          </a>
        </div>

        <div className={`${styles.contactBlock} ${styles.address}`}>
          <p className={styles.label}>Address</p>

          <address className={styles.value}>
            Office 4701, Floor 47, Ubora Tower,
            <br />
            Marasi Drive, Business Bay, Dubai
          </address>
        </div>

        <p className={styles.copyright}>
          ©2026. Refine Project Management. All rights reserved
        </p>

        <button type="button" className={styles.cookiesButton}>
          Manage Cookies
        </button>
      </div>
    </footer>
  );
}
