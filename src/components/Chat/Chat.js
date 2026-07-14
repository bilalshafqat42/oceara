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

/*
 * Three visual states only, per current scope:
 *
 * CLOSED -> just the round toggle button, bottom right.
 * INTRO  -> "Reach Out To Us" agent card.
 * CHAT   -> full Kai chat panel.
 *
 * Sending messages, WhatsApp handoff, and any real backend
 * wiring are intentionally left as no-ops for now and will be
 * connected once that functionality is scoped.
 */

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
  const textUsButtonRef = useRef(null);
  const messageInputRef = useRef(null);
  const isFirstRender = useRef(true);

  const isOpen = widgetState !== WIDGET_STATE.CLOSED;

  const handleToggleClick = useCallback(() => {
    setWidgetState((current) =>
      current === WIDGET_STATE.CLOSED
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
    // Message sending is wired up separately, once that scope is defined.
  }, []);

  // Close on Escape, standard behaviour for any dismissible panel.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeWidget();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeWidget]);

  // Move focus into the panel when it opens, and back to the toggle
  // button when it closes, so keyboard and screen reader users aren't
  // stranded. Skipped on first mount so the page doesn't steal focus
  // on load.
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (widgetState === WIDGET_STATE.INTRO) {
      textUsButtonRef.current?.focus();
    } else if (widgetState === WIDGET_STATE.CHAT) {
      messageInputRef.current?.focus();
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [widgetState]);

  useGSAP(
    () => {
      const intro = introRef.current;
      const chat = chatRef.current;

      if (!intro || !chat) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const showIntro = widgetState === WIDGET_STATE.INTRO;
      const showChat = widgetState === WIDGET_STATE.CHAT;

      if (reduceMotion) {
        gsap.set(intro, {
          display: showIntro ? "flex" : "none",
          autoAlpha: showIntro ? 1 : 0,
        });
        gsap.set(chat, {
          display: showChat ? "flex" : "none",
          autoAlpha: showChat ? 1 : 0,
        });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.4 },
      });

      if (showIntro) {
        gsap.set(chat, { display: "none" });
        gsap.set(intro, { display: "flex" });
        timeline.fromTo(
          intro,
          { autoAlpha: 0, y: 24, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1 },
        );
      } else if (showChat) {
        gsap.set(intro, { display: "none" });
        gsap.set(chat, { display: "flex" });
        timeline.fromTo(
          chat,
          { autoAlpha: 0, y: 24, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1 },
        );
      } else {
        timeline
          .to([intro, chat], {
            autoAlpha: 0,
            y: 16,
            scale: 0.96,
            duration: 0.3,
          })
          .set([intro, chat], { display: "none" });
      }
    },
    { dependencies: [widgetState] },
  );

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
        onClick={handleToggleClick}
        aria-label={isOpen ? "Minimise chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        <span className={styles.toggleIcon}>
          {isOpen ? (
            <svg
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          ) : (
            // Custom brand icon, saved at public/images/agent/chat-icon.svg.
            // Applied as a CSS mask (see .toggleIconImage) instead of an
            // <img src>, so it always picks up currentColor and stays
            // visible whether the button is charcoal, navy, or the cream
            // hover state, regardless of what colour the SVG was exported
            // in originally.
            <span className={styles.toggleIconImage} aria-hidden="true" />
          )}
        </span>
      </button>
    </div>
  );
}
