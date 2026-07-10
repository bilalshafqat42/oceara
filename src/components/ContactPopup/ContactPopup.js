"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./ContactPopup.module.css";

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  message: "",
};

export default function ContactPopup() {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const timelineRef = useRef(null);
  const previousOverflowRef = useRef("");

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState("");

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const dialog = dialogRef.current;
      const form = formRef.current;

      if (!overlay || !dialog || !form) {
        return;
      }

      const animatedChildren = Array.from(form.children);

      gsap.set(overlay, {
        autoAlpha: 0,
        pointerEvents: "none",
      });

      gsap.set(dialog, {
        opacity: 0,
        scale: 0.96,
        y: 32,
      });

      gsap.set(animatedChildren, {
        opacity: 0,
        y: 22,
      });

      const timeline = gsap.timeline({
        paused: true,

        defaults: {
          ease: "power3.out",
        },

        onStart: () => {
          gsap.set(overlay, {
            pointerEvents: "auto",
          });
        },

        onReverseComplete: () => {
          gsap.set(overlay, {
            pointerEvents: "none",
          });

          setIsOpen(false);
        },
      });

      timeline
        .to(overlay, {
          autoAlpha: 1,
          duration: 0.4,
        })
        .to(
          dialog,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.65,
          },
          0.08,
        )
        .to(
          animatedChildren,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.055,
          },
          0.23,
        );

      timelineRef.current = timeline;

      return () => {
        timeline.kill();
        timelineRef.current = null;
      };
    },
    {
      scope: overlayRef,
    },
  );

  const openPopup = useCallback(() => {
    if (isOpen) {
      return;
    }

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setStatus("");
    setIsOpen(true);

    requestAnimationFrame(() => {
      timelineRef.current?.restart();
    });
  }, [isOpen]);

  const closePopup = useCallback(() => {
    document.body.style.overflow = previousOverflowRef.current;
    timelineRef.current?.reverse();
  }, []);

  /*
   * Any element containing data-contact-popup
   * will open this popup.
   */
  useEffect(() => {
    const handleTriggerClick = (event) => {
      const trigger = event.target.closest("[data-contact-popup]");

      if (!trigger) {
        return;
      }

      event.preventDefault();
      openPopup();
    };

    document.addEventListener("click", handleTriggerClick);

    return () => {
      document.removeEventListener("click", handleTriggerClick);
    };
  }, [openPopup]);

  /*
   * Escape-key support.
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        closePopup();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflowRef.current;
    };
  }, [isOpen, closePopup]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const firstInput = dialogRef.current?.querySelector("input");

    window.setTimeout(() => {
      firstInput?.focus();
    }, 500);
  }, [isOpen]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closePopup();
    }
  };

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

    /*
     * Replace this temporary success state with
     * the approved API or CRM integration later.
     */
    setStatus("Thank you. Your request has been received.");
    setFormData(initialForm);
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      aria-hidden={!isOpen}
      onMouseDown={handleOverlayClick}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-popup-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close contact form"
          onClick={closePopup}
        >
          <span className={styles.closeIcon} aria-hidden="true" />
        </button>

        <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
          <header className={styles.headingGroup}>
            <p className={styles.eyebrow}>Reach Out</p>

            <h2 id="contact-popup-title" className={styles.heading}>
              To Us
            </h2>
          </header>

          <div className={styles.field}>
            <label htmlFor="popup-full-name" className={styles.label}>
              Full Name
            </label>

            <input
              id="popup-full-name"
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
            <label htmlFor="popup-phone" className={styles.label}>
              Phone
            </label>

            <input
              id="popup-phone"
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
            <label htmlFor="popup-email" className={styles.label}>
              Email
            </label>

            <input
              id="popup-email"
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
            <label htmlFor="popup-message" className={styles.label}>
              Message
            </label>

            <textarea
              id="popup-message"
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
      </section>
    </div>
  );
}
