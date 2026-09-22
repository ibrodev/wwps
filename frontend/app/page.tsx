"use client"

import { useCallback } from "react";
import dynamic from "next/dynamic";

import type { GeoJSONFeature } from "@/types/geojson";
import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import AOIForm from "@/components/ui/AOIForm";


import {
  importGeoData,
} from "@/lib/map/import/importGeoData";
import SideBar from "@/components/ui/SideBar";
import { useNotification } from "@/components/ui/NotificationProvider";

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

   const { notify } = useNotification();

  

  const handleCreate = (feature: GeoJSONFeature, layer: L.Layer ) => {
    setLayer(layer)
    setFeature(feature)
  };

  // User used Geoman's removal tool.
  const handleDelete = (feature: GeoJSONFeature, layer?: L.Layer) => {
    
    if (removingTemporaryLayer.current) {
      return;
    }

    if (selectedFeature?.properties.ID === feature.properties.ID) {
      setSelectedFeature(null);
    }

    setAreaOfInterest((previous) =>
      previous.filter(
        (item) =>
          item.properties.ID !==
          feature.properties.ID
      )
    );


  };

  const handleClear = () => {
    if (selectedFeature) {
      setSelectedFeature(null)
    }
    setAreaOfInterest([])
  }


  const handleSave = (properties: Record<string, unknown>) => {
    
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

    setSelectedFeature(updatedFeature)

    removingTemporaryLayer.current = false;

     notify.success("Plot successfully added", {
      title: "Success",
    });
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
  

  const  handleSelect = (areaOfInterest: GeoJSONFeature) => {

    

    if (selectedFeature && (selectedFeature.properties.ID === areaOfInterest.properties.ID)) {
      setSelectedFeature(null)
    } else {

      setSelectedFeature(areaOfInterest)
    }

  }

  const handleUpload = useCallback(
    
    async (files: File[]) => {

    try {

      const result = await importGeoData(files);

      setAreaOfInterest(
        prev => [
          ...prev,
          ...result.features,
        ]
      );

      notify.success("Plot successfully added", {
        title: "Success",
      });

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Failed to import file.";

      console.log(message) // TODO: use alert - notification

    }
  },[]);

  return (
    <>
      

        <SideBar 
          areaOfInterests={areaOfInterest}
          selectedAreaOfInterest={selectedFeature}
          onSelect={handleSelect}
          onRemove={handleDelete}
          onClear={handleClear}
        />



      <div className="w-full flex-auto relative">
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
        <Map 
          onCreate={handleCreate} 
          onDelete={handleDelete} 
          selectedFeature={selectedFeature} 
          onSelect={setSelectedFeature} 
          features={areaOfInterest}
          onUpload={handleUpload}
        />
      </div>
      
    </>
  );
}
