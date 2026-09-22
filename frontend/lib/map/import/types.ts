import type { GeoJSONFeature } from "@/types/geojson";

export type SupportedFileExtension =
  | "geojson"
  | "json"
  | "zip"
  | "shp"
  | "dbf"

export interface ImportResult {
  features: GeoJSONFeature[];
  sourceType: "geojson" | "shapefile";
  sourceName: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}