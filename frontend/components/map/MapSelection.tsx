"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapSelectionProps {
  onClear: () => void;
}

export default function MapSelection({
  onClear,
}: MapSelectionProps) {
  const map = useMap();

  useEffect(() => {
    const handleClick = () => {
      console.log("MAP CLICK - CLEAR SELECTION");

      onClear();
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, onClear]);

  return null;
}