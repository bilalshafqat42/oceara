"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Chat.module.css";

const WIDGET_STATE = {
  CLOSED: "closed",
  INTRO: "intro",
  CHAT: "chat",
};

export default function Chat() {
  const [widgetState, setWidgetState] = useState(WIDGET_STATE.CLOSED);

  const introRef = useRef(null);
  const chatRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const toggleVisualRef = useRef(null);
  const textUsButtonRef = useRef(null);
  const messageInputRef = useRef(null);
  const isFirstRenderRef = useRef(true);

  const isOpen = widgetState !== WIDGET_STATE.CLOSED;

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

  const handleSendPlaceholder = useCallback((event) => {
    event.preventDefault();
  }, []);

  /*
   * Close the widget when Escape is pressed.
   */
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

  /*
   * Manage keyboard focus between widget states.
   */
  useLayoutEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;

      return;
    }

    if (widgetState === WIDGET_STATE.INTRO) {
      textUsButtonRef.current?.focus();

      return;
    }

    if (widgetState === WIDGET_STATE.CHAT) {
      messageInputRef.current?.focus();

      return;
    }

    toggleButtonRef.current?.focus();
  }, [widgetState]);

  /*
   * Intro and chat-panel animations.
   */
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

        return () => {
          timeline.kill();
        };
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

        return () => {
          timeline.kill();
        };
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

      return () => {
        timeline.kill();
      };
    },
    {
      dependencies: [widgetState],
    },
  );

  /*
   * Floating-button hover movement.
   */
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
        aria-label="Chat with Kai"
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

        <div className={styles.messageList}>
          <div className={styles.messageBubble}>
            <p>Hi, there</p>
            <p>I&apos;m Kai, how can I help?</p>
          </div>

          <span className={styles.messageMeta}>
            Kai &bull; Refine &bull; Just Now
          </span>
        </div>

        <form className={styles.composer} onSubmit={handleSendPlaceholder}>
          <input
            ref={messageInputRef}
            type="text"
            name="message"
            placeholder="Ask A Question..."
            className={styles.composerInput}
            aria-label="Ask a question"
            tabIndex={widgetState === WIDGET_STATE.CHAT ? 0 : -1}
          />

          <button
            type="submit"
            className={styles.sendButton}
            aria-label="Send message"
            tabIndex={widgetState === WIDGET_STATE.CHAT ? 0 : -1}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
