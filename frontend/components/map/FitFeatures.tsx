"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import type { GeoJSONFeature } from "@/types/geojson";

interface FitFeaturesProps {
  features: GeoJSONFeature[];
  selectedFeature: GeoJSONFeature | null;
  rightOverlayWidth?: number;
}

const MAX_SELECTED_ZOOM = 18;
const MAX_FEATURES_ZOOM = 16;
const ETHIOPIA_ZOOM = 6;

export default function FitFeatures({
  features,
  selectedFeature,
  rightOverlayWidth = -100,
}: FitFeaturesProps) {
  const map = useMap();

  useEffect(() => {
    const flyToBounds = (
      bounds: L.LatLngBounds,
      maxZoom: number
    ) => {
      if (!bounds.isValid()) {
        return;
      }

      // Calculate a zoom that fits the feature.
      const zoom = Math.min(
        map.getBoundsZoom(bounds, false),
        maxZoom
      );

      // Get the feature center.
      const center = bounds.getCenter();

      // Convert geographic center to screen coordinates.
      const point = map.project(center, zoom);

      // Shift center to compensate for the right-side overlay.
      point.x -= rightOverlayWidth / 2;

      // Convert back to geographic coordinates.
      const shiftedCenter = map.unproject(point, zoom);

      // Fly to the shifted center.
      map.flyTo(shiftedCenter, zoom, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25,
      });
    };

    // --------------------------------------------------
    // Selected feature
    // --------------------------------------------------

    if (selectedFeature) {
      const layer = L.geoJSON(selectedFeature);
      const bounds = layer.getBounds();

      flyToBounds(bounds, MAX_SELECTED_ZOOM);

      return;
    }

    // --------------------------------------------------
    // All features
    // --------------------------------------------------

    if (features.length > 0) {
      const layer = L.geoJSON({
        type: "FeatureCollection",
        features,
      });

      const bounds = layer.getBounds();

      flyToBounds(bounds, MAX_FEATURES_ZOOM);

      return;
    }

    // --------------------------------------------------
    // No features - Ethiopia
    // --------------------------------------------------

    const ethiopiaBounds = L.latLngBounds(
      [3.32, 33.00],
      [14.90, 48.00]
    );

    flyToBounds(ethiopiaBounds, ETHIOPIA_ZOOM);
  }, [
    map,
    features,
    selectedFeature,
    rightOverlayWidth,
  ]);

  return null;
}