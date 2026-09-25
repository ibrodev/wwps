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

export interface EstimateResult {
    ID: number;
    NPP?: number,
    EYield_tpha?: number,
    AETI_mm?: number,
    WP_kgpm3?: number,
    LGP?: number,

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
    Location?: number,
    NPP?: number,
    EYield_tpha?: number,
    AETI_mm?: number,
    WP_kgpm3?: number,
    LGP?: number,
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