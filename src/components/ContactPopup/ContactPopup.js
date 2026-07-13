"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import "react-phone-number-input/style.css";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./ContactPopup.module.css";

const TRACKING_STORAGE_KEY = "oceara_campaign_tracking";
const SUBMISSION_STORAGE_KEY = "oceara_form_submitted";

const initialForm = {
  firstName: "",
  lastName: "",
  userType: "",
  phone: "",
  email: "",
};

const initialTrackingData = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  utm_referrer: "",
  page_url: "",
  landing_page_url: "",
  gclid: "",
  fbclid: "",
  msclkid: "",
};

const parseStoredTrackingData = (storedValue) => {
  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return null;
  }
};

export default function ContactPopup() {
  const router = useRouter();

  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const timelineRef = useRef(null);
  const previousOverflowRef = useRef("");

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(initialForm);

  const [trackingData, setTrackingData] = useState(initialTrackingData);

  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");

  /*
   * Capture UTM parameters and advertising click IDs.
   *
   * The same storage key is used by the main Contact form,
   * so both forms retain the same campaign attribution.
   */
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;

    const storedTrackingData = parseStoredTrackingData(
      window.sessionStorage.getItem(TRACKING_STORAGE_KEY),
    );

    const campaignParameterNames = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_referrer",
      "gclid",
      "fbclid",
      "msclkid",
    ];

    const hasNewCampaignParameters = campaignParameterNames.some(
      (parameterName) => searchParams.has(parameterName),
    );

    const currentPageTracking = {
      utm_source: searchParams.get("utm_source") || "",

      utm_medium: searchParams.get("utm_medium") || "",

      utm_campaign: searchParams.get("utm_campaign") || "",

      utm_content: searchParams.get("utm_content") || "",

      utm_term: searchParams.get("utm_term") || "",

      utm_referrer: searchParams.get("utm_referrer") || document.referrer || "",

      page_url: window.location.href,

      landing_page_url: window.location.href,

      gclid: searchParams.get("gclid") || "",

      fbclid: searchParams.get("fbclid") || "",

      msclkid: searchParams.get("msclkid") || "",
    };

    let finalTrackingData;

    if (!storedTrackingData) {
      finalTrackingData = currentPageTracking;
    } else if (hasNewCampaignParameters) {
      finalTrackingData = {
        ...storedTrackingData,
        ...currentPageTracking,

        landing_page_url:
          storedTrackingData.landing_page_url ||
          currentPageTracking.landing_page_url,

        utm_referrer:
          currentPageTracking.utm_referrer || storedTrackingData.utm_referrer,
      };
    } else {
      finalTrackingData = {
        ...storedTrackingData,
        page_url: window.location.href,
      };
    }

    window.sessionStorage.setItem(
      TRACKING_STORAGE_KEY,
      JSON.stringify(finalTrackingData),
    );

    setTrackingData(finalTrackingData);
  }, []);

  /*
   * Popup entrance and exit animation.
   */
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

  const clearStatus = useCallback(() => {
    setStatus("");
    setStatusType("");
  }, []);

  const openPopup = useCallback(() => {
    if (isOpen) {
      return;
    }

    previousOverflowRef.current = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    clearStatus();
    setIsSubmitting(false);
    setIsOpen(true);

    requestAnimationFrame(() => {
      timelineRef.current?.restart();
    });
  }, [clearStatus, isOpen]);

  const closePopup = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    document.body.style.overflow = previousOverflowRef.current;

    timelineRef.current?.reverse();
  }, [isSubmitting]);

  /*
   * Any button or link containing data-contact-popup
   * opens this popup.
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
   * Close with the Escape key.
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen && !isSubmitting) {
        closePopup();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = previousOverflowRef.current;
    };
  }, [closePopup, isOpen, isSubmitting]);

  /*
   * Focus the first input after opening.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const firstInput = dialogRef.current?.querySelector(
      'input:not([type="hidden"])',
    );

    const focusTimer = window.setTimeout(() => {
      firstInput?.focus();
    }, 500);

    return () => {
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      closePopup();
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    clearStatus();
  };

  const handlePhoneChange = (value) => {
    setFormData((current) => ({
      ...current,
      phone: value || "",
    }));

    clearStatus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
      setStatus("Please enter a valid mobile phone number.");

      setStatusType("error");

      return;
    }

    const submissionData = {
      /*
       * Visitor information.
       */
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      userType: formData.userType,
      phone: formData.phone,
      email: formData.email.trim(),

      /*
       * Identifies where the form was submitted.
       */
      form_source: "contact-popup",

      /*
       * UTM campaign information.
       */
      utm_source: trackingData.utm_source,
      utm_medium: trackingData.utm_medium,
      utm_campaign: trackingData.utm_campaign,
      utm_content: trackingData.utm_content,
      utm_term: trackingData.utm_term,
      utm_referrer: trackingData.utm_referrer,

      /*
       * Page attribution.
       */
      page_url: trackingData.page_url,
      landing_page_url: trackingData.landing_page_url,

      /*
       * Paid advertising click identifiers.
       */
      gclid: trackingData.gclid,
      fbclid: trackingData.fbclid,
      msclkid: trackingData.msclkid,
    };

    try {
      setIsSubmitting(true);
      clearStatus();

      /*
       * Temporary development verification.
       *
       * Replace this console statement with the
       * approved API or Salesforce request later.
       */
      console.log("Popup contact form submission:", submissionData);

      /*
       * Record a basic submission confirmation.
       * Personal lead information is not stored here.
       */
      window.sessionStorage.setItem(
        SUBMISSION_STORAGE_KEY,
        JSON.stringify({
          submitted: true,
          formSource: "contact-popup",
          submittedAt: new Date().toISOString(),
        }),
      );

      setFormData(initialForm);

      /*
       * Restore scrolling before navigating.
       */
      document.body.style.overflow = previousOverflowRef.current;

      /*
       * Redirect after successful submission.
       */
      router.push("/thank-you");
    } catch (error) {
      console.error("Popup contact form submission failed:", error);

      setStatus("We could not submit your request. Please try again.");

      setStatusType("error");
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
        >
          <span className={styles.closeIcon} aria-hidden="true" />
        </button>

        <form
          ref={formRef}
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
        >
          <header className={styles.headingGroup}>
            <p className={styles.eyebrow}>Reach Out</p>

            <h2 id="contact-popup-title" className={styles.heading}>
              To Us
            </h2>
          </header>

          {/* First name and last name */}
          <div className={styles.nameRow}>
            <div className={styles.field}>
              <label
                htmlFor="popup-first-name"
                className={styles.visuallyHidden}
              >
                First Name
              </label>

              <input
                id="popup-first-name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder="First Name"
                autoComplete="given-name"
                required
              />
            </div>

            <div className={styles.field}>
              <label
                htmlFor="popup-last-name"
                className={styles.visuallyHidden}
              >
                Last Name
              </label>

              <input
                id="popup-last-name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Last Name"
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          {/* Lead type */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label
                htmlFor="popup-user-type"
                className={styles.visuallyHidden}
              >
                I&apos;m a
              </label>

              <div className={styles.selectWrapper}>
                <select
                  id="popup-user-type"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="" disabled>
                    I&apos;m a
                  </option>

                  <option value="broker-agent">Broker / Agent</option>

                  <option value="buyer-investor">Buyer / Investor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Worldwide phone input */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="popup-phone" className={styles.visuallyHidden}>
                Mobile Phone
              </label>

              <PhoneInput
                id="popup-phone"
                name="phone"
                className={styles.phoneInput}
                value={formData.phone}
                onChange={handlePhoneChange}
                defaultCountry="AE"
                international
                countryCallingCodeEditable={false}
                placeholder="Mobile Phone"
                autoComplete="tel"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="popup-email" className={styles.visuallyHidden}>
                Email
              </label>

              <input
                id="popup-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="Email"
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>
          </div>

          {/* Hidden campaign tracking fields */}
          <input type="hidden" name="form_source" value="contact-popup" />

          <input
            type="hidden"
            name="utm_source"
            value={trackingData.utm_source}
          />

          <input
            type="hidden"
            name="utm_medium"
            value={trackingData.utm_medium}
          />

          <input
            type="hidden"
            name="utm_campaign"
            value={trackingData.utm_campaign}
          />

          <input
            type="hidden"
            name="utm_content"
            value={trackingData.utm_content}
          />

          <input type="hidden" name="utm_term" value={trackingData.utm_term} />

          <input
            type="hidden"
            name="utm_referrer"
            value={trackingData.utm_referrer}
          />

          <input type="hidden" name="page_url" value={trackingData.page_url} />

          <input
            type="hidden"
            name="landing_page_url"
            value={trackingData.landing_page_url}
          />

          <input type="hidden" name="gclid" value={trackingData.gclid} />

          <input type="hidden" name="fbclid" value={trackingData.fbclid} />

          <input type="hidden" name="msclkid" value={trackingData.msclkid} />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <span>{isSubmitting ? "Submitting..." : "Submit A Request"}</span>
          </button>

          <p
            className={styles.status}
            data-status={statusType}
            aria-live="polite"
            aria-atomic="true"
          >
            {status}
          </p>
        </form>
      </section>
    </div>
  );
}
