"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Payment.module.css";

export default function Payment() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const imagePanelRef = useRef(null);
  const imageLayerRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const content = contentRef.current;
      const imagePanel = imagePanelRef.current;
      const imageLayer = imageLayerRef.current;

      if (!section || !content || !imagePanel || !imageLayer) {
        return;
      }

      const contentChildren = Array.from(content.children);
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
            gsap.set(imagePanel, {
              clipPath: "none",
            });

            gsap.set(imageLayer, {
              clearProps: "transform",
            });

            gsap.set(contentChildren, {
              autoAlpha: 1,
              y: 0,
            });

            return;
          }

          /*
           * The left beige panel remains fully visible.
           *
           * Only its content starts slightly lower
           * and fades into position.
           */
          gsap.set(contentChildren, {
            autoAlpha: 0,
            y: mobile ? 28 : 44,
          });

          /*
           * The right image panel already occupies its
           * final 50% position.
           *
           * It is hidden from the left side, meaning its
           * right edge is visible first and the reveal
           * opens from right to left.
           */
          gsap.set(imagePanel, {
            clipPath: "inset(0% 0% 0% 100%)",
          });

          /*
           * The image itself stays in place.
           * A very subtle horizontal offset creates depth
           * without making it look like the image is sliding.
           */
          gsap.set(imageLayer, {
            scale: mobile ? 1.035 : 1.055,
            xPercent: mobile ? 2 : 4,
            transformOrigin: "center center",
          });

          /*
           * Right image reveal:
           *
           * Scroll down:
           * right → left opening.
           *
           * Scroll up:
           * left → right closing.
           */
          const imageTimeline = gsap.timeline({
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

          imageTimeline
            .to(
              imagePanel,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
              },
              0,
            )
            .to(
              imageLayer,
              {
                scale: 1,
                xPercent: 0,
                duration: 1,
              },
              0,
            );

          /*
           * Left content entrance.
           *
           * Heading group appears first,
           * followed by the payment plan.
           */
          const contentTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: mobile ? "top 72%" : "top 68%",
              once: true,
            },
          });

          contentTimeline.to(contentChildren, {
            autoAlpha: 1,
            y: 0,
            duration: mobile ? 0.75 : 0.95,
            stagger: mobile ? 0.1 : 0.14,
            ease: "power3.out",
          });

          return () => {
            imageTimeline.kill();
            contentTimeline.kill();
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
      id="payment-plan"
      className={styles.payment}
      aria-labelledby="payment-title"
    >
      <div className={styles.viewport}>
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

        <div ref={imagePanelRef} className={styles.imagePanel}>
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
