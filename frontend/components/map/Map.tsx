"use client";

import {
  MapContainer,
  TileLayer,
  FeatureGroup,
} from "react-leaflet";

import L from 'leaflet'
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

import MapDrawing from "@/components/map/MapDrawing";
import FitFeatures from '@/components/map/FitFeatures'
import MapFeatures from "@/components/map/MapFeatures";
import MapSelection from "@/components/map/MapSelection";

import type { GeoJSONFeature } from "@/types/geojson";
import MapBaseLayers from "./MapBaseLayers";

interface MapProps {
  features?: GeoJSONFeature[];

  selectedFeature?: GeoJSONFeature | null;

   onSelect?: (
    feature: GeoJSONFeature | null
  ) => void;

  onCreate?: (
    feature: GeoJSONFeature,
    layer: L.Layer
  ) => void;

  onDelete?: (
    feature: GeoJSONFeature,
    layer: L.Layer
  ) => void;

  onUpload?: (file: File) => void;
}


export default function Map({
  features = [],
  selectedFeature = null,
  onSelect,
  onCreate,
  onDelete,
  onUpload
}: MapProps) {
    return <MapContainer
        center={[8.98060340, 38.75776050]}
        zoom={7}
        maxZoom={18}
        scrollWheelZoom
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 20
        }}
    >

        <MapBaseLayers />

        <FitFeatures 
          features={features}
          selectedFeature={selectedFeature}
        />

        <MapFeatures
          features={features}
          selectedFeature={selectedFeature}
          onSelect={onSelect}
        />

        <MapSelection
          onClear={() => onSelect?.(null)}
        />

        <MapDrawing
          onCreate={onCreate}
          onDelete={onDelete}
          onUpload={onUpload}
        />

    </MapContainer>
}