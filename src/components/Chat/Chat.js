"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import { validateOcearaLead } from "@/lib/validation/ocearaLead";
import { createWhatsAppLink } from "@/lib/whatsapp/createWhatsAppLink";

import ChatMessage from "./ChatMessage";
import { ENQUIRY_OPTIONS, ENQUIRY_TYPES, LANGUAGES } from "./chatFlow";

import styles from "./Chat.module.css";

const WIDGET_STATE = {
  CLOSED: "closed",
  INTRO: "intro",
  CHAT: "chat",
};

const CHAT_STEP = {
  LANGUAGE: "language",
  ENQUIRY_TYPE: "enquiry-type",
  ENQUIRY_OPTION: "enquiry-option",
  COMPANY_NAME: "company-name",
  FULL_NAME: "full-name",
  PHONE: "phone",
  EMAIL: "email",
  REQUEST: "request",
  CONSENT: "consent",
  REVIEW: "review",
  SUBMITTING: "submitting",
  SUCCESS: "success",
  ERROR: "error",
};

const INITIAL_LEAD_DATA = {
  project: "Oceara Park Views",
  source: "Oceara Website Chatbot",

  language: "",
  enquiryType: "",
  enquiryOption: "",

  companyName: "",
  fullName: "",
  phone: "",
  email: "",
  request: "",

  consent: false,
};

const TEXT_INPUT_STEPS = [
  CHAT_STEP.COMPANY_NAME,
  CHAT_STEP.FULL_NAME,
  CHAT_STEP.PHONE,
  CHAT_STEP.EMAIL,
  CHAT_STEP.REQUEST,
];

function createMessage({ type = "bot", text, meta }) {
  const randomId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    id: randomId,
    type,
    text,
    meta:
      meta ?? (type === "bot" ? "Kai • Refine • Just Now" : "You • Just Now"),
  };
}

function findLabel(items, id) {
  return items.find((item) => item.id === id)?.label ?? id;
}

function getInputConfiguration(step) {
  switch (step) {
    case CHAT_STEP.COMPANY_NAME:
      return {
        name: "companyName",
        type: "text",
        placeholder: "Enter your company name...",
        ariaLabel: "Company name",
        autoComplete: "organization",
      };

    case CHAT_STEP.FULL_NAME:
      return {
        name: "fullName",
        type: "text",
        placeholder: "Enter your full name...",
        ariaLabel: "Full name",
        autoComplete: "name",
      };

    case CHAT_STEP.PHONE:
      return {
        name: "phone",
        type: "tel",
        placeholder: "Phone number with country code...",
        ariaLabel: "Phone number",
        autoComplete: "tel",
        inputMode: "tel",
      };

    case CHAT_STEP.EMAIL:
      return {
        name: "email",
        type: "email",
        placeholder: "Enter your email address...",
        ariaLabel: "Email address",
        autoComplete: "email",
        inputMode: "email",
      };

    case CHAT_STEP.REQUEST:
      return {
        name: "request",
        type: "text",
        placeholder: "Describe your request...",
        ariaLabel: "Request details",
        autoComplete: "off",
      };

    default:
      return null;
  }
}

function getNextTextQuestion(step) {
  switch (step) {
    case CHAT_STEP.COMPANY_NAME:
      return "May we have your full name?";

    case CHAT_STEP.FULL_NAME:
      return "Please enter your phone number, including the country code.";

    case CHAT_STEP.PHONE:
      return "Please enter your email address.";

    case CHAT_STEP.EMAIL:
      return "Could you please describe your request?";

    case CHAT_STEP.REQUEST:
      return "Please confirm that Refine may contact you regarding this enquiry.";

    default:
      return "";
  }
}

function getNextStep(step) {
  switch (step) {
    case CHAT_STEP.COMPANY_NAME:
      return CHAT_STEP.FULL_NAME;

    case CHAT_STEP.FULL_NAME:
      return CHAT_STEP.PHONE;

    case CHAT_STEP.PHONE:
      return CHAT_STEP.EMAIL;

    case CHAT_STEP.EMAIL:
      return CHAT_STEP.REQUEST;

    case CHAT_STEP.REQUEST:
      return CHAT_STEP.CONSENT;

    default:
      return step;
  }
}

