"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  Check,
  ChevronDown,
  Layers,
  Map as MapIcon,
  Satellite,
} from "lucide-react";

type BaseLayerId = "osm" | "esri";

interface MapBaseLayersProps {
  esriToken?: string;
}

interface LayerOption {
  id: BaseLayerId;
  name: string;
  description: string;
  thumbnail: string;
}

const LAYER_OPTIONS: LayerOption[] = [
  {
    id: "osm",
    name: "OpenStreetMap",
    description: "Streets & places",
    thumbnail: "/map/osm-preview.png",
  },
  {
    id: "esri",
    name: "Satellite",
    description: "Esri World Imagery",
    thumbnail: "/map/satellite-preview.png",
  },
];

export default function MapBaseLayers({
  esriToken,
}: MapBaseLayersProps) {
  const map = useMap();

  const [open, setOpen] = useState(false);
  const [activeLayer, setActiveLayer] =
    useState<BaseLayerId>("esri");

  useEffect(() => {
    // ---------------------------------------------
    // OpenStreetMap
    // ---------------------------------------------

    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,

        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    );

    // ---------------------------------------------
    // Esri Satellite
    // ---------------------------------------------

    const esriUrl = esriToken
      ? `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=${esriToken}`
      : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    const esri = L.tileLayer(esriUrl, {
      maxZoom: 18,

      attribution:
        "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    });

    // ---------------------------------------------
    // Store layers
    // ---------------------------------------------

    const layers: Record<
      BaseLayerId,
      L.TileLayer
    > = {
      osm,
      esri,
    };

    // ---------------------------------------------
    // Default layer
    // ---------------------------------------------

    esri.addTo(map);

    // ---------------------------------------------
    // Cleanup
    // ---------------------------------------------

    return () => {
      Object.values(layers).forEach((layer) => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map, esriToken]);

  // ---------------------------------------------
  // Change base layer
  // ---------------------------------------------

  const changeLayer = (
    layerId: BaseLayerId,
  ) => {
    const currentLayers =
      map.eachLayer(() => {});

    // Find existing tile layers by inspecting
    // Leaflet layers.
    map.eachLayer((layer) => {
      if (
        layer instanceof L.TileLayer
      ) {
        map.removeLayer(layer);
      }
    });

    let layer: L.TileLayer;

    if (layerId === "osm") {
      layer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,

          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      );
    } else {
      const esriUrl = esriToken
        ? `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=${esriToken}`
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

      layer = L.tileLayer(esriUrl, {
        maxZoom: 18,

        attribution:
          "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      });
    }

    layer.addTo(map);

    setActiveLayer(layerId);
    setOpen(false);
  };

  return (
    <div
      className="
        absolute
        bottom-3
        left-3
        z-[1000] rounded-xs
      "
    >
      {/* ========================================== */}
      {/* Expanded panel */}
      {/* ========================================== */}

      {open && (
        <div
          className="
            absolute
            bottom-12
            left-0
            w-[280px]
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
            shadow-2xl
            ring-1
            ring-black/5
          "
        >
          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-gray-100
              px-4
              py-3
            "
          >
            <div className="flex items-center gap-2">
              <Layers
                size={17}
                className="text-gray-600"
              />

              <span
                className="
                  text-sm
                  font-semibold
                  text-gray-800
                "
              >
                Base map
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                rounded-md
                p-1.5
                text-gray-400
                transition
                hover:bg-gray-100
                hover:text-gray-700
              "
              aria-label="Close base map selector"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Layer options */}

          <div
            className="
              grid
              grid-cols-2
              gap-2
              p-3
            "
          >
            {LAYER_OPTIONS.map((item) => {
              const selected =
                activeLayer === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    changeLayer(item.id)
                  }
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-lg
                    border
                    text-left
                    transition
                    ${
                      selected
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  {/* Thumbnail */}

                  <div
                    className="
                      relative
                      h-[72px]
                      overflow-hidden
                      bg-gray-100
                    "
                  >
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-200
                        group-hover:scale-105
                      "
                    />

                    {selected && (
                      <div
                        className="
                          absolute
                          inset-0
                          flex
                          items-center
                          justify-center
                          bg-blue-500/10
                        "
                      >
                        <div
                          className="
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full
                            bg-blue-600
                            text-white
                            shadow-lg
                          "
                        >
                          <Check
                            size={14}
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text */}

                  <div className="px-2.5 py-2">
                    <div
                      className="
                        text-xs
                        font-semibold
                        text-gray-800
                      "
                    >
                      {item.name}
                    </div>

                    <div
                      className="
                        mt-0.5
                        text-[10px]
                        text-gray-500
                      "
                    >
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Main button */}
      {/* ========================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="
          flex
          h-[30px]
          w-[30px]
          items-center
          justify-center
          rounded-sm
          border
          border-gray-200
          bg-white
          text-gray-700
          shadow-sm shadow-gray-800
          ring-1
          ring-black/5
          transition
          hover:bg-gray-50
          active:scale-95
        "
        aria-label="Change base map"
        title="Change base map"
      >
        {activeLayer === "esri" ? (
          <Satellite size={19} />
        ) : (
          <MapIcon size={19} />
        )}
      </button>
    </div>
  );
}