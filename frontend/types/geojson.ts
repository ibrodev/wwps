export type GeometryType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon";

export interface GeoJSONGeometry {
  type: GeometryType;
  coordinates: any;
}

export interface FeatureProperties {
    ID: number;
    Name: string;
    SOS: string;
    EOS: string;
    Scheme_ID?: string,
    Area_ha?: string,
    Crop?: string,
    Crop_ID?: string,
    Location?: number
}

export interface GeoJSONFeature {
  type: "Feature";
  id?: string | number;
  geometry: GeoJSONGeometry;
  properties: FeatureProperties;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}