"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./MapSection.module.css";

const MAPBOX_STYLE_URL =
  "mapbox://styles/refinedubai/cmrj946d7001k01r45t5vgnju";

/*
 * Mapbox coordinates always use:
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

/*
 * Create one geographic boundary containing
 * the project and all destinations.
 */
const createAllLocationsBounds = () => {
  const bounds = new mapboxgl.LngLatBounds();

  allLocations.forEach((location) => {
    bounds.extend(location.coordinates);
  });

  return bounds;
};

/*
 * Google Maps uses the visitor's current location
 * automatically because the origin is omitted.
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
  const mapStageRef = useRef(null);
  const overlayBackgroundRef = useRef(null);
  const travelListRef = useRef(null);
  const directionsRef = useRef(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapItemsRef = useRef([]);
  const resizeTimerRef = useRef(null);

  const [activeLocationId, setActiveLocationId] = useState(
    projectLocation.id,
  );

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState("");

  /*
   * Destination panel entrance animation.
   *
   * Desktop:
   * Beige overlay reveals from left to right.
   *
   * Mobile:
   * Beige gradient reveals from top to bottom.
   * Destination cards rise and fade in one by one.
   */
  useGSAP(
    () => {
      const mapStage = mapStageRef.current;
      const overlayBackground = overlayBackgroundRef.current;
      const travelList = travelListRef.current;
      const directionsLink = directionsRef.current;

      if (
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

      matchMedia.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const {
            mobile = false,
            reduceMotion = false,
          } = context.conditions ?? {};

          if (reduceMotion) {
            gsap.set(overlayBackground, {
              clipPath: "inset(0% 0% 0% 0%)",
            });

            gsap.set([...travelItems, directionsLink], {
              autoAlpha: 1,
              y: 0,
            });

            return undefined;
          }

          gsap.set(overlayBackground, {
            clipPath: mobile
              ? "inset(0% 0% 100% 0%)"
              : "inset(0% 100% 0% 0%)",
          });

          gsap.set(travelItems, {
            autoAlpha: 0,
            y: mobile ? 24 : 42,
          });

          gsap.set(directionsLink, {
            autoAlpha: 0,
            y: mobile ? 18 : 32,
          });

          const overlayTween = gsap.to(overlayBackground, {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",

            scrollTrigger: {
              trigger: mapStage,
              start: mobile ? "top 88%" : "top 82%",
              end: mobile ? "top 56%" : "top 34%",
              scrub: mobile ? 0.65 : 0.8,
              invalidateOnRefresh: true,
            },
          });

          const itemsTween = gsap.to(travelItems, {
            autoAlpha: 1,
            y: 0,
            duration: mobile ? 0.62 : 0.82,
            stagger: mobile ? 0.11 : 0.16,
            ease: "power3.out",

            scrollTrigger: {
              trigger: mapStage,
              start: mobile ? "top 68%" : "top 45%",
              once: true,
            },
          });

          const directionsTween = gsap.to(directionsLink, {
            autoAlpha: 1,
            y: 0,
            duration: mobile ? 0.62 : 0.8,
            ease: "power3.out",

            scrollTrigger: {
              trigger: mapStage,
              start: mobile ? "top 58%" : "top 32%",
              once: true,
            },
          });

          return () => {
            overlayTween.kill();
            itemsTween.kill();
            directionsTween.kill();
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
    const accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

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
     * Prevent mouse scrolling over the map
     * from zooming the map.
     */
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.doubleClickZoom.disable();
    map.keyboard.disable();

    /*
     * Touch users can zoom but cannot rotate.
     */
    map.touchZoomRotate.disableRotation();

    /*
     * Keep required attribution visible.
     */
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

      markerButton.setAttribute(
        "aria-label",
        `Focus map on ${location.name}`,
      );

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

      labelName.textContent =
        location.shortName || location.name;

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
     * Fit all markers into the visible map area.
     */
    const showAllLocations = ({ duration = 0 } = {}) => {
      const isMobile = window.matchMedia(
        "(max-width: 767px)",
      ).matches;

      const isTablet = window.matchMedia(
        "(max-width: 1100px)",
      ).matches;

      let padding;

      if (isMobile) {
        /*
         * The destination cards overlay the upper map.
         * Extra top padding keeps the project marker and
         * destination labels below the card area.
         */
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
       * Do not cover a working map because of a
       * temporary tile, font or image error.
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
        ({
          marker,
          popup,
          element,
          focusLocation,
        }) => {
          element.removeEventListener(
            "click",
            focusLocation,
          );

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
   * Synchronise the active marker appearance.
   */
  useEffect(() => {
    mapItemsRef.current.forEach(({ id, element }) => {
      element.dataset.active =
        id === activeLocationId ? "true" : "false";
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
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>
          Connected To The
        </p>

        <h2
          id="location-map-title"
          className={styles.heading}
        >
          City, Grounded By Nature
        </h2>

        <p className={styles.description}>
          Enjoy the tranquillity of island living while
          remaining effortlessly connected to Dubai&apos;s
          most important destinations, business districts,
          lifestyle hubs and leisure experiences.
        </p>
      </header>

      <div
        ref={mapStageRef}
        className={styles.mapStage}
      >
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
            <ul
              ref={travelListRef}
              className={styles.travelList}
            >
              {destinations.map((destination) => {
                const isActive =
                  activeLocationId === destination.id;

                return (
                  <li
                    key={destination.id}
                    className={styles.travelListItem}
                  >
                    <button
                      type="button"
                      className={styles.travelItem}
                      data-active={
                        isActive ? "true" : "false"
                      }
                      aria-pressed={isActive}
                      onClick={() =>
                        handleDestinationClick(destination)
                      }
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
          <div
            className={styles.mapError}
            role="alert"
          >
            <p>{mapError}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}