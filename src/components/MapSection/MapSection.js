"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./MapSection.module.css";

const MAPBOX_STYLE_URL =
  "mapbox://styles/refinedubai/cmrj946d7001k01r45t5vgnju";

/*
 * Mapbox coordinates use:
 * [longitude, latitude]
 */
const projectLocation = {
  id: "project",
  name: "Oceara Park Views",
  time: "Project Location",
  coordinates: [55.3076, 25.2908],
  zoom: 13.8,
  isProject: true,
  popupAnchor: "bottom",
  popupOffset: [0, -62],
};

const destinations = [
  {
    id: "airport",
    name: "Dubai International Airport (DXB)",
    shortName: "Dubai International Airport",
    time: "15 Min",
    coordinates: [55.3644, 25.2532],
    zoom: 12.4,
    popupAnchor: "bottom-left",
    popupOffset: [14, -13],
  },
  {
    id: "downtown",
    name: "Downtown Dubai, Burj Khalifa",
    shortName: "Downtown Dubai",
    time: "20 Min",
    coordinates: [55.2744, 25.1972],
    zoom: 12.4,
    popupAnchor: "bottom-right",
    popupOffset: [-14, -13],
  },
  {
    id: "creek-golf",
    name: "Dubai Creek Golf Club",
    shortName: "Dubai Creek Golf Club",
    time: "20 Min",
    coordinates: [55.3337, 25.2425],
    zoom: 13,
    popupAnchor: "top-left",
    popupOffset: [14, 13],
  },
  {
    id: "marina",
    name: "Dubai Marina",
    shortName: "Dubai Marina",
    time: "30 Min",
    coordinates: [55.139, 25.0805],
    zoom: 12.2,
    popupAnchor: "bottom-right",
    popupOffset: [-14, -13],
  },
];

const allLocations = [projectLocation, ...destinations];

const createAllLocationsBounds = () => {
  const bounds = new mapboxgl.LngLatBounds();

  allLocations.forEach((location) => {
    bounds.extend(location.coordinates);
  });

  return bounds;
};

/*
 * Google Maps uses the visitor's current location
 * when the origin parameter is omitted.
 */
const createGoogleMapsUrl = () => {
  const [longitude, latitude] = projectLocation.coordinates;

  const parameters = new URLSearchParams({
    api: "1",
    destination: `${latitude},${longitude}`,
    travelmode: "driving",
    dir_action: "navigate",
  });

  return `https://www.google.com/maps/dir/?${parameters.toString()}`;
};

