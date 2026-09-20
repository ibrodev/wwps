"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import type { GeoJSONFeature } from "@/types/geojson";

interface MapFeaturesProps {
  features: GeoJSONFeature[];
  selectedFeature: GeoJSONFeature | null;
  onSelect: (feature: GeoJSONFeature | null) => void;
}

export default function MapFeatures({
  features,
  selectedFeature,
  onSelect,
}: MapFeaturesProps) {
  const map = useMap();

  useEffect(() => {
    const geoJsonLayer = L.geoJSON(features, {
      /*
       * Make sure vector features are interactive.
       */
      interactive: true,

      /*
       * Don't allow polygon mouse events to bubble
       * to the map.
       */
      bubblingMouseEvents: false,

      style: (feature) => {
        const id = feature?.properties?.id;

        const selected =
          id != null &&
          id === selectedFeature?.properties?.id;

        return {
          color: selected ? "#2563eb" : "#3388ff",
          weight: selected ? 4 : 2,
          opacity: 1,
          fillColor: selected ? "#2563eb" : "#3388ff",
          fillOpacity: selected ? 0.40 : 0.20,
        };
      },

      onEachFeature: (feature, layer) => {
        const geoJsonFeature =
          feature as GeoJSONFeature;

        /*
         * Store the GeoJSON feature on the Leaflet layer.
         */
        (
          layer as L.Layer & {
            feature?: GeoJSONFeature;
          }
        ).feature = geoJsonFeature;

        /*
         * Explicitly handle the click.
         */
        layer.on("click", (event) => {
          console.log(
            "FEATURE CLICK:",
            geoJsonFeature
          );

          /*
           * Stop the click reaching the map.
           */
          L.DomEvent.stopPropagation(
            event
          );

          onSelect(geoJsonFeature);
        });
      },
    });

    geoJsonLayer.addTo(map);

    return () => {
      geoJsonLayer.remove();
    };
  }, [
    map,
    features,
    selectedFeature,
    onSelect,
  ]);

  return null;
}