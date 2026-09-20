"use client"

import dynamic from "next/dynamic";

import type { GeoJSONFeature } from "@/types/geojson";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import AOIForm from "@/components/ui/AOIForm";

const Map = dynamic(
  () => import('@/components/map/Map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center">
        Loading map...
      </div>
    ),
  }
)


export default function Home() {

   const [layer, setLayer] = useState<L.Layer | null>(null)
   const [feature, setFeature] = useState<GeoJSONFeature | null>(null)

   const [areaOfInterest, setAreaOfInterest] = useState<Array<GeoJSONFeature> | []>([])

   const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const removingTemporaryLayer =  useRef(false);

  

  const handleCreate = (
    feature: GeoJSONFeature,
    layer: L.Layer
  ) => {
    console.log("Created feature:");
    console.log(layer);

    // setOpen(true)
    setLayer(layer)
    setFeature(feature)

    /*
    * Send to FastAPI here.
    *
    * Example:
    *
    * await fetch(
    *   `${process.env.NEXT_PUBLIC_API_URL}/api/features`,
    *   {
    *     method: "POST",
    *     headers: {
    *       "Content-Type": "application/json",
    *     },
    *     body: JSON.stringify({
    *       geometry: feature.geometry,
    *     }),
    *   }
    * );
    */
  };

  /*
   * User used Geoman's removal tool.
   */
 
 
const handleDelete = (
  feature: GeoJSONFeature,
  layer: L.Layer
) => {
  if (removingTemporaryLayer.current) {
    return;
  }

  setAreaOfInterest((previous) =>
    previous.filter(
      (item) =>
        item.properties.id !==
        feature.properties.id
    )
  );

  if (
    selectedFeature?.properties.id ===
    feature.properties.id
  ) {
    setSelectedFeature(null);
  }
};
  const handleSave = (
  properties: Record<string, unknown>
) => {
  if (!layer || !feature) {
    return;
  }

  const updatedFeature: GeoJSONFeature = {
    ...feature,
    properties,
  };

  removingTemporaryLayer.current = true;

  layer.remove();

  setAreaOfInterest((previous) => [
    ...previous,
    updatedFeature,
  ]);

  setLayer(null);
  setFeature(null);

  removingTemporaryLayer.current = false;
};

   const handleDiscard = () => {
    if (layer) {
      /*
       * The layer was already added to the map
       * by Geoman, so remove it.
       */
      layer.remove();
    }

    setLayer(null);
    setFeature(null);
  };
  

  

  useEffect(() => {

    console.log(areaOfInterest)

  }, [areaOfInterest])

  return (
    <>
      <Modal
        layer={layer}
        feature={feature}
        onClose={setLayer}
        title="Plot attributes"
      >
       <AOIForm
          feature={feature}
          areaOfInterests={areaOfInterest}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </Modal>
      <Map onCreate={handleCreate} onDelete={handleDelete} selectedFeature={selectedFeature} onSelect={setSelectedFeature} features={areaOfInterest}/>
    </>
  );
}
