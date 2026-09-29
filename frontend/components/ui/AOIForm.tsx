"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { area } from "@turf/turf";


import type { GeoJSONFeature } from "@/types/geojson";

const createAoiSchema = (isPoint:boolean, areaOfInterests: GeoJSONFeature[]) => z.object({
    ID: z
        .string()
        .nonempty('id is required')
        .refine(val => !areaOfInterests.some(
            (value) => value.properties.ID === parseInt(val)
        ), {message: 'ID must be unique'}),

    Name: z
        .string()
        .nonempty('plot name is required'),

    SOS: z
        .string()
        .nonempty('start of season is require'),

    EOS: z
        .string()
        .nonempty('end of season is required'),

    Location: isPoint
      ? z.string().nonempty("location is required")
      : z.string().optional(),

}).refine(
    (data) => {
        if (!data.SOS || !data.EOS) return true

        return data.EOS > data.SOS
    },
    {
        message: 'end of season cannot be before start of season',
        path: ['EOS']
    }
);


interface AOIFormProps {
  feature: GeoJSONFeature | null;

  areaOfInterests: GeoJSONFeature[];

  onSave: (properties: Record<string, unknown>) => void;

  onDiscard: () => void;
}

export default function AOIForm(
    {
  feature,
  areaOfInterests,
  onSave,
  onDiscard,
}: AOIFormProps
) {

    const isPoint = feature?.geometry.type === "Point";
    const lastId = areaOfInterests.length ? (
      areaOfInterests
      .map(value => value.properties.ID)
      .sort((a,b) => a-b)[areaOfInterests.length - 1] + 1
    ).toString() : "1"

    const aoiSchema = createAoiSchema(isPoint, areaOfInterests);

    type AOIFormData = z.infer<typeof aoiSchema>;


    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<AOIFormData>({
        resolver: zodResolver(aoiSchema),
        defaultValues: {
            ID: lastId,
            Name: '',
            SOS: '',
            EOS: '',
            Location: feature?.geometry.type === 'Point' ? '1' : ''
        }
    });

    const sos = watch('SOS')

    const onSubmit = (data: AOIFormData) => {
    const properties = {
      ID: parseInt(data.ID, 10),
      Name: data.Name,
      SOS: data.SOS,
      EOS: data.EOS,
      Location:
        isPoint && data.Location
          ? parseInt(data.Location, 10)
          : undefined,
    };

    onSave(properties);
  };


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
    

    return (

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-2 w-full border border-slate-200 rounded p-2 bg-slate-50">
            <div className="flex flex-col text-slate-500 text-sm text-center  w-full">
              <p>{feature?.geometry.type}</p>
              <div className="flex gap-2 justify-center">
              {feature?.geometry.type === "Polygon" ? "Vertices: " + getVertices(feature) +  " | Area: " + getArea(feature) : "Coordinates: " + (feature && getPointCoords(feature))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <div className="flex flex-col">
              <label htmlFor="ID" className="form-label">ID</label>
              <input 
                type="number"
                {...register('ID')} 
                name="ID" 
                id="ID" 
                className={`form-input w-32 ${
                    errors.ID ? "form-input-error" : ""
                }`}
                
              />
            {errors.ID && (
                <p className="form-error">
                    {errors.ID.message}
                </p>
            )}
            </div>
            <div className="flex flex-col flex-auto">
              <label htmlFor="Name" className="form-label">Plot name</label>
              <input 
                type="text" 
                {...register('Name')} 
                name="Name" 
                id="Name"
                placeholder="e.g. Koga block 3" 
                className={`form-input ${
                    errors.Name ? "form-input-error" : ""
                }`}
              />
              {errors.Name && (
                <p className="form-error">
                    {errors.Name.message}
                </p>
            )}
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <div className="flex flex-col w-1/2">
              <label htmlFor="SOS" className="form-label">Start of season</label>
              <input 
                type="date" 
                {...register('SOS')} 
                name="SOS" 
                id="SOS" 
                className={`form-input ${
                    errors.SOS ? "form-input-error" : ""
                }`}
              />
              {errors.SOS && (
                <p className="form-error">
                    {errors.SOS.message}
                </p>
            )}
            </div>
            <div className="flex flex-col w-1/2">
              <label htmlFor="EOS" className="form-label">End of season</label>
              <input 
                type="date" 
                {...register('EOS')}
                min={sos || undefined} // TODO: calculate min date
                name="EOS" 
                id="EOS"
                className={`form-input ${
                    errors.EOS ? "form-input-error" : ""
                }`}
              />
              {errors.EOS && (
                <p className="form-error">
                    {errors.EOS.message}
                </p>
            )}
            </div>
          </div>

          {feature?.geometry.type === 'Point' &&
            <div className="flex gap-2 w-full">
              <div className="flex flex-col w-full">
                <label htmlFor="Location" className="form-label">Location (plot number)</label>
                <input 
                  type="number" 
                  {...register('Location')} 
                  name="Location" 
                  id="Location" 
                className={`form-input ${
                    errors.Location ? "form-input-error" : ""
                }`}
                />
                {errors.Location && (
                <p className="form-error">
                    {errors.Location.message}
                </p>
            )}
              </div>
            </div>
          }

         
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onDiscard}
              className="
                rounded 
                border 
                border-gray-400 
                px-4 py-2 text-sm 
                text-gray-800 
                outline-none 
                focus:border-red-600
                focus:ring-2
                focus:ring-red-900
                hover:border-red-600
                hover:text-red-600
              "
            >
              Discard
            </button>

            <button
              type="submit"
              className="
                rounded 
                bg-eiar-green/90 
                px-8 
                py-2
                text-sm
                text-white 
                outline-none 
                focus:border-eiar-green
                focus:ring-2
                focus:ring-eiar-green/20
                hover:bg-eiar-green
              "
            >
              Add plot
            </button>
          </div>
        </form>

    )

}