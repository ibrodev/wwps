"use client";

import { layerToGeoJSON } from "@/lib/map/geojson";
import { GeoJSONFeature } from "@/types/geojson";
import { type Layer } from "leaflet";
import { X } from "lucide-react";
import { area } from "@turf/turf";

import { ReactNode, SetStateAction, useEffect } from "react";

interface ModalProps {
  layer: Layer | null;
  feature: GeoJSONFeature | null;
  onClose: (value: SetStateAction<Layer | null>) => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({
  layer,
  feature,
  onClose,
  title,
  children,
}: ModalProps) {


    const handleOnClose = () => {
        layer?.remove()
        onClose(null)
    }

    const getPointCoords = (feature: GeoJSONFeature) => {
        return feature.geometry.coordinates.reduce((prev:string, next: any) => prev === '' ? prev = prev + next : prev = prev + "," + next, '')
    }

    const getVertices = (feature: GeoJSONFeature) => feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates.reduce(
          (sum: any, ring: any) => sum + Math.max(0, ring.length - 1),
          0
        )
      : 0;

    const getArea = (feature: GeoJSONFeature) => {
        const areaHa = area(feature) / 10_000

        return `${areaHa.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} ha`;
    }

   


  useEffect(() => {
    if (!layer) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleOnClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [layer, onClose]);

  if (!layer) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-eiar-dark/40"
        onClick={handleOnClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-b-eiar-dark/15 px-3 py-3">
          <div className="flex flex-col">
            {title && (
                <h2
                id="modal-title"
                className="font-semibold text-gray-900 "
                >
                {title}
                </h2>
            )}
            {feature?.geometry.type === 'Point' && <p className="text-xs text-gray-500">Pont at: {getPointCoords(feature)}</p>}
            {feature?.geometry.type === 'Polygon' && <p className="text-xs text-gray-500">Polygon: {getVertices(feature)} vertices - {getArea(feature)}</p>}
          </div>

          <button
            type="button"
            onClick={handleOnClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 "
            aria-label="Close modal"
          >
            <X />
          </button>
        </div>

        <div className="mt-4 p-3">
            {children}
        </div>
      </div>
    </div>
  );
}