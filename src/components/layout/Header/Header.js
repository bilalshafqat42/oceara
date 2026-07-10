"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import styles from "./Header.module.css";

const navigation = [
  {
    label: "Overview",
    href: "#overview",
  },
  {
    label: "Residences",
    href: "#residences",
  },
  {
    label: "Location",
    href: "#location",
  },
  {
    label: "Amenities",
    href: "#amenities",
  },
];

export default function Header() {
  const headerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      const header = headerRef.current;

      if (!header) {
        return;
      }

      const entranceTimeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      entranceTimeline
        .from(styles.logo ? `.${styles.logo}` : null, {
          opacity: 0,
          y: -20,
          duration: 1,
        })
        .from(
          `.${styles.navigationItem}`,
          {
            opacity: 0,
            y: -16,
            duration: 0.8,
            stagger: 0.08,
          },
          "-=0.65",
        )
        .from(
          `.${styles.enquire}`,
          {
            opacity: 0,
            y: -16,
            duration: 0.8,
          },
          "-=0.6",
        );

      ScrollTrigger.create({
        start: 80,
        end: "max",
        onUpdate: (self) => {
          header.dataset.scrolled = self.scroll() > 80 ? "true" : "false";
        },
      });
    },
    {
      scope: headerRef,
    },
  );

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header ref={headerRef} className={styles.header} data-scrolled="false">
      <div className={styles.inner}>
        <a
          href="#home"
          className={styles.logo}
          aria-label="Oceara home"
          onClick={closeMenu}
        >
          Oceara
        </a>

        <nav
          className={`${styles.navigation} ${
            menuOpen ? styles.navigationOpen : ""
          }`}
          aria-label="Main navigation"
        >
          <ul className={styles.navigationList}>
            {navigation.map((item) => (
              <li key={item.href} className={styles.navigationItem}>
                <a
                  href={item.href}
                  className={styles.navigationLink}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a href="#contact" className={styles.enquire} onClick={closeMenu}>
          Enquire
        </a>

        <button
          type="button"
          className={`${styles.menuButton} ${
            menuOpen ? styles.menuButtonOpen : ""
          }`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
