import type { GeoJSONFeature } from "@/types/geojson";

import shp from "shpjs";

import {
  getExtension,
  validateGeoJSON,
} from "./validation";

import type { ImportResult } from "./types";

function normalizeGeoJSON(
  data: any
): GeoJSONFeature[] {

  if (data.type === "Feature") {
    return [
      data as GeoJSONFeature,
    ];
  }

  if (data.type === "FeatureCollection") {
    return data.features as GeoJSONFeature[];
  }

  throw new Error(
    "Unsupported GeoJSON type."
  );
}

async function importGeoJSON(
  file: File
): Promise<ImportResult> {

  const text = await file.text();

  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "The selected file is not valid JSON."
    );
  }

  const validation = validateGeoJSON(data);

  if (!validation.valid) {
    throw new Error(
      validation.message ?? "Invalid GeoJSON."
    );
  }

  const features = normalizeGeoJSON(data);

  return {
    features,
    sourceType: "geojson",
    sourceName: file.name,
  };
}

async function importShapefileZip(
  file: File
): Promise<ImportResult> {

  const buffer = await file.arrayBuffer();

  const result = await shp(buffer);

  const datasets = Array.isArray(result)
    ? result
    : [result];

  const features: GeoJSONFeature[] = [];

  for (const dataset of datasets) {

    if (
      dataset.type === "FeatureCollection"
    ) {
      features.push(
        ...(dataset.features as GeoJSONFeature[])
      );
    }
  }

  if (features.length === 0) {
    throw new Error(
      "The Shapefile ZIP does not contain any features."
    );
  }

  return {
    features,
    sourceType: "shapefile",
    sourceName: file.name,
  };
}


export async function importGeoData(
  file: File
): Promise<ImportResult> {

  const extension =
      getExtension(file.name);

    if (extension === "zip") {
      return importShapefileZip(file);
    }

    if (
      extension === "geojson" ||
      extension === "json"
    ) {
      return importGeoJSON(file);
    }


  /*
   * Nothing matched
   */
  throw new Error(
    "Unsupported file format. Please select a Shapefile ZIP, or GeoJSON file."
  );
}