function getFieldError(step, value) {
  const trimmedValue = String(value ?? "").trim();

  switch (step) {
    case CHAT_STEP.COMPANY_NAME:
      if (trimmedValue.length > 120) {
        return "Company name must be 120 characters or fewer.";
      }

      return "";

    case CHAT_STEP.FULL_NAME:
      if (trimmedValue.length < 2) {
        return "Please enter your full name.";
      }

      if (trimmedValue.length > 100) {
        return "Full name must be 100 characters or fewer.";
      }

      return "";

    case CHAT_STEP.PHONE:
      if (!/^\+?[0-9\s()\-]{7,20}$/.test(trimmedValue)) {
        return "Please enter a valid phone number with country code.";
      }

      return "";

    case CHAT_STEP.EMAIL:
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return "Please enter a valid email address.";
      }

      return "";

    case CHAT_STEP.REQUEST:
      if (trimmedValue.length < 5) {
        return "Please provide a little more detail about your request.";
      }

      if (trimmedValue.length > 1500) {
        return "Request details must be 1,500 characters or fewer.";
      }

      return "";

    default:
      return "";
  }
}

function normalizeValidationResult(result) {
  if (!result) {
    return {
      success: true,
      errors: {},
    };
  }

  if (typeof result.success === "boolean") {
    return result;
  }

  return {
    success: Object.keys(result.errors ?? {}).length === 0,
    errors: result.errors ?? {},
  };
}

