import type { GeoJSONFeature } from "@/types/geojson";

import shp from "shpjs";

import {
  getExtension,
  getBasename,
  validateGeoJSON,
  validateShapefileSelection,
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

async function importShapefileComponents(
  files: File[]
): Promise<ImportResult> {

  const validation =
    validateShapefileSelection(files);

  if (!validation.valid) {
    throw new Error(
      validation.message ?? "Invalid Shapefile."
    );
  }

  const byExtension =
    new Map<string, File>();

  for (const file of files) {
    byExtension.set(
      getExtension(file.name),
      file
    );
  }

  const shpFile = byExtension.get("shp");
  const dbfFile = byExtension.get("dbf");

  if (!shpFile || !dbfFile) {
    throw new Error(
      "A complete Shapefile requires .shp, .dbf"
    );
  }

  const shpBuffer =
    await shpFile.arrayBuffer();

  const dbfBuffer =
    await dbfFile.arrayBuffer();


  const result = await shp({
    shp: shpBuffer,
    dbf: dbfBuffer,
  });

  const features = normalizeGeoJSON(result);

  if (features.length === 0) {
    throw new Error(
      "The Shapefile contains no features."
    );
  }

  return {
    features,
    sourceType: "shapefile",
    sourceName: getBasename(
      shpFile.name
    ),
  };
}


export async function importGeoData(
  files: File[]
): Promise<ImportResult> {

  if (files.length === 0) {
    throw new Error(
      "No files were selected."
    );
  }

  /*
   * ZIP
   */
  if (files.length === 1) {

    const file = files[0];

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
  }

  /*
   * Individual Shapefile components
   */
  const extensions = files.map(
    (file) => getExtension(file.name)
  );

  if (extensions.includes("shp")) {
    return importShapefileComponents(files);
  }

  /*
   * Nothing matched
   */
  throw new Error(
    "Unsupported file format. Please select a GeoJSON file, a Shapefile ZIP, or Shapefile components."
  );
}