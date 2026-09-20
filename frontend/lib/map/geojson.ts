import type { Layer } from "leaflet";
import type { GeoJSONFeature } from "@/types/geojson";

export function layerToGeoJSON(
  layer: Layer
): GeoJSONFeature {
  const geojson = (
    layer as Layer & {
      toGeoJSON: () => GeoJSONFeature;
    }
  ).toGeoJSON();

  return geojson;
}