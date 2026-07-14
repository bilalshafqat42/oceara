"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  gsap,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";

import styles from "./Header.module.css";

const menuItems = [
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Location",
    href: "#location",
  },
  {
    label: "Amenities",
    href: "#amenities",
  },
  {
    label: "Payment Plan",
    href: "#payment-plan",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];

/*
 * Shared Hero/About animation stages:
 *
 * 0.00 = Hero
 * 0.50 = Beige About panel
 * 1.00 = Complete About section
 *
 * The glass header activates near the final stage.
 */
const HEADER_CHANGE_PROGRESS = 0.66;

export default function Header() {
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const closeButtonRef = useRef(null);

  const menuTimelineRef = useRef(null);
  const previousOverflowRef = useRef("");
  const pendingNavigationRef = useRef("");

  const [menuOpen, setMenuOpen] = useState(false);

  /*
   * Smoothly navigate to a section while accounting
   * for the fixed header.
   *
   * The Hero always returns to the absolute page top.
   */
  const scrollToSection = useCallback((href) => {
    if (!href) {
      return;
    }

    if (href === "#home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    const headerHeight =
      headerRef.current?.getBoundingClientRect().height ?? 0;

    const targetTop =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }, []);

  /*
   * Header entrance and scroll appearance.
   */
  useGSAP(
    () => {
      const header = headerRef.current;

      if (!header) {
        return undefined;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      let introTimeline;

      if (!reduceMotion) {
        introTimeline = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        introTimeline
          .from(`.${styles.menuControl}`, {
            autoAlpha: 0,
            y: -14,
            duration: 0.9,
          })
          .from(
            `.${styles.logo}`,
            {
              autoAlpha: 0,
              y: -14,
              duration: 0.9,
            },
            "-=0.7",
          )
          .from(
            `.${styles.callback}`,
            {
              autoAlpha: 0,
              y: -14,
              duration: 0.9,
            },
            "-=0.7",
          )
          .from(
            `.${styles.divider}`,
            {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 1.2,
            },
            "-=0.55",
          );
      }

      const heroScene = document.getElementById(
        "hero-about-scene",
      );

      let headerScrollTrigger;

      if (heroScene) {
        headerScrollTrigger = ScrollTrigger.create({
          trigger: heroScene,
          start: "top top",
          end: "bottom bottom",

          onUpdate: (self) => {
            header.dataset.scrolled =
              self.progress >= HEADER_CHANGE_PROGRESS
                ? "true"
                : "false";
          },

          onLeave: () => {
            header.dataset.scrolled = "true";
          },

          onEnterBack: (self) => {
            header.dataset.scrolled =
              self.progress >= HEADER_CHANGE_PROGRESS
                ? "true"
                : "false";
          },

          onLeaveBack: () => {
            header.dataset.scrolled = "false";
          },

          onRefresh: (self) => {
            header.dataset.scrolled =
              self.progress >= HEADER_CHANGE_PROGRESS
                ? "true"
                : "false";
          },
        });
      } else {
        /*
         * Development fallback if the shared
         * Hero/About scene is temporarily unavailable.
         */
        headerScrollTrigger = ScrollTrigger.create({
          start: 80,
          end: "max",

          onUpdate: (self) => {
            header.dataset.scrolled =
              self.scroll() > 80 ? "true" : "false";
          },
        });
      }

      return () => {
        introTimeline?.kill();
        headerScrollTrigger?.kill();
      };
    },
    {
      scope: headerRef,
    },
  );

  /*
   * Full-screen menu animation.
   *
   * Open:
   * left to right.
   *
   * Close:
   * reverse from right to left.
   */
  useGSAP(
    () => {
      const menu = menuRef.current;

      if (!menu) {
        return undefined;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(menu, {
        clipPath: "inset(0 100% 0 0)",
        visibility: "visible",
        pointerEvents: "none",
      });

      const timeline = gsap.timeline({
        paused: true,

        defaults: {
          ease: reduceMotion
            ? "none"
            : "power4.inOut",
        },

        onStart: () => {
          gsap.set(menu, {
            pointerEvents: "auto",
          });
        },

        onComplete: () => {
          /*
           * Move keyboard focus into the open menu.
           */
          window.requestAnimationFrame(() => {
            closeButtonRef.current?.focus({
              preventScroll: true,
            });
          });
        },

        onReverseComplete: () => {
          gsap.set(menu, {
            pointerEvents: "none",
          });

          document.body.style.overflow =
            previousOverflowRef.current;

          setMenuOpen(false);

          const pendingHref =
            pendingNavigationRef.current;

          pendingNavigationRef.current = "";

          if (pendingHref) {
            /*
             * Wait until the overlay has completely closed
             * before smoothly moving to the selected section.
             */
            window.requestAnimationFrame(() => {
              scrollToSection(pendingHref);
            });
          } else {
            /*
             * Return keyboard focus to the control
             * that originally opened the menu.
             */
            window.requestAnimationFrame(() => {
              menuButtonRef.current?.focus({
                preventScroll: true,
              });
            });
          }
        },
      });

      const openDuration = reduceMotion ? 0.01 : 1.15;
      const elementDuration = reduceMotion ? 0.01 : 0.7;

      timeline
        .to(menu, {
          clipPath: "inset(0 0% 0 0)",
          duration: openDuration,
        })
        .from(
          `.${styles.closeButton}`,
          {
            autoAlpha: 0,
            rotate: reduceMotion ? 0 : -45,
            duration: reduceMotion ? 0.01 : 0.6,
            ease: reduceMotion
              ? "none"
              : "power3.out",
          },
          reduceMotion ? 0 : 0.45,
        )
        .from(
          `.${styles.menuLogo}`,
          {
            autoAlpha: 0,
            y: reduceMotion ? 0 : -16,
            duration: elementDuration,
            ease: reduceMotion
              ? "none"
              : "power3.out",
          },
          reduceMotion ? 0 : 0.45,
        )
        .from(
          `.${styles.menuItem}`,
          {
            autoAlpha: 0,
            x: reduceMotion ? 0 : -28,
            duration: elementDuration,
            stagger: reduceMotion ? 0 : 0.07,
            ease: reduceMotion
              ? "none"
              : "power3.out",
          },
          reduceMotion ? 0 : 0.5,
        );

      menuTimelineRef.current = timeline;

      return () => {
        timeline.kill();
        menuTimelineRef.current = null;
      };
    },
    {
      scope: menuRef,
    },
  );

  const openMenu = useCallback(() => {
    if (menuOpen) {
      return;
    }

    previousOverflowRef.current =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    pendingNavigationRef.current = "";

    setMenuOpen(true);

    /*
     * Restart instead of play so repeated openings
     * always begin from the correct closed state.
     */
    menuTimelineRef.current?.restart();
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    pendingNavigationRef.current = "";

    if (!menuTimelineRef.current) {
      document.body.style.overflow =
        previousOverflowRef.current;

      setMenuOpen(false);
      return;
    }

    menuTimelineRef.current.reverse();
  }, []);

  /*
   * Logo and standard header navigation.
   */
  const handleHeaderNavigation = useCallback(
    (event, href) => {
      event.preventDefault();

      scrollToSection(href);
    },
    [scrollToSection],
  );

  /*
   * Menu navigation first closes the overlay,
   * then smoothly scrolls to the selected section.
   */
  const handleMenuNavigation = useCallback(
    (event, href) => {
      event.preventDefault();

      pendingNavigationRef.current = href;

      menuTimelineRef.current?.reverse();
    },
    [],
  );

  /*
   * Escape-key support.
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [menuOpen, closeMenu]);

  /*
   * Ensure scrolling is restored if Header unmounts
   * while the menu is open.
   */
  useEffect(() => {
    return () => {
      document.body.style.overflow =
        previousOverflowRef.current;
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={styles.header}
        data-scrolled="false"
      >
        <div className={styles.inner}>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuControl}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="oceara-menu"
            onClick={openMenu}
          >
            <span
              className={styles.menuIcon}
              aria-hidden="true"
            />

            <span className={styles.menuText}>
              Menu
            </span>
          </button>

          <a
            href="#home"
            className={styles.logo}
            aria-label="Return to the Oceara Hero section"
            onClick={(event) =>
              handleHeaderNavigation(event, "#home")
            }
          >
            <span
              className={styles.logoMark}
              aria-hidden="true"
            />
          </a>

          <a
            href="#contact"
            className={styles.callback}
            data-contact-popup
          >
            Request Callback
          </a>
        </div>

        <div
          className={styles.divider}
          aria-hidden="true"
        />
      </header>

      <div
        ref={menuRef}
        id="oceara-menu"
        className={styles.menuOverlay}
        aria-hidden={!menuOpen}
      >
        <div className={styles.menuBluePanel}>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            aria-label="Close navigation menu"
            onClick={closeMenu}
          >
            <span
              className={styles.closeIcon}
              aria-hidden="true"
            />
          </button>

          <a
            href="#home"
            className={styles.menuLogo}
            aria-label="Return to the Oceara Hero section"
            onClick={(event) =>
              handleMenuNavigation(event, "#home")
            }
          >
            <span
              className={styles.menuLogoMark}
              aria-hidden="true"
            />
          </a>

          <nav
            className={styles.menuNavigation}
            aria-label="Main navigation"
          >
            <ul className={styles.menuList}>
              {menuItems.map((item) => (
                <li
                  key={item.href}
                  className={styles.menuItem}
                >
                  <a
                    href={item.href}
                    className={styles.menuLink}
                    onClick={(event) =>
                      handleMenuNavigation(
                        event,
                        item.href,
                      )
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          className={styles.menuImagePanel}
          aria-hidden="true"
        />
      </div>
    </>
  );
}