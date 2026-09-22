import { ValidationResult } from "./types";

const SHAPEFILE_EXTENSIONS = [
  "shp",
  "dbf",
] as const;

export function getExtension(filename: string): string {
  const index = filename.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return filename.slice(index + 1).toLowerCase();
}

export function getBasename(filename: string): string {
  const lastSlash = Math.max(
    filename.lastIndexOf("/"),
    filename.lastIndexOf("\\")
  );

  const name = filename.slice(lastSlash + 1);

  const index = name.lastIndexOf(".");

  if (index === -1) {
    return name;
  }

  return name.slice(0, index);
}


export function validateShapefileSelection(
  files: File[]
): ValidationResult {
  if (files.length === 0) {
    return {
      valid: false,
      message: "No files were selected.",
    };
  }

  const components = files.filter((file) =>
    SHAPEFILE_EXTENSIONS.includes(
      getExtension(file.name) as
        (typeof SHAPEFILE_EXTENSIONS)[number]
    )
  );

  if (components.length === 0) {
    return {
      valid: false,
      message: "No Shapefile components were selected.",
    };
  }

  // Group by basename
  const basenames = new Set(
    components.map((file) => getBasename(file.name).toLowerCase())
  );

  if (basenames.size > 1) {
    return {
      valid: false,
      message:
        "The selected Shapefile components have different base names. Please select components belonging to one Shapefile.",
    };
  }

  const extensionCounts = new Map<string, number>();

  for (const file of components) {
    const extension = getExtension(file.name);

    extensionCounts.set(
      extension,
      (extensionCounts.get(extension) ?? 0) + 1
    );
  }

  for (const [extension, count] of extensionCounts) {
    if (count > 1) {
      return {
        valid: false,
        message: `Multiple .${extension} files were selected.`,
      };
    }
  }

  const extensions = new Set(
    components.map((file) => getExtension(file.name))
  );

  // Geometry is mandatory
  if (!extensions.has("shp")) {
    return {
      valid: false,
      message: "The .shp file is missing.",
    };
  }

 

  // Attributes
  if (!extensions.has("dbf")) {
    return {
      valid: false,
      message:
        "The .dbf file is missing. Please provide the complete Shapefile.",
    };
  }

  

  return {
    valid: true,
  };
}



export function validateGeoJSON(
  data: unknown
): ValidationResult {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      message: "The file does not contain a valid JSON object.",
    };
  }

  const value = data as Record<string, unknown>;

  if (value.type === "Feature") {
    if (!value.geometry) {
      return {
        valid: false,
        message: "GeoJSON Feature has no geometry.",
      };
    }

    return {
      valid: true,
    };
  }

  if (value.type === "FeatureCollection") {
    if (!Array.isArray(value.features)) {
      return {
        valid: false,
        message: "FeatureCollection.features must be an array.",
      };
    }

    if (value.features.length === 0) {
      return {
        valid: false,
        message: "The GeoJSON FeatureCollection is empty.",
      };
    }

    return {
      valid: true,
    };
  }

  return {
    valid: false,
    message:
      "Unsupported GeoJSON type. Expected Feature or FeatureCollection.",
  };
}