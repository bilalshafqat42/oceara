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
 *
 * Replace the project coordinates later with
 * the final approved Oceara Park Views location.
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

const createGoogleMapsUrl = (origin = "") => {
  const [longitude, latitude] = projectLocation.coordinates;

  const parameters = new URLSearchParams({
    api: "1",
    destination: `${latitude},${longitude}`,
    travelmode: "driving",
    dir_action: "navigate",
  });

  if (origin) {
    parameters.set("origin", origin);
  }

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

  const [activeLocationId, setActiveLocationId] = useState("");
  const [mapError, setMapError] = useState("");

  /*
   * Section animation:
   *
   * 1. Map remains fully visible all the time.
   * 2. Beige blurred background reveals left to right.
   * 3. Travel items fade upward one by one.
   * 4. See Directions appears after the items.
   */
  useGSAP(
    () => {
      const section = sectionRef.current;
      const mapStage = mapStageRef.current;
      const overlayBackground = overlayBackgroundRef.current;
      const travelList = travelListRef.current;
      const directionsLink = directionsRef.current;

      if (
        !section ||
        !mapStage ||
        !overlayBackground ||
        !travelList ||
        !directionsLink
      ) {
        return;
      }

      const travelItems = Array.from(travelList.children);

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
            gsap.set(overlayBackground, {
              clipPath: "inset(0% 0% 0% 0%)",
            });

            gsap.set([...travelItems, directionsLink], {
              autoAlpha: 1,
              y: 0,
            });

            return;
          }

          /*
           * Initial state:
           *
           * Map remains visible.
           * Only the beige blurred background is hidden.
           */
          gsap.set(overlayBackground, {
            clipPath: "inset(0% 100% 0% 0%)",
          });

          gsap.set(travelItems, {
            autoAlpha: 0,
            y: mobile ? 24 : 42,
          });

          gsap.set(directionsLink, {
            autoAlpha: 0,
            y: mobile ? 20 : 32,
          });

          /*
           * Reveal the beige/blur overlay horizontally.
           *
           * The map underneath never disappears.
           */
          gsap.to(overlayBackground, {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",

            scrollTrigger: {
              trigger: mapStage,
              start: "top 82%",
              end: mobile ? "top 42%" : "top 34%",
              scrub: mobile ? 0.55 : 0.8,
              invalidateOnRefresh: true,
            },
          });

          /*
           * Travel items appear one by one after
           * the overlay becomes sufficiently visible.
           */
          gsap.to(travelItems, {
            autoAlpha: 1,
            y: 0,
            duration: mobile ? 0.68 : 0.82,
            stagger: mobile ? 0.1 : 0.16,
            ease: "power3.out",

            scrollTrigger: {
              trigger: mapStage,
              start: mobile ? "top 52%" : "top 45%",
              once: true,
            },
          });

          /*
           * See Directions appears after the list.
           */
          gsap.to(directionsLink, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",

            scrollTrigger: {
              trigger: mapStage,
              start: mobile ? "top 40%" : "top 32%",
              once: true,
            },
          });
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

  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      setMapError(
        "Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local and restart the development server.",
      );

      return undefined;
    }

    if (!mapContainerRef.current || mapRef.current) {
      return undefined;
    }

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
     * Disable mouse-wheel, double-click,
     * keyboard and box zoom.
     *
     * Scrolling over the map continues scrolling
     * the webpage instead of zooming the map.
     */
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.doubleClickZoom.disable();
    map.keyboard.disable();

    /*
     * Disable map rotation on touch devices.
     */
    map.touchZoomRotate.disableRotation();

    map.addControl(
      new mapboxgl.AttributionControl({
        compact: false,
      }),
      "bottom-right",
    );

    allLocations.forEach((location) => {
      const markerButton = document.createElement("button");

      markerButton.type = "button";

      markerButton.className = location.isProject
        ? styles.projectMarker
        : styles.locationMarker;

      markerButton.setAttribute("aria-label", `Focus map on ${location.name}`);

      markerButton.dataset.locationId = location.id;
      markerButton.dataset.active = "false";

      const markerInner = document.createElement("span");

      markerInner.className = location.isProject
        ? styles.projectMarkerInner
        : styles.locationMarkerInner;

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

      /*
       * Permanent map label.
       */
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

    const showAllLocations = ({ duration = 0 } = {}) => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      const isTablet = window.matchMedia("(max-width: 1100px)").matches;

      let padding;

      if (isMobile) {
        padding = {
          top: 125,
          right: 65,
          bottom: 430,
          left: 65,
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
        maxZoom: isMobile ? 9.3 : 10,
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

      if (!map.loaded() && !map.isStyleLoaded()) {
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

  const handleDirectionsClick = (event) => {
    event.preventDefault();

    const newWindow = window.open(
      "about:blank",
      "_blank",
      "noopener,noreferrer",
    );

    const openDirections = (url) => {
      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.location.href = url;
      }
    };

    if (!navigator.geolocation) {
      openDirections(createGoogleMapsUrl());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;

        openDirections(createGoogleMapsUrl(origin));
      },
      () => {
        openDirections(createGoogleMapsUrl());
      },
      {
        enableHighAccuracy: false,
        timeout: 7000,
        maximumAge: 300000,
      },
    );
  };

  return (
    <section
      ref={sectionRef}
      id="location-map"
      className={styles.mapSection}
      aria-labelledby="location-map-title"
    >
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Connected To The</p>

        <h2 id="location-map-title" className={styles.heading}>
          City, Grounded By Nature
        </h2>

        <p className={styles.description}>
          Enjoy the tranquillity of island living while remaining effortlessly
          connected to Dubai&apos;s most important destinations, business
          districts, lifestyle hubs and leisure experiences.
        </p>
      </header>

      <div ref={mapStageRef} className={styles.mapStage}>
        {/* Map is always visible */}
        <div
          ref={mapContainerRef}
          className={styles.map}
          aria-label="Interactive map showing Oceara Park Views and nearby Dubai destinations"
        />

        <div
          className={styles.travelOverlay}
          aria-label="Travel times from Oceara Park Views"
        >
          {/* Only this background reveals left to right */}
          <div
            ref={overlayBackgroundRef}
            className={styles.overlayBackground}
            aria-hidden="true"
          />

          <div className={styles.travelContent}>
            <div ref={travelListRef} className={styles.travelList} role="list">
              {destinations.map((destination) => {
                const isActive = activeLocationId === destination.id;

                return (
                  <button
                    key={destination.id}
                    type="button"
                    role="listitem"
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
                );
              })}
            </div>

            <a
              ref={directionsRef}
              href={createGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.directionsLink}
              onClick={handleDirectionsClick}
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
    </section>
  );
}
