"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import styles from "./MapSection.module.css";

const MAPBOX_STYLE_URL =
  "mapbox://styles/refinedubai/cmrj946d7001k01r45t5vgnju";

const locations = [
  {
    id: "project",
    name: "Oceara Park Views",
    time: "Project location",
    coordinates: [55.3076, 25.2908],
    zoom: 13.8,
    isProject: true,
  },
  {
    id: "airport",
    name: "Dubai International Airport",
    time: "25 minutes",
    coordinates: [55.3644, 25.2532],
    zoom: 12.5,
    isProject: false,
  },
  {
    id: "downtown",
    name: "Downtown Dubai",
    time: "30 minutes",
    coordinates: [55.2744, 25.1972],
    zoom: 12.5,
    isProject: false,
  },
  {
    id: "marina",
    name: "Dubai Marina",
    time: "35 minutes",
    coordinates: [55.139, 25.0805],
    zoom: 12.5,
    isProject: false,
  },
];

const initialLocation = locations[0];

/*
 * Creates one geographical boundary containing
 * every project and destination coordinate.
 */
const getAllLocationsBounds = () => {
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    bounds.extend(location.coordinates);
  });

  return bounds;
};

export default function MapSection() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapItemsRef = useRef([]);

  const [activeLocationId, setActiveLocationId] = useState(initialLocation.id);

  const [mapError, setMapError] = useState("");

  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      setMapError(
        "Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local and restart the server.",
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

      /*
       * This is only a temporary camera position
       * while the style and tiles are loading.
       *
       * fitBounds() replaces it after map load.
       */
      center: initialLocation.coordinates,
      zoom: 9.8,

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
     * Required Mapbox attribution.
     *
     * No NavigationControl is added, so no
     * plus or minus zoom buttons appear.
     */
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: false,
      }),
      "bottom-right",
    );

    locations.forEach((location) => {
      const markerButton = document.createElement("button");

      markerButton.type = "button";

      markerButton.className = location.isProject
        ? styles.projectMarker
        : styles.locationMarker;

      markerButton.setAttribute("aria-label", `Focus map on ${location.name}`);

      markerButton.dataset.locationId = location.id;

      markerButton.dataset.active =
        location.id === initialLocation.id ? "true" : "false";

      const markerInner = document.createElement("span");

      markerInner.className = location.isProject
        ? styles.projectMarkerInner
        : styles.locationMarkerInner;

      markerButton.appendChild(markerInner);

      const handleMarkerClick = () => {
        setActiveLocationId(location.id);

        map.flyTo({
          center: location.coordinates,
          zoom: location.zoom,
          duration: 1400,
          essential: true,
        });
      };

      markerButton.addEventListener("click", handleMarkerClick);

      /*
       * Permanent destination label.
       */
      const popupContent = document.createElement("div");

      popupContent.className = location.isProject
        ? `${styles.popupContent} ${styles.projectPopupContent}`
        : styles.popupContent;

      const popupName = document.createElement("strong");

      popupName.textContent = location.name;

      const popupTime = document.createElement("span");

      popupTime.textContent = location.time;

      popupContent.appendChild(popupName);
      popupContent.appendChild(popupTime);

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        focusAfterOpen: false,

        anchor: "bottom",

        offset: location.isProject ? [0, -58] : [0, -18],

        className: location.isProject
          ? `${styles.mapPopup} ${styles.projectPopup}`
          : styles.mapPopup,
      })
        .setLngLat(location.coordinates)
        .setDOMContent(popupContent)
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
        handleMarkerClick,
      });
    });

    /*
     * Shows every destination and gives additional
     * room for the permanent labels around the edges.
     */
    const showAllLocations = ({ duration = 0 } = {}) => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      const bounds = getAllLocationsBounds();

      map.fitBounds(bounds, {
        padding: isMobile
          ? {
              top: 100,
              right: 90,
              bottom: 110,
              left: 90,
            }
          : {
              top: 125,
              right: 150,
              bottom: 125,
              left: 150,
            },

        /*
         * Prevent the automatic calculation from
         * zooming too far into a narrow bounds area.
         */
        maxZoom: isMobile ? 9.6 : 10.15,

        duration,
        essential: true,

        /*
         * Do not make this padding permanent for
         * later flyTo camera movements.
         */
        retainPadding: false,
      });
    };

    const handleMapLoad = () => {
      map.resize();

      /*
       * Wait one frame so Mapbox has the correct
       * map-panel dimensions before fitting bounds.
       */
      window.requestAnimationFrame(() => {
        showAllLocations({
          duration: 900,
        });
      });

      setMapError("");
    };

    let resizeTimer;

    const handleResize = () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        map.resize();

        /*
         * Return to the complete overview when the
         * desktop or mobile viewport size changes.
         */
        showAllLocations({
          duration: 0,
        });
      }, 160);
    };

    const handleMapError = (event) => {
      console.error("Mapbox error:", event.error);

      if (!map.loaded() && !map.isStyleLoaded()) {
        setMapError(
          "The map could not be loaded. Check the Mapbox token and published style.",
        );
      }
    };

    map.on("load", handleMapLoad);
    map.on("error", handleMapError);

    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(resizeTimer);

      window.removeEventListener("resize", handleResize);

      map.off("load", handleMapLoad);
      map.off("error", handleMapError);

      mapItemsRef.current.forEach(
        ({ marker, popup, element, handleMarkerClick }) => {
          element.removeEventListener("click", handleMarkerClick);

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

  const handleLocationClick = (location) => {
    setActiveLocationId(location.id);

    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.flyTo({
      center: location.coordinates,
      zoom: location.zoom,
      duration: 1400,
      essential: true,
    });
  };

  return (
    <section
      id="location-map"
      className={styles.mapSection}
      aria-labelledby="location-map-title"
    >
      <div className={styles.contentPanel}>
        <header className={styles.headingGroup}>
          <p className={styles.eyebrow}>Perfectly Positioned</p>

          <h2 id="location-map-title" className={styles.heading}>
            Connected To The City
          </h2>
        </header>

        <p className={styles.description}>
          Oceara Park Views offers a calm coastal address with convenient access
          to Dubai&apos;s most important destinations.
        </p>

        <div className={styles.locationList} aria-label="Nearby destinations">
          {locations.map((location) => {
            const isActive = activeLocationId === location.id;

            return (
              <button
                key={location.id}
                type="button"
                className={styles.locationItem}
                data-active={isActive ? "true" : "false"}
                aria-pressed={isActive}
                onClick={() => handleLocationClick(location)}
              >
                <span className={styles.locationName}>{location.name}</span>

                <span className={styles.locationTime}>{location.time}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.mapPanel}>
        <div
          ref={mapContainerRef}
          className={styles.map}
          aria-label="Interactive map showing Oceara Park Views and nearby destinations"
        />

        {mapError ? (
          <div className={styles.mapError} role="alert">
            <p>{mapError}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