export default function Chat() {
  const [widgetState, setWidgetState] = useState(WIDGET_STATE.CLOSED);

  const [chatStep, setChatStep] = useState(CHAT_STEP.LANGUAGE);
  const [leadData, setLeadData] = useState(INITIAL_LEAD_DATA);

  const [messages, setMessages] = useState(() => [
    createMessage({
      text: "Hi there. I’m Kai. Please choose your preferred language.",
    }),
  ]);

  const [inputValue, setInputValue] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [reference, setReference] = useState("");

  const introRef = useRef(null);
  const chatRef = useRef(null);
  const messageListRef = useRef(null);

  const toggleButtonRef = useRef(null);
  const toggleVisualRef = useRef(null);

  const textUsButtonRef = useRef(null);
  const messageInputRef = useRef(null);

  const isFirstRenderRef = useRef(true);

  const isOpen = widgetState !== WIDGET_STATE.CLOSED;
  const showComposer = TEXT_INPUT_STEPS.includes(chatStep);

  const currentInput = useMemo(
    () => getInputConfiguration(chatStep),
    [chatStep],
  );

  const currentEnquiryOptions = useMemo(
    () => ENQUIRY_OPTIONS[leadData.enquiryType] ?? [],
    [leadData.enquiryType],
  );

  const selectedLanguageLabel = useMemo(
    () => findLabel(LANGUAGES, leadData.language),
    [leadData.language],
  );

  const selectedEnquiryTypeLabel = useMemo(
    () => findLabel(ENQUIRY_TYPES, leadData.enquiryType),
    [leadData.enquiryType],
  );

  const selectedEnquiryOptionLabel = useMemo(
    () =>
      findLabel(
        ENQUIRY_OPTIONS[leadData.enquiryType] ?? [],
        leadData.enquiryOption,
      ),
    [leadData.enquiryType, leadData.enquiryOption],
  );

  const appendMessage = useCallback((message) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage(message),
    ]);
  }, []);

  const resetChat = useCallback(() => {
    setChatStep(CHAT_STEP.LANGUAGE);
    setLeadData(INITIAL_LEAD_DATA);

    setMessages([
      createMessage({
        text: "Hi there. I’m Kai. Please choose your preferred language.",
      }),
    ]);

    setInputValue("");
    setFieldError("");
    setSubmissionError("");
    setReference("");
  }, []);

  const handleToggleClick = useCallback(() => {
    setWidgetState((currentState) =>
      currentState === WIDGET_STATE.CLOSED
        ? WIDGET_STATE.INTRO
        : WIDGET_STATE.CLOSED,
    );
  }, []);

  const openChat = useCallback(() => {
    setWidgetState(WIDGET_STATE.CHAT);
  }, []);

  const closeWidget = useCallback(() => {
    setWidgetState(WIDGET_STATE.CLOSED);
  }, []);

  const restartChat = useCallback(() => {
    resetChat();
    setWidgetState(WIDGET_STATE.CHAT);
  }, [resetChat]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeWidget();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeWidget]);

  useLayoutEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (widgetState === WIDGET_STATE.INTRO) {
      textUsButtonRef.current?.focus();
      return;
    }

    if (widgetState === WIDGET_STATE.CHAT && showComposer) {
      window.requestAnimationFrame(() => {
        messageInputRef.current?.focus();
      });

      return;
    }

    if (widgetState === WIDGET_STATE.CLOSED) {
      toggleButtonRef.current?.focus();
    }
  }, [widgetState, chatStep, showComposer]);

  useEffect(() => {
    if (widgetState !== WIDGET_STATE.CHAT) {
      return;
    }

    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    window.requestAnimationFrame(() => {
      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, chatStep, widgetState]);

  useGSAP(
    () => {
      const intro = introRef.current;
      const chat = chatRef.current;

      if (!intro || !chat) {
        return undefined;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const showIntro = widgetState === WIDGET_STATE.INTRO;
      const showChat = widgetState === WIDGET_STATE.CHAT;

      gsap.killTweensOf([intro, chat]);

      if (reduceMotion) {
        gsap.set(intro, {
          display: showIntro ? "flex" : "none",
          autoAlpha: showIntro ? 1 : 0,
          y: 0,
          scale: 1,
        });

        gsap.set(chat, {
          display: showChat ? "flex" : "none",
          autoAlpha: showChat ? 1 : 0,
          y: 0,
          scale: 1,
        });

        return undefined;
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      if (showIntro) {
        gsap.set(chat, {
          display: "none",
          autoAlpha: 0,
        });

        gsap.set(intro, {
          display: "flex",
        });

        timeline.fromTo(
          intro,
          {
            autoAlpha: 0,
            y: 24,
            scale: 0.96,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
          },
        );

        return () => timeline.kill();
      }

      if (showChat) {
        gsap.set(intro, {
          display: "none",
          autoAlpha: 0,
        });

        gsap.set(chat, {
          display: "flex",
        });

        timeline.fromTo(
          chat,
          {
            autoAlpha: 0,
            y: 24,
            scale: 0.96,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
          },
        );

        return () => timeline.kill();
      }

      timeline
        .to([intro, chat], {
          autoAlpha: 0,
          y: 16,
          scale: 0.96,
          duration: 0.3,
          ease: "power2.in",
        })
        .set([intro, chat], {
          display: "none",
        });

      return () => timeline.kill();
    },
    {
      dependencies: [widgetState],
    },
  );

  const handleToggleMouseEnter = useCallback(() => {
    const button = toggleButtonRef.current;
    const visual = toggleVisualRef.current;

    if (!button || !visual) {
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

    gsap.to(visual, {
      y: -2,
      duration: 0.35,
      ease: "power3.out",
      overwrite: true,
    });
  }, []);

  const handleToggleMouseLeave = useCallback(() => {
    const button = toggleButtonRef.current;
    const visual = toggleVisualRef.current;

    if (!button || !visual) {
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

    gsap.to(visual, {
      y: 0,
      duration: 0.4,
      ease: "power3.out",
      overwrite: true,
    });
  }, []);

  const handleLanguageSelection = useCallback(
    (language) => {
      setLeadData((currentData) => ({
        ...currentData,
        language: language.id,
      }));

      appendMessage({
        type: "visitor",
        text: language.label,
      });

      appendMessage({
        text: "What is the nature of your enquiry?",
      });

      setChatStep(CHAT_STEP.ENQUIRY_TYPE);
    },
    [appendMessage],
  );

  const handleEnquiryTypeSelection = useCallback(
    (enquiryType) => {
      setLeadData((currentData) => ({
        ...currentData,
        enquiryType: enquiryType.id,
        enquiryOption: "",
      }));

      appendMessage({
        type: "visitor",
        text: enquiryType.label,
      });

      const options = ENQUIRY_OPTIONS[enquiryType.id] ?? [];

      if (options.length === 0) {
        appendMessage({
          text: "Please enter your company name. You may type Individual if this does not apply.",
        });

        setChatStep(CHAT_STEP.COMPANY_NAME);
        return;
      }

      appendMessage({
        text: "Which option best fits your enquiry?",
      });

      setChatStep(CHAT_STEP.ENQUIRY_OPTION);
    },
    [appendMessage],
  );

  const handleEnquiryOptionSelection = useCallback(
    (enquiryOption) => {
      setLeadData((currentData) => ({
        ...currentData,
        enquiryOption: enquiryOption.id,
      }));

      appendMessage({
        type: "visitor",
        text: enquiryOption.label,
      });

      appendMessage({
        text: "Please enter your company name. You may type Individual if this does not apply.",
      });

      setChatStep(CHAT_STEP.COMPANY_NAME);
    },
    [appendMessage],
  );

  const handleTextInputChange = useCallback((event) => {
    setInputValue(event.target.value);
    setFieldError("");
  }, []);

  const handleTextAnswer = useCallback(
    (event) => {
      event.preventDefault();

      if (!currentInput) {
        return;
      }

      const trimmedValue = inputValue.trim();
      const error = getFieldError(chatStep, trimmedValue);

      if (error) {
        setFieldError(error);
        return;
      }

      setLeadData((currentData) => ({
        ...currentData,
        [currentInput.name]: trimmedValue,
      }));

      appendMessage({
        type: "visitor",
        text: trimmedValue || "Not applicable",
      });

      const nextQuestion = getNextTextQuestion(chatStep);
      const nextStep = getNextStep(chatStep);

      setInputValue("");
      setFieldError("");

      if (nextQuestion) {
        appendMessage({
          text: nextQuestion,
        });
      }

      setChatStep(nextStep);
    },
    [appendMessage, chatStep, currentInput, inputValue],
  );

  const handleConsentSelection = useCallback(
    (accepted) => {
      if (!accepted) {
        setLeadData((currentData) => ({
          ...currentData,
          consent: false,
        }));

        appendMessage({
          type: "visitor",
          text: "I do not consent",
        });

        setFieldError(
          "Consent is required so the Refine team may respond to your enquiry.",
        );

        return;
      }

      setLeadData((currentData) => ({
        ...currentData,
        consent: true,
      }));

      appendMessage({
        type: "visitor",
        text: "Yes, I consent",
      });

      appendMessage({
        text: "Thank you. Please review your information before submitting.",
      });

      setFieldError("");
      setChatStep(CHAT_STEP.REVIEW);
    },
    [appendMessage],
  );

  const handleEditDetails = useCallback(() => {
    setLeadData((currentData) => ({
      ...currentData,
      companyName: "",
      fullName: "",
      phone: "",
      email: "",
      request: "",
      consent: false,
    }));

    appendMessage({
      text: "Let’s update your details. Please enter your company name.",
    });

    setInputValue("");
    setFieldError("");
    setSubmissionError("");
    setChatStep(CHAT_STEP.COMPANY_NAME);
  }, [appendMessage]);

  const handleSubmitLead = useCallback(async () => {
    setSubmissionError("");
    setFieldError("");

    const validationResult = normalizeValidationResult(
      validateOcearaLead(leadData),
    );

    if (!validationResult.success) {
      const firstError =
        Object.values(validationResult.errors ?? {})[0] ??
        "Please review the information and try again.";

      setSubmissionError(firstError);
      setChatStep(CHAT_STEP.ERROR);
      return;
    }

    setChatStep(CHAT_STEP.SUBMITTING);

    try {
      const response = await fetch("/api/oceara-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...leadData,
          pageUrl: window.location.href,
          submittedAt: new Date().toISOString(),
        }),
      });

      let result;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ??
            "We could not submit your enquiry. Please try again.",
        );
      }

      const returnedReference = result.reference ?? `OCE-${Date.now()}`;

      setReference(returnedReference);

      appendMessage({
        text: "Thank you for providing your details. Our team will be in touch shortly.",
      });

      setChatStep(CHAT_STEP.SUCCESS);
    } catch (error) {
      console.error("Oceara chatbot submission error:", error);

      setSubmissionError(
        error instanceof Error
          ? error.message
          : "We could not submit your enquiry. Please try again.",
      );

      setChatStep(CHAT_STEP.ERROR);
    }
  }, [appendMessage, leadData]);

  const whatsappNumber = process.env.NEXT_PUBLIC_OCEARA_WHATSAPP_NUMBER ?? "";

  const whatsappUrl = useMemo(() => {
    if (chatStep !== CHAT_STEP.SUCCESS || !reference || !whatsappNumber) {
      return "";
    }

    return createWhatsAppLink({
      number: whatsappNumber,
      lead: {
        ...leadData,
        language: selectedLanguageLabel,
        enquiryType: selectedEnquiryTypeLabel,
        enquiryOption: selectedEnquiryOptionLabel,
      },
      reference,
    });
  }, [
    chatStep,
    leadData,
    reference,
    selectedEnquiryOptionLabel,
    selectedEnquiryTypeLabel,
    selectedLanguageLabel,
    whatsappNumber,
  ]);

  const renderChoiceButtons = (items, handler) => (
    <div className={styles.choiceGrid}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={styles.choiceButton}
          onClick={() => handler(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  const renderReview = () => (
    <div className={styles.reviewCard}>
      <p className={styles.reviewTitle}>Review Your Information</p>

      <dl className={styles.reviewList}>
        <div className={styles.reviewRow}>
          <dt>Project</dt>
          <dd>{leadData.project}</dd>
        </div>

        <div className={styles.reviewRow}>
          <dt>Language</dt>
          <dd>{selectedLanguageLabel}</dd>
        </div>

        <div className={styles.reviewRow}>
          <dt>Enquiry</dt>
          <dd>{selectedEnquiryTypeLabel}</dd>
        </div>

        <div className={styles.reviewRow}>
          <dt>Option</dt>
          <dd>{selectedEnquiryOptionLabel}</dd>
        </div>

        <div className={styles.reviewRow}>
          <dt>Company</dt>
          <dd>{leadData.companyName || "Individual"}</dd>
        </div>

        <div className={styles.reviewRow}>
          <dt>Name</dt>
          <dd>{leadData.fullName}</dd>
        </div>

        <div className={styles.reviewRow}>
          <dt>Phone</dt>
          <dd>{leadData.phone}</dd>
        </div>

        <div className={styles.reviewRow}>
          <dt>Email</dt>
          <dd>{leadData.email}</dd>
        </div>

        <div className={styles.reviewRow}>
          <dt>Request</dt>
          <dd>{leadData.request}</dd>
        </div>
      </dl>

      <div className={styles.reviewActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleEditDetails}
        >
          Edit Details
        </button>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleSubmitLead}
        >
          Submit Enquiry
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (chatStep) {
      case CHAT_STEP.LANGUAGE:
        return renderChoiceButtons(LANGUAGES, handleLanguageSelection);

      case CHAT_STEP.ENQUIRY_TYPE:
        return renderChoiceButtons(ENQUIRY_TYPES, handleEnquiryTypeSelection);

      case CHAT_STEP.ENQUIRY_OPTION:
        return renderChoiceButtons(
          currentEnquiryOptions,
          handleEnquiryOptionSelection,
        );

      case CHAT_STEP.CONSENT:
        return (
          <div className={styles.consentBlock}>
            <p className={styles.consentText}>
              By continuing, you agree that Refine may use the information
              provided to contact you about this enquiry.
            </p>

            <div className={styles.consentActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => handleConsentSelection(true)}
              >
                Yes, I Consent
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => handleConsentSelection(false)}
              >
                No
              </button>
            </div>
          </div>
        );

      case CHAT_STEP.REVIEW:
        return renderReview();

      case CHAT_STEP.SUBMITTING:
        return (
          <div className={styles.statusCard} role="status" aria-live="polite">
            <span className={styles.loadingSpinner} aria-hidden="true" />

            <p>Submitting your enquiry...</p>
          </div>
        );

      case CHAT_STEP.SUCCESS:
        return (
          <div
            className={`${styles.statusCard} ${styles.successCard}`}
            role="status"
            aria-live="polite"
          >
            <span className={styles.successIcon} aria-hidden="true">
              ✓
            </span>

            <p className={styles.statusTitle}>Enquiry Received</p>

            <p className={styles.statusText}>
              Thank you. Our team will contact you shortly.
            </p>

            <p className={styles.referenceText}>
              Reference: <strong>{reference}</strong>
            </p>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappButton}
              >
                Continue On WhatsApp
              </a>
            ) : (
              <p className={styles.whatsappUnavailable}>
                WhatsApp continuation is not configured yet.
              </p>
            )}

            <button
              type="button"
              className={styles.restartButton}
              onClick={restartChat}
            >
              Start New Enquiry
            </button>
          </div>
        );

      case CHAT_STEP.ERROR:
        return (
          <div
            className={`${styles.statusCard} ${styles.errorCard}`}
            role="alert"
          >
            <p className={styles.statusTitle}>Submission Not Completed</p>

            <p className={styles.statusText}>
              {submissionError || "We could not submit your enquiry."}
            </p>

            <div className={styles.errorActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSubmitLead}
              >
                Try Again
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleEditDetails}
              >
                Edit Details
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.widget}>
      <div
        ref={introRef}
        className={styles.introCard}
        aria-hidden={widgetState !== WIDGET_STATE.INTRO}
      >
        <span className={styles.onlineBadge}>
          <span className={styles.onlineDot} aria-hidden="true" />
          We Are Online
        </span>

        <div className={styles.introPhotoWrapper}>
          <Image
            src="/images/agent/agen-full-img.jpg"
            alt="Kai, Refine support agent"
            fill
            sizes="320px"
            className={styles.introPhoto}
          />

          <div className={styles.introPhotoOverlay} aria-hidden="true" />
        </div>

        <div className={styles.introContent}>
          <p className={styles.introTitle}>Reach Out To Us</p>

          <p className={styles.introSubtitle}>
            Let Us Know How We Can Help You
          </p>

          <button
            ref={textUsButtonRef}
            type="button"
            className={styles.textUsButton}
            onClick={openChat}
            tabIndex={widgetState === WIDGET_STATE.INTRO ? 0 : -1}
          >
            Text Us
          </button>
        </div>
      </div>

      <div
        ref={chatRef}
        className={styles.chatPanel}
        role="dialog"
        aria-modal="false"
        aria-label="Oceara enquiry assistant"
        aria-hidden={widgetState !== WIDGET_STATE.CHAT}
      >
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderInfo}>
            <span className={styles.avatarWrapper}>
              <Image
                src="/images/agent/agent-round.png"
                alt="Kai"
                fill
                sizes="40px"
                className={styles.avatarImage}
              />
            </span>

            <span className={styles.headerText}>
              <span className={styles.agentName}>Kai</span>

              <span className={styles.agentStatus}>
                Always Happy To Support
              </span>
            </span>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={closeWidget}
            aria-label="Close chat"
            tabIndex={widgetState === WIDGET_STATE.CHAT ? 0 : -1}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div
          ref={messageListRef}
          className={styles.messageList}
          aria-live="polite"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              meta={message.meta}
            >
              {message.text}
            </ChatMessage>
          ))}

          {renderCurrentStep()}

          {fieldError ? (
            <p className={styles.fieldError} role="alert">
              {fieldError}
            </p>
          ) : null}
        </div>

        {showComposer && currentInput ? (
          <form className={styles.composer} onSubmit={handleTextAnswer}>
            <input
              ref={messageInputRef}
              type={currentInput.type}
              name={currentInput.name}
              value={inputValue}
              placeholder={currentInput.placeholder}
              className={styles.composerInput}
              aria-label={currentInput.ariaLabel}
              aria-invalid={Boolean(fieldError)}
              autoComplete={currentInput.autoComplete}
              inputMode={currentInput.inputMode}
              maxLength={chatStep === CHAT_STEP.REQUEST ? 1500 : 120}
              onChange={handleTextInputChange}
              tabIndex={widgetState === WIDGET_STATE.CHAT ? 0 : -1}
            />

            <button
              type="submit"
              className={styles.sendButton}
              aria-label="Send answer"
              tabIndex={widgetState === WIDGET_STATE.CHAT ? 0 : -1}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path
                  d="M12 19V5M5 12l7-7 7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          </form>
        ) : null}
      </div>

      <button
        ref={toggleButtonRef}
        type="button"
        className={styles.toggleButton}
        data-open={isOpen ? "true" : "false"}
        onClick={handleToggleClick}
        onMouseEnter={handleToggleMouseEnter}
        onMouseLeave={handleToggleMouseLeave}
        aria-label={isOpen ? "Minimise chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        <span
          ref={toggleVisualRef}
          className={styles.toggleVisual}
          aria-hidden="true"
        >
          <span className={styles.darkIcon} />
          <span className={styles.lightIcon} />
          <span className={styles.closeIcon} />
        </span>
      </button>
    </div>
  );
}
