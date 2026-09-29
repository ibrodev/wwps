"use client"

import { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

import type { EstimateResult, GeoJSONFeature } from "@/types/geojson";
import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import AOIForm from "@/components/ui/AOIForm";


import {
  importGeoData,
} from "@/lib/map/import/importGeoData";
import SideBar from "@/components/ui/SideBar";
import { useNotification } from "@/components/ui/NotificationProvider";
import WaPORProgress from "@/components/ui/WaPORProgress";
import ResultPanel from "@/components/ui/ResultPanel";

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
   const [jobId, setJobId] = useState<string | null>(null)
   const [isCalculated, setIsCalculated] = useState(false)
   const [modalIsOpen, setIsModalOpen] = useState(false)
   
   const removingTemporaryLayer =  useRef(false);

   const { notify } = useNotification();

  

  const handleCreate = (feature: GeoJSONFeature, layer: L.Layer ) => {
    setLayer(layer)
    setFeature(feature)
    setIsModalOpen(true)
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
    setIsCalculated(false)
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
    setIsModalOpen(false)

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

    setIsModalOpen(false)
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


  const formatDate = (value: string | Date) => {
    return value instanceof Date
      ? value.toISOString().split("T")[0]
      : value.split("T")[0];
  };

  const handleUpload = useCallback(
  async (files: File[]) => {
    try {
      const result = await importGeoData(files);

      let duplicates: number[] = [];
      let addedCount = 0;

      setAreaOfInterest((prev) => {
        const existingIds = new Set(
          prev.map((a) => a.properties.ID)
        );

        const newFeatures = result.features.filter(
          (feature) => {
            const id = feature.properties.ID;

            if (existingIds.has(id)) {
              duplicates.push(id);
              return false;
            }

            return true;
          }
        );

        addedCount = newFeatures.length;

        return [
          ...prev,
          ...newFeatures.map((feature) => ({
            ...feature,
            properties: {
              ...feature.properties,
              SOS: formatDate(feature.properties.SOS),
              EOS: formatDate(feature.properties.EOS),
            },
          })),
        ];
      });

      if (duplicates.length > 0) {
        notify.error(
          `Duplicate IDs found: ${duplicates.join(", ")} not imported`,
          {
            title: "Duplicate plots",
          }
        );
      }

      if (addedCount > 0) {
        notify.success(
          `${addedCount} plot${addedCount !== 1 ? "s" : ""} successfully added`,
          {
            title: "Success",
          }
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to import file.";

      console.error(message);

      notify.error(message, {
        title: "Import failed",
      });
    }
  },
  []
);

  const updateFeatures = (results: EstimateResult[]) => {

    const newAreaOfInterest: GeoJSONFeature[] = []

    results.forEach(r => {
      
      const a = areaOfInterest.find(i => i.properties.ID === r.ID)
      a && newAreaOfInterest.push({...a, properties: {...a.properties, ...r}})

    })

    setAreaOfInterest(newAreaOfInterest)

  }

  const handleCalculate = async () => {


    try {

      const response = await fetch("http://localhost/api/v1/wapor/estimate_new", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(areaOfInterest)
      })

      const data = await response.json()

      if (data.status === "completed") {
        const results: EstimateResult[] = data.results
        updateFeatures(results)
        setIsCalculated(true)

      }

      else {
        const job_id = data.job_id
        setJobId(job_id)
      }


    } catch(error) {
      console.log(error)
    }

  }

  const handleOnComplete = (results: EstimateResult[]) => {

      updateFeatures(results)

      let timer = setTimeout(() => {

        setJobId(null)
        clearTimeout(timer)
      }, 800
      )

  }

  const handleExport = () => {
      alert('hey')
  }

  

  

  return (
    <>
      

        <SideBar 
          areaOfInterests={areaOfInterest}
          selectedAreaOfInterest={selectedFeature}
          isCalculated={isCalculated}
          onSelect={handleSelect}
          onRemove={handleDelete}
          onCalculate={handleCalculate}
          onClear={handleClear}
        />


        

        <WaPORProgress jobId={jobId} onComplete={handleOnComplete}/>

      <div className="w-full flex-auto relative overflow-hidden">
        <ResultPanel 
          aoi={areaOfInterest}
          current={selectedFeature}
          isCalculated={isCalculated}
          onExport={handleExport}
        />
        <Modal
          isModalOpen={modalIsOpen}
          onClose={handleDiscard}
          title="Plot attributes"
          size="md"
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
