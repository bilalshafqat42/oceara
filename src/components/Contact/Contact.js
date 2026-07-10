"use client";

import { useRef, useState } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Contact.module.css";

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  message: "",
};

export default function Contact() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const introRef = useRef(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState("");

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const intro = introRef.current;
      const form = formRef.current;

      if (!section || !viewport || !intro || !form) {
        return;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          mobile: "(max-width: 900px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile, reduceMotion } = context.conditions;

          const introChildren = Array.from(intro.children);
          const formChildren = Array.from(form.children);

          if (reduceMotion) {
            gsap.set(viewport, {
              clipPath: "none",
            });

            gsap.set([...introChildren, ...formChildren], {
              clearProps: "all",
              opacity: 1,
            });

            return;
          }

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
                scrub: mobile ? 0.5 : 0.7,
                invalidateOnRefresh: true,
              },
            },
          );

          gsap.fromTo(
            introChildren,
            {
              opacity: 0,
              y: mobile ? 28 : 40,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease: "power3.out",

              scrollTrigger: {
                trigger: section,
                start: "top 60%",
                once: true,
              },
            },
          );

          gsap.fromTo(
            formChildren,
            {
              opacity: 0,
              y: mobile ? 24 : 34,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.07,
              ease: "power3.out",

              scrollTrigger: {
                trigger: section,
                start: "top 56%",
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (status) {
      setStatus("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setStatus("Thank you. Your request has been received.");
    setFormData(initialForm);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={styles.contact}
      aria-labelledby="contact-title"
    >
      <div ref={viewportRef} className={styles.viewport}>
        <div ref={introRef} className={styles.intro}>
          <p className={styles.description}>
            Our dedicated team is at your service to offer comprehensive
            insights into luxury investments across all Emirates of the UAE.
            Contact us today to embark on a journey towards a future
            characterized by opulence and excellence.
          </p>
        </div>

        <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
          <header className={styles.headingGroup}>
            <p className={styles.eyebrow}>Reach Out</p>

            <h2 id="contact-title" className={styles.heading}>
              To Us
            </h2>
          </header>

          <div className={styles.field}>
            <label htmlFor="contact-full-name" className={styles.label}>
              Full Name
            </label>

            <input
              id="contact-full-name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className={styles.input}
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-phone" className={styles.label}>
              Phone
            </label>

            <input
              id="contact-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
              autoComplete="tel"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-email" className={styles.label}>
              Email
            </label>

            <input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              autoComplete="email"
              required
            />
          </div>

          <div className={`${styles.field} ${styles.messageField}`}>
            <label htmlFor="contact-message" className={styles.label}>
              Message
            </label>

            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={styles.textarea}
              rows={1}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            <span>Submit A Request</span>
          </button>

          <p className={styles.status} aria-live="polite" aria-atomic="true">
            {status}
          </p>
        </form>
      </div>
    </section>
  );
}
