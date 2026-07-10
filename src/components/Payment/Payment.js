"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Payment.module.css";

export default function Payment() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const imageLayerRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const content = contentRef.current;
      const imageLayer = imageLayerRef.current;

      if (!section || !viewport || !content || !imageLayer) {
        return;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile, reduceMotion } = context.conditions;

          if (reduceMotion) {
            gsap.set(viewport, {
              clipPath: "none",
            });

            gsap.set(content.children, {
              opacity: 1,
              y: 0,
            });

            gsap.set(imageLayer, {
              clearProps: "transform",
            });

            return;
          }

          /*
           * Reveal the complete payment section
           * vertically from bottom to top.
           */
          gsap.fromTo(
            viewport,
            {
              clipPath: "inset(100% 0% 0% 0%)",
            },
            {
              clipPath: "inset(0% 0% 0% 0%)",
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
           * Subtle image depth movement while
           * the payment section is revealed.
           */
          gsap.fromTo(
            imageLayer,
            {
              scale: mobile ? 1.05 : 1.08,
              yPercent: mobile ? 5 : 8,
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

          /*
           * Payment text enters after the section
           * is sufficiently visible.
           */
          gsap.fromTo(
            content.children,
            {
              opacity: 0,
              y: mobile ? 30 : 46,
            },
            {
              opacity: 1,
              y: 0,
              duration: mobile ? 0.75 : 0.95,
              stagger: 0.1,
              ease: "power3.out",

              scrollTrigger: {
                trigger: section,
                start: "top 55%",
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
      scope: sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      id="payment-plan"
      className={styles.payment}
      aria-labelledby="payment-title"
    >
      <div ref={viewportRef} className={styles.viewport}>
        <div className={styles.contentPanel}>
          <div ref={contentRef} className={styles.content}>
            <div className={styles.headingGroup}>
              <p className={styles.eyebrow}>Payment</p>

              <h2 id="payment-title" className={styles.heading}>
                Plan
              </h2>
            </div>

            <div className={styles.plan}>
              <div
                className={styles.planNumbers}
                aria-label="20 percent during construction and 80 percent after handover"
              >
                <span className={styles.planNumber}>20</span>

                <span className={styles.planDivider} aria-hidden="true">
                  /
                </span>

                <span className={styles.planNumber}>80</span>
              </div>

              <div className={styles.planLabels}>
                <p className={styles.planLabel}>During Construction</p>

                <p className={styles.planLabel}>After Handover</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.imagePanel}>
          <div ref={imageLayerRef} className={styles.imageLayer}>
            <Image
              src="/images/payment/swim.jpg"
              alt="Oceara beachfront lifestyle at sunset"
              fill
              quality={90}
              sizes="(max-width: 767px) 100vw, 50vw"
              className={styles.image}
            />
          </div>

          <div className={styles.imageOverlay} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
