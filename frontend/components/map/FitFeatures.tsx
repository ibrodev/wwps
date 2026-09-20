"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import type { GeoJSONFeature } from "@/types/geojson";

interface FitFeaturesProps {
  features: GeoJSONFeature[];
  selectedFeature: GeoJSONFeature | null;
}

export default function FitFeatures({
  features,
  selectedFeature,
}: FitFeaturesProps) {
  const map = useMap();

  useEffect(() => {

    /*
     * Selected feature
     */
    if (selectedFeature) {
      const layer = L.geoJSON(
        selectedFeature
      );

      const bounds = layer.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          paddingTopLeft: [30, 30],
    paddingBottomRight: [800, 50],
    maxZoom: 12,
    animate: true,
        });
      }

      return;
    }

    /*
     * No selected feature.
     *
     * Fit all features.
     */
    if (features.length > 0) {
      const layer = L.geoJSON({
        type: "FeatureCollection",
        features,
      });

      const bounds = layer.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          paddingTopLeft: [30, 30],
    paddingBottomRight: [800, 50],
    maxZoom: 16,
    animate: true,
        });
      }

      return;
    }

    /*
     * No features.
     *
     * Fit Ethiopia.
     */
    map.fitBounds(
      L.latLngBounds(
        [3.32, 33.00],
        [14.90, 48.00]
      ),
      {
        paddingTopLeft: [30, 30],
    paddingBottomRight: [800, 50],
      }
    );

  }, [
    map,
    features,
    selectedFeature,
  ]);

  return null;
}