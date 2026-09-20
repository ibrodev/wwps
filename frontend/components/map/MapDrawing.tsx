"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { type Layer } from "leaflet";
import "@geoman-io/leaflet-geoman-free";

import type { GeoJSONFeature } from "@/types/geojson";
import { layerToGeoJSON } from "@/lib/map/geojson";

interface MapDrawingProps {
  onCreate?: (feature: GeoJSONFeature, layer: Layer) => void;
  onDelete?: (feature: GeoJSONFeature, layer: Layer) => void;
}

export default function MapDrawing({
  onCreate,
  onDelete,
}: MapDrawingProps) {
  const map = useMap();

  useEffect(() => {

    // Add Geoman controls
    map.pm.addControls({
      position: "topleft",

      drawMarker: true,
      drawPolygon: true,
      drawPolyline: false,

      drawCircle: false,
      drawCircleMarker: false,
      drawRectangle: false,
      drawText: false,

      editMode: false,
      dragMode: false,
      removalMode: true,

      cutPolygon: false,
      rotateMode: false,
    });

    // Created
    const handleCreate = (event: any) => {
      const layer = event.layer;

      const feature = layerToGeoJSON(layer);
    

      onCreate?.(feature, layer);
    };

    

    // Removed
    const handleRemove = (event: any) => {
      const layer = event.layer;

      const feature = layerToGeoJSON(layer);

      onDelete?.(feature, layer);
    };

    map.on("pm:create", handleCreate);
    map.on("pm:remove", handleRemove);

    return () => {
      map.off("pm:create", handleCreate);
      map.off("pm:remove", handleRemove);

      map.pm.removeControls();
    };
  }, [map, onCreate, onDelete]);

  return null;
}