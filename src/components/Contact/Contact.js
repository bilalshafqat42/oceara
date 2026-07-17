"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import "react-phone-number-input/style.css";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Contact.module.css";

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

export default function Contact() {
  const router = useRouter();

  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const introRef = useRef(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [trackingData, setTrackingData] = useState(initialTrackingData);

  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Capture and preserve campaign attribution.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
      /*
       * First visit in the current browser session.
       */
      finalTrackingData = currentPageTracking;
    } else if (hasNewCampaignParameters) {
      /*
       * A new tagged advertising URL has been opened.
       */
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
      /*
       * Preserve the campaign values while updating
       * the page where the form is being completed.
       */
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
   * Contact section scroll animations.
   */
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
          const { mobile = false, reduceMotion = false } =
            context.conditions ?? {};

          const introChildren = Array.from(intro.children);

          const formChildren = Array.from(form.children);

          if (reduceMotion) {
            gsap.set(viewport, {
              clipPath: "none",
            });

            gsap.set([...introChildren, ...formChildren], {
              clearProps: "all",
              autoAlpha: 1,
              y: 0,
            });

            return;
          }

          /*
           * Reveal the complete section from bottom to top.
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
                scrub: mobile ? 0.5 : 0.7,
                invalidateOnRefresh: true,
              },
            },
          );

          /*
           * Left description entrance.
           */
          gsap.fromTo(
            introChildren,
            {
              autoAlpha: 0,
              y: mobile ? 28 : 40,
            },
            {
              autoAlpha: 1,
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

          /*
           * Form heading, fields and button entrance.
           */
          gsap.fromTo(
            formChildren,
            {
              autoAlpha: 0,
              y: mobile ? 24 : 34,
            },
            {
              autoAlpha: 1,
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

  const clearStatus = () => {
    if (!status) {
      return;
    }

    setStatus("");
    setStatusType("");
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
       * Advertising click identifiers.
       */
      gclid: trackingData.gclid,
      fbclid: trackingData.fbclid,
      msclkid: trackingData.msclkid,
    };

    try {
      setIsSubmitting(true);
      setStatus("");
      setStatusType("");

      /*
       * Development testing only.
       *
       * Replace this console statement later with
       * your approved API, Salesforce or CRM request.
       */
      // console.log("Contact form submission:", submissionData);
      const response = await fetch("/api/oceara-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Lead submission failed");
      }

      /*
       * Store only non-sensitive confirmation data.
       * Do not place the visitor's email or phone
       * number in the Thank You page URL.
       */
      window.sessionStorage.setItem(
        SUBMISSION_STORAGE_KEY,
        JSON.stringify({
          submitted: true,
          submittedAt: new Date().toISOString(),
        }),
      );

      setFormData(initialForm);

      /*
       * Redirect after successful processing.
       */
      router.push("/thank-you");
    } catch (error) {
      console.error("Contact form submission failed:", error);

      setStatus("We could not submit your request. Please try again.");
      setStatusType("error");
      setIsSubmitting(false);
    }
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

          {/* First Name and Last Name */}
          <div className={styles.nameRow}>
            <div className={styles.field}>
              <label
                htmlFor="contact-first-name"
                className={styles.visuallyHidden}
              >
                First Name
              </label>

              <input
                id="contact-first-name"
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
                htmlFor="contact-last-name"
                className={styles.visuallyHidden}
              >
                Last Name
              </label>

              <input
                id="contact-last-name"
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
                htmlFor="contact-user-type"
                className={styles.visuallyHidden}
              >
                I&apos;m a
              </label>

              <div className={styles.selectWrapper}>
                <select
                  id="contact-user-type"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="" disabled>
                    I&apos;m a
                  </option>

                  <option value="broker-agent">Broker</option>

                  <option value="buyer-investor">Buyer</option>
                </select>
              </div>
            </div>
          </div>

          {/* International telephone field */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="contact-phone" className={styles.visuallyHidden}>
                Mobile Phone
              </label>

              <PhoneInput
                id="contact-phone"
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
              <label htmlFor="contact-email" className={styles.visuallyHidden}>
                Email
              </label>

              <input
                id="contact-email"
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

          {/* Campaign tracking fields */}
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

          <p className={styles.consent}>
            By submitting this form, you agree to our{" "}
            <a href="/terms-of-use" className={styles.consentLink}>
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className={styles.consentLink}>
              Privacy Policy
            </a>
            .
          </p>

          <p className={styles.consent}>
            You consent to Refine contacting you about Oceara and future
            opportunities by phone, email, or WhatsApp.
          </p>

          <p
            className={styles.status}
            data-status={statusType}
            aria-live="polite"
            aria-atomic="true"
          >
            {status}
          </p>
        </form>
      </div>
    </section>
  );
}
