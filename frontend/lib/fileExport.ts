import type { GeoJSONFeature } from "@/types/geojson";

function downloadFile(
    content: string,
    filename: string,
    mimeType: string
) {
    const blob = new Blob([content], {
        type: `${mimeType};charset=utf-8`,
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

export function exportGeoJSON(
    features: GeoJSONFeature[] | GeoJSONFeature,
    filename = "wapor-results.geojson"
) {

    let geojson = null

    if (Array.isArray(features)) 
        geojson = {
            type: "FeatureCollection",
            features,
        };
    else if(typeof features === "object" && features != null)
        geojson = features

    downloadFile(
        JSON.stringify(geojson, null, 2),
        filename,
        "application/geo+json"
    );
}

export function exportCSV(
    features: GeoJSONFeature[] | GeoJSONFeature,
    filename = "wapor-results.csv"
) {

    let rows = null

    if (Array.isArray(features) &&!features.length) return;

    if (Array.isArray(features))
        rows = features.map(feature => feature.properties);
    else
        rows = [features.properties]

    // Collect all property names
    const headers = Array.from(
        new Set(rows.flatMap(row => Object.keys(row)))
    );

    const escapeCsvValue = (value: unknown): string => {
        if (value === null || value === undefined) {
            return "";
        }

        const stringValue = String(value);

        if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
        ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
    };

    const csv = [
        headers.join(","),
        ...rows.map(row =>
            headers
                .map(header => escapeCsvValue(row[header]))
                .join(",")
        ),
    ].join("\n");

    downloadFile(csv, filename, "text/csv");
}