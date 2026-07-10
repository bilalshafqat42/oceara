"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import styles from "./Header.module.css";

const menuItems = [
  { label: "About", href: "#about" },
  { label: "Location", href: "#location" },
  { label: "Amenities", href: "#amenities" },
  { label: "Payment Plan", href: "#payment-plan" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const menuTimelineRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      const header = headerRef.current;

      if (!header) return;

      const introTimeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      introTimeline
        .from(`.${styles.menuControl}`, {
          opacity: 0,
          y: -14,
          duration: 0.9,
        })
        .from(
          `.${styles.logo}`,
          {
            opacity: 0,
            y: -14,
            duration: 0.9,
          },
          "-=0.7",
        )
        .from(
          `.${styles.callback}`,
          {
            opacity: 0,
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

      const scrollTrigger = ScrollTrigger.create({
        start: 80,
        end: "max",
        onUpdate: (self) => {
          header.dataset.scrolled = self.scroll() > 80 ? "true" : "false";
        },
      });

      return () => {
        scrollTrigger.kill();
      };
    },
    {
      scope: headerRef,
    },
  );

  useGSAP(
    () => {
      const menu = menuRef.current;

      if (!menu) return;

      gsap.set(menu, {
        clipPath: "inset(0 100% 0 0)",
        visibility: "visible",
        pointerEvents: "none",
      });

      const timeline = gsap.timeline({
        paused: true,
        defaults: {
          ease: "power4.inOut",
        },
        onStart: () => {
          gsap.set(menu, {
            pointerEvents: "auto",
          });
        },
        onReverseComplete: () => {
          gsap.set(menu, {
            pointerEvents: "none",
          });

          setMenuOpen(false);
        },
      });

      timeline
        .to(menu, {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.15,
        })
        .from(
          `.${styles.closeButton}`,
          {
            opacity: 0,
            rotate: -45,
            duration: 0.6,
            ease: "power3.out",
          },
          0.45,
        )
        .from(
          `.${styles.menuLogo}`,
          {
            opacity: 0,
            y: -16,
            duration: 0.7,
            ease: "power3.out",
          },
          0.45,
        )
        .from(
          `.${styles.menuItem}`,
          {
            opacity: 0,
            x: -28,
            duration: 0.7,
            stagger: 0.07,
            ease: "power3.out",
          },
          0.5,
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
  setMenuOpen(true);
  document.body.style.overflow = "hidden";

  menuTimelineRef.current?.play();
}, []);

const closeMenu = useCallback(() => {
  document.body.style.overflow = "";

  menuTimelineRef.current?.reverse();
}, []);

const handleMenuLinkClick = useCallback(() => {
  closeMenu();
}, [closeMenu]);

useEffect(() => {
  const handleEscape = (event) => {
    if (event.key === "Escape" && menuOpen) {
      closeMenu();
    }
  };

  window.addEventListener("keydown", handleEscape);

  return () => {
    window.removeEventListener("keydown", handleEscape);
    document.body.style.overflow = "";
  };
}, [menuOpen, closeMenu]);
  return (
    <>
      <header ref={headerRef} className={styles.header} data-scrolled="false">
        <div className={styles.inner}>
          <button
            type="button"
            className={styles.menuControl}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="oceara-menu"
            onClick={openMenu}
          >
            <span className={styles.menuIcon} aria-hidden="true" />

            <span className={styles.menuText}>Menu</span>
          </button>

          <a href="#home" className={styles.logo} aria-label="Oceara home">
            <span className={styles.logoMark} aria-hidden="true" />
          </a>

          <a href="#contact" className={styles.callback}>
            Request Callback
          </a>
        </div>

        <div className={styles.divider} />
      </header>

      <div
        ref={menuRef}
        id="oceara-menu"
        className={styles.menuOverlay}
        aria-hidden={!menuOpen}
      >
        <div
          // ref={bluePanelRef}
          className={styles.menuBluePanel}
        >
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close navigation menu"
            onClick={closeMenu}
          >
            <span className={styles.closeIcon} aria-hidden="true" />
          </button>

          <a
            href="#home"
            className={styles.menuLogo}
            aria-label="Oceara home"
            onClick={handleMenuLinkClick}
          >
            <span className={styles.menuLogoMark} aria-hidden="true" />
          </a>

          <nav className={styles.menuNavigation} aria-label="Main navigation">
            <ul className={styles.menuList}>
              {menuItems.map((item, index) => (
                <li key={item.href} className={styles.menuItem}>
                  <a
                    href={item.href}
                    className={`${styles.menuLink} ${
                      index === 0 ? styles.menuLinkActive : ""
                    }`}
                    onClick={handleMenuLinkClick}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          // ref={imagePanelRef}
          className={styles.menuImagePanel}
          aria-hidden="true"
        />
      </div>
    </>
  );
}
