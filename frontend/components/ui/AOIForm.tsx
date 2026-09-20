"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { GeoJSONFeature } from "@/types/geojson";
import { useEffect } from "react";

const createAoiSchema = (isPoint:boolean) => z.object({
    id: z
        .string()
        .nonempty('id is required'),

    name: z
        .string()
        .nonempty('plot name is required'),

    sos: z
        .string()
        .nonempty('start of season is require'),

    eos: z
        .string()
        .nonempty('end of season is required'),

    location: isPoint
      ? z.string().nonempty("location is required")
      : z.string().optional(),

}).refine(
    (data) => {
        if (!data.sos || !data.eos) return true

        return data.eos > data.sos
    },
    {
        message: 'end of season cannot be before start of season',
        path: ['eos']
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

    const aoiSchema = createAoiSchema(isPoint);

    type AOIFormData = z.infer<typeof aoiSchema>;


    const {
        setError,
        clearErrors,
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<AOIFormData>({
        resolver: zodResolver(aoiSchema),
        defaultValues: {
            id: areaOfInterests.length ? (areaOfInterests.map((value: GeoJSONFeature) => value.properties.id).sort()[areaOfInterests.length -1] + 1).toString() : '1',
            name: '',
            sos: '',
            eos: '',
            location: feature?.geometry.type === 'Point' ? '1' : ''
        }
    });

    const id = watch('id')
    const sos = watch('sos')

    const onSubmit = (data: AOIFormData) => {
    const properties = {
      id: parseInt(data.id, 10),
      name: data.name,
      sos: data.sos,
      eos: data.eos,
      location:
        isPoint && data.location
          ? parseInt(data.location, 10)
          : undefined,
    };

    onSave(properties);
  };


    useEffect(() => {
        if (!id || errors.id) return;

        const idExists = areaOfInterests.some(
            (value) => value.properties.id.toString() === id
        );

        if (idExists) {
            setError("id", {
            type: "manual",
            message: "ID must be unique",
            });
        } else {
            clearErrors("id");
        }
    }, [id, areaOfInterests, setError, clearErrors]);   

    

    return (

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-2 w-full">
            <div className="flex flex-col">
              <label htmlFor="id" className="form-label">ID</label>
              <input 
                type="number"
                {...register('id')} 
                name="id" 
                id="id" 
                className={`form-input w-32 ${
                    errors.id ? "form-input-error" : ""
                }`}
                
              />
            {errors.id && (
                <p className="form-error">
                    {errors.id.message}
                </p>
            )}
            </div>
            <div className="flex flex-col flex-auto">
              <label htmlFor="name" className="form-label">Plot name</label>
              <input 
                type="text" 
                {...register('name')} 
                name="name" 
                id="name"
                placeholder="e.g. Koga block 3" 
                className={`form-input ${
                    errors.name ? "form-input-error" : ""
                }`}
              />
              {errors.name && (
                <p className="form-error">
                    {errors.name.message}
                </p>
            )}
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <div className="flex flex-col w-1/2">
              <label htmlFor="sos" className="form-label">Start of season</label>
              <input 
                type="date" 
                {...register('sos')} 
                name="sos" 
                id="sos" 
                className={`form-input ${
                    errors.sos ? "form-input-error" : ""
                }`}
              />
              {errors.sos && (
                <p className="form-error">
                    {errors.sos.message}
                </p>
            )}
            </div>
            <div className="flex flex-col w-1/2">
              <label htmlFor="eos" className="form-label">End of season</label>
              <input 
                type="date" 
                {...register('eos')}
                min={sos || undefined} 
                name="eos" 
                id="eos"
                className={`form-input ${
                    errors.eos ? "form-input-error" : ""
                }`}
              />
              {errors.eos && (
                <p className="form-error">
                    {errors.eos.message}
                </p>
            )}
            </div>
          </div>

          {feature?.geometry.type === 'Point' &&
            <div className="flex gap-2 w-full">
              <div className="flex flex-col w-full">
                <label htmlFor="location" className="form-label">Location (plot number)</label>
                <input 
                  type="number" 
                  {...register('location')} 
                  name="location" 
                  id="location" 
                className={`form-input ${
                    errors.location ? "form-input-error" : ""
                }`}
                />
                {errors.location && (
                <p className="form-error">
                    {errors.location.message}
                </p>
            )}
              </div>
            </div>
          }

         
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="
                rounded-lg 
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
                rounded-lg 
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