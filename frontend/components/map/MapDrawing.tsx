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
  onUpload?: (files: File[]) => void;
}

export default function MapDrawing({
  onCreate,
  onDelete,
  onUpload,
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


    const input = document.createElement("input");

    input.type = "file";
    input.multiple = true;
    input.accept = [
        ".geojson",
        ".json",
        ".zip",
        ".shp",
        ".dbf",
    ].join(",");
    input.style.display = "none";

    input.addEventListener(
      "change",
      (event) => {

        const target =
          event.target as HTMLInputElement;

        const files =
          target.files
            ? Array.from(target.files)
            : [];

        if (files.length > 0) {
          onUpload?.(files);
        }

        // Allow selecting the same files again
        input.value = "";
      }
    );

    document.body.appendChild(input);

    const controlName = "uploadGeoJSON";

    // Create custom control only once
    if (!map.pm.Toolbar.getControlOrder().includes(controlName)) {
        map.pm.Toolbar.createCustomControl({
            name: controlName,
            block: "custom",
            title: "Upload GeoJSON or Shapefile",
            className: 'leaflet-pm-icon-import',
            toggle: false,

            onClick: () => {
                input.click();
            },
        });
    }

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

      input.remove();

    };
  }, [map, onCreate, onDelete, onUpload]);

  return null;
}