export default function MapSection() {
  const sectionRef = useRef(null);
  const sectionInnerRef = useRef(null);

  const sectionHeaderRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);

  const mapStageRef = useRef(null);
  const overlayBackgroundRef = useRef(null);
  const travelListRef = useRef(null);
  const directionsRef = useRef(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapItemsRef = useRef([]);
  const resizeTimerRef = useRef(null);

  const [activeLocationId, setActiveLocationId] = useState(projectLocation.id);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState("");

  /*
   * Complete-section entrance and exit.
   *
   * The section fades in when entering the viewport.
   * It fades upward and out as the user leaves it.
   * Scrubbing automatically reverses the effect when
   * the user scrolls back upward.
   */
  useGSAP(
    () => {
      const section = sectionRef.current;
      const sectionInner = sectionInnerRef.current;

      if (!section || !sectionInner) {
        return undefined;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile = false, reduceMotion = false } =
            context.conditions ?? {};

          if (reduceMotion) {
            gsap.set(sectionInner, {
              autoAlpha: 1,
              y: 0,
              clearProps: "transform",
            });

            return undefined;
          }

          /*
           * Initial section entrance.
           */
          const entranceTween = gsap.fromTo(
            sectionInner,
            {
              autoAlpha: 0,
              y: mobile ? 28 : 44,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.85 : 1,
              ease: "power3.out",

              scrollTrigger: {
                trigger: section,
                start: "top 84%",
                toggleActions: "play none none reverse",
                invalidateOnRefresh: true,
              },
            },
          );

          /*
           * Exit effect near the end of the section.
           */
          const exitTween = gsap.fromTo(
            sectionInner,
            {
              autoAlpha: 1,
              y: 0,
            },
            {
              autoAlpha: 0,
              y: mobile ? -24 : -40,
              ease: "none",

              scrollTrigger: {
                trigger: section,
                start: mobile ? "bottom 42%" : "bottom 48%",
                end: "bottom top",
                scrub: mobile ? 0.5 : 0.7,
                invalidateOnRefresh: true,
              },
            },
          );

          return () => {
            entranceTween.kill();
            exitTween.kill();
          };
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

  /*
   * Heading and map content animations.
   */
  useGSAP(
    () => {
      const sectionHeader = sectionHeaderRef.current;
      const eyebrow = eyebrowRef.current;
      const heading = headingRef.current;
      const description = descriptionRef.current;

      const mapStage = mapStageRef.current;
      const overlayBackground = overlayBackgroundRef.current;
      const travelList = travelListRef.current;
      const directionsLink = directionsRef.current;

      if (
        !sectionHeader ||
        !eyebrow ||
        !heading ||
        !description ||
        !mapStage ||
        !overlayBackground ||
        !travelList ||
        !directionsLink
      ) {
        return undefined;
      }

      const travelItems = Array.from(
        travelList.querySelectorAll(`.${styles.travelItem}`),
      );

      if (travelItems.length === 0) {
        return undefined;
      }

      const matchMedia = gsap.matchMedia();

      /*
       * =====================================================
       * Desktop animations
       * =====================================================
       */
      matchMedia.add(
        {
          desktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop = false, reduceMotion = false } =
            context.conditions ?? {};

          if (!desktop) {
            return undefined;
          }

          if (reduceMotion) {
            gsap.set([eyebrow, heading, description], {
              autoAlpha: 1,
              y: 0,
              clearProps: "transform",
            });

            gsap.set(overlayBackground, {
              clipPath: "inset(0% 0% 0% 0%)",
            });

            gsap.set([...travelItems, directionsLink], {
              autoAlpha: 1,
              y: 0,
              clearProps: "transform",
            });

            return undefined;
          }

          /*
           * Heading initial states.
           */
          gsap.set(eyebrow, {
            autoAlpha: 0,
            y: 26,
          });

          gsap.set(heading, {
            autoAlpha: 0,
            y: 36,
          });

          gsap.set(description, {
            autoAlpha: 0,
            y: 30,
          });

          /*
           * Heading sequence:
           * eyebrow → heading → description.
           */
          const headingTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: sectionHeader,
              start: "top 78%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          });

          headingTimeline
            .to(eyebrow, {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
            })
            .to(
              heading,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.82,
                ease: "power3.out",
              },
              "-=0.46",
            )
            .to(
              description,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.82,
                ease: "power3.out",
              },
              "-=0.4",
            );

          /*
           * Desktop beige overlay.
           */
          gsap.set(overlayBackground, {
            clipPath: "inset(0% 100% 0% 0%)",
          });

          gsap.set(travelItems, {
            autoAlpha: 0,
            y: 44,
          });

          gsap.set(directionsLink, {
            autoAlpha: 0,
            y: 28,
          });

          const overlayTween = gsap.to(overlayBackground, {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",

            scrollTrigger: {
              trigger: mapStage,
              start: "top 84%",
              end: "top 36%",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          /*
           * Slightly slower stagger so each destination
           * has enough time to be noticed.
           */
          const destinationStagger = 0.22;

          const itemsTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: mapStage,
              start: "top 55%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          });

          travelItems.forEach((item, index) => {
            itemsTimeline.to(
              item,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.84,
                ease: "power3.out",
              },
              index * destinationStagger,
            );
          });

          itemsTimeline.to(
            directionsLink,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
            },
            travelItems.length * destinationStagger + 0.14,
          );

          return () => {
            headingTimeline.kill();
            overlayTween.kill();
            itemsTimeline.kill();
          };
        },
      );

      /*
       * =====================================================
       * Mobile animations
       * =====================================================
       */
      matchMedia.add(
        {
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile = false, reduceMotion = false } =
            context.conditions ?? {};

          if (!mobile) {
            return undefined;
          }

          if (reduceMotion) {
            gsap.set([eyebrow, heading, description], {
              autoAlpha: 1,
              y: 0,
              clearProps: "transform",
            });

            gsap.set(overlayBackground, {
              clipPath: "inset(0% 0% 0% 0%)",
            });

            gsap.set([...travelItems, directionsLink], {
              autoAlpha: 1,
              y: 0,
              clearProps: "transform",
            });

            return undefined;
          }

          /*
           * Keep heading visible on mobile.
           */
          gsap.set([eyebrow, heading, description], {
            autoAlpha: 1,
            y: 0,
          });

          /*
           * Mobile beige overlay rolls from top to bottom.
           */
          gsap.set(overlayBackground, {
            clipPath: "inset(0% 0% 100% 0%)",
          });

          gsap.set(travelItems, {
            autoAlpha: 0,
            y: 24,
          });

          gsap.set(directionsLink, {
            autoAlpha: 0,
            y: 18,
          });

          const mobileOverlayTween = gsap.to(overlayBackground, {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",

            scrollTrigger: {
              trigger: mapStage,
              start: "top 88%",
              end: "top 56%",
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          });

          /*
           * Mobile 2×2 cards fade upward one by one.
           */
          const mobileItemsTween = gsap.to(travelItems, {
            autoAlpha: 1,
            y: 0,
            duration: 0.66,
            stagger: 0.14,
            ease: "power3.out",

            scrollTrigger: {
              trigger: mapStage,
              start: "top 68%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          });

          const mobileDirectionsTween = gsap.to(directionsLink, {
            autoAlpha: 1,
            y: 0,
            duration: 0.64,
            ease: "power3.out",

            scrollTrigger: {
              trigger: mapStage,
              start: "top 57%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          });

          return () => {
            mobileOverlayTween.kill();
            mobileItemsTween.kill();
            mobileDirectionsTween.kill();
          };
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

  /*
   * Mapbox initialisation.
   */
  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      setMapLoaded(false);

      setMapError(
        "Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local and restart the development server.",
      );

      return undefined;
    }

    if (!mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    setMapLoaded(false);
    setMapError("");

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      accessToken,
      style: MAPBOX_STYLE_URL,

      center: projectLocation.coordinates,
      zoom: 9.7,

      pitch: 0,
      bearing: 0,

      attributionControl: false,

      cooperativeGestures: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    });

    mapRef.current = map;

    /*
     * Prevent page scrolling over the map from
     * changing the map zoom.
     */
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.doubleClickZoom.disable();
    map.keyboard.disable();

    /*
     * Touch zoom remains available, but rotation is disabled.
     */
    map.touchZoomRotate.disableRotation();

    map.addControl(
      new mapboxgl.AttributionControl({
        compact: false,
      }),
      "bottom-right",
    );

    /*
     * Create markers and permanent labels.
     */
    allLocations.forEach((location) => {
      const markerButton = document.createElement("button");

      markerButton.type = "button";

      markerButton.className = location.isProject
        ? styles.projectMarker
        : styles.locationMarker;

      markerButton.setAttribute("aria-label", `Focus map on ${location.name}`);

      markerButton.dataset.locationId = location.id;

      markerButton.dataset.active =
        location.id === projectLocation.id ? "true" : "false";

      const markerInner = document.createElement("span");

      markerInner.className = location.isProject
        ? styles.projectMarkerInner
        : styles.locationMarkerInner;

      markerInner.setAttribute("aria-hidden", "true");

      markerButton.appendChild(markerInner);

      const focusLocation = () => {
        setActiveLocationId(location.id);

        map.flyTo({
          center: location.coordinates,
          zoom: location.zoom,
          duration: 1200,
          essential: true,
        });
      };

      markerButton.addEventListener("click", focusLocation);

      const labelContent = document.createElement("div");

      labelContent.className = location.isProject
        ? `${styles.mapLabelContent} ${styles.projectLabelContent}`
        : styles.mapLabelContent;

      const labelName = document.createElement("strong");

      labelName.textContent = location.shortName || location.name;

      const labelTime = document.createElement("span");

      labelTime.textContent = location.time;

      labelContent.appendChild(labelName);
      labelContent.appendChild(labelTime);

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        focusAfterOpen: false,

        anchor: location.popupAnchor,
        offset: location.popupOffset,

        className: location.isProject
          ? `${styles.mapLabel} ${styles.projectMapLabel}`
          : styles.mapLabel,
      })
        .setLngLat(location.coordinates)
        .setDOMContent(labelContent)
        .addTo(map);

      const marker = new mapboxgl.Marker({
        element: markerButton,
        anchor: location.isProject ? "bottom" : "center",
      })
        .setLngLat(location.coordinates)
        .addTo(map);

      mapItemsRef.current.push({
        id: location.id,
        element: markerButton,
        marker,
        popup,
        focusLocation,
      });
    });

    /*
     * Fit all markers into the available map area.
     */
    const showAllLocations = ({ duration = 0 } = {}) => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      const isTablet = window.matchMedia("(max-width: 1100px)").matches;

      let padding;

      if (isMobile) {
        const overlaySpace = Math.min(
          Math.round(window.innerHeight * 0.38),
          350,
        );

        padding = {
          top: overlaySpace,
          right: 34,
          bottom: 54,
          left: 34,
        };
      } else if (isTablet) {
        padding = {
          top: 100,
          right: 90,
          bottom: 100,
          left: 390,
        };
      } else {
        padding = {
          top: 115,
          right: 120,
          bottom: 115,
          left: 530,
        };
      }

      map.fitBounds(createAllLocationsBounds(), {
        padding,
        maxZoom: isMobile ? 9.15 : 10,
        duration,
        essential: true,
        retainPadding: false,
      });
    };

    const handleMapLoad = () => {
      map.resize();

      window.requestAnimationFrame(() => {
        showAllLocations({
          duration: 0,
        });
      });

      setMapLoaded(true);
      setMapError("");
    };

    const handleResize = () => {
      window.clearTimeout(resizeTimerRef.current);

      resizeTimerRef.current = window.setTimeout(() => {
        map.resize();

        showAllLocations({
          duration: 0,
        });
      }, 180);
    };

    const handleMapError = (event) => {
      console.error("Mapbox error:", event.error);

      /*
       * Avoid covering a working map because of a
       * temporary individual tile or font error.
       */
      if (!map.loaded() && !map.isStyleLoaded()) {
        setMapLoaded(false);

        setMapError(
          "The map could not be loaded. Check the Mapbox token and published custom style.",
        );
      }
    };

    map.on("load", handleMapLoad);
    map.on("error", handleMapError);

    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(resizeTimerRef.current);

      window.removeEventListener("resize", handleResize);

      map.off("load", handleMapLoad);
      map.off("error", handleMapError);

      mapItemsRef.current.forEach(
        ({ marker, popup, element, focusLocation }) => {
          element.removeEventListener("click", focusLocation);

          popup.remove();
          marker.remove();
        },
      );

      mapItemsRef.current = [];

      map.remove();
      mapRef.current = null;
    };
  }, []);

  /*
   * Synchronise active markers with destination cards.
   */
  useEffect(() => {
    mapItemsRef.current.forEach(({ id, element }) => {
      element.dataset.active = id === activeLocationId ? "true" : "false";
    });
  }, [activeLocationId]);

  const handleDestinationClick = (destination) => {
    setActiveLocationId(destination.id);

    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.flyTo({
      center: destination.coordinates,
      zoom: destination.zoom,
      duration: 1200,
      essential: true,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="location-map"
      className={styles.mapSection}
      aria-labelledby="location-map-title"
    >
      <div ref={sectionInnerRef} className={styles.sectionInner}>
        <header ref={sectionHeaderRef} className={styles.sectionHeader}>
          <p ref={eyebrowRef} className={styles.eyebrow}>
            Connected To The
          </p>

          <h2
            ref={headingRef}
            id="location-map-title"
            className={styles.heading}
          >
            City, Grounded By Nature
          </h2>

          <p ref={descriptionRef} className={styles.description}>
            Enjoy the tranquillity of island living while remaining effortlessly
            connected to Dubai&apos;s most important destinations, business
            districts, lifestyle hubs and leisure experiences.
          </p>
        </header>

        <div ref={mapStageRef} className={styles.mapStage}>
          <div
            ref={mapContainerRef}
            className={styles.map}
            aria-label="Interactive map showing Oceara Park Views and nearby Dubai destinations"
          />

          {!mapLoaded && !mapError ? (
            <div
              className={styles.mapLoading}
              aria-live="polite"
              aria-label="Loading interactive map"
            >
              <span>Loading Map</span>
            </div>
          ) : null}

          <div
            className={styles.travelOverlay}
            aria-label="Travel times from Oceara Park Views"
          >
            <div
              ref={overlayBackgroundRef}
              className={styles.overlayBackground}
              aria-hidden="true"
            />

            <div className={styles.travelContent}>
              <ul ref={travelListRef} className={styles.travelList}>
                {destinations.map((destination) => {
                  const isActive = activeLocationId === destination.id;

                  return (
                    <li key={destination.id} className={styles.travelListItem}>
                      <button
                        type="button"
                        className={styles.travelItem}
                        data-active={isActive ? "true" : "false"}
                        aria-pressed={isActive}
                        onClick={() => handleDestinationClick(destination)}
                      >
                        <span className={styles.travelTime}>
                          {destination.time}
                        </span>

                        <span className={styles.travelName}>
                          {destination.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <a
                ref={directionsRef}
                href={createGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.directionsLink}
              >
                See Directions
              </a>
            </div>
          </div>

          {mapError ? (
            <div className={styles.mapError} role="alert">
              <p>{mapError}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
