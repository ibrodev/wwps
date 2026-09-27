"use client"

import Image from 'next/image'
import type { GeoJSONFeature } from "@/types/geojson";
import { MapPin, VectorPolygon, X } from "lucide-react";

import eiarLogo from '@/public/eiar-logo.png'

interface SideBarProps {
    areaOfInterests: GeoJSONFeature[] | []
    selectedAreaOfInterest: GeoJSONFeature | null
    isCalculated: boolean
    onSelect: (areaOfInterest: GeoJSONFeature) => void
    onRemove: (areaOfInterest: GeoJSONFeature) => void
    onCalculate: () => void
    onClear: () => void
}

export default function SideBar({
    areaOfInterests, 
    selectedAreaOfInterest, 
    isCalculated,
    onSelect, 
    onRemove,
    onCalculate,
    onClear
} : SideBarProps) {


    const hasFeatures = () => !areaOfInterests.length

    return (
        <div className="
            w-[380px] 
            bg-a 
            py-4 
            flex 
            flex-col
            overflow-hidden
        ">

            <header 
                className="
                    pl-3 
                    pr-4 
                    pb-4 
                    flex 
                    items-center 
                    border-b
                    border-gray-300
                    "
                >
                <div className="flex items-center">
                    <Image
                        src={eiarLogo}
                        alt="ethiopian institution of agriculture logo"
                        className="w-10 h-auto"
                    />
                    <div>
                    <h1 className=" font-bold text-lg leading-tight text-eiar-dark">Wheat Water Productivity</h1>
                    <p className="text-[.7rem] leading-tight text-eiar-deep">Ethiopian Institute of Agricultural Research</p>
                    </div>
                </div>
            </header>

            <div className='flex gap-2 p-4'>
                <button className="
                        rounded 
                        border
                        border-eiar-green/90
                        bg-eiar-green/90 
                        px-2 
                        py-2
                        text-sm
                        text-white 
                        outline-none 
                        focus:border-eiar-green
                        focus:ring-2
                        focus:ring-eiar-green/20
                        hover:bg-eiar-green
                        w-full
                        disabled:cursor-not-allowed
                        disabled:text-eiar-green/50
                        disabled:bg-eiar-green/10
                        disabled:border-eiar-green/10
                        disabled:hover:bg-eiar-green/10
                    ">Method and Data</button>
                <button className="
                        rounded 
                        border
                        border-eiar-green/90
                        bg-eiar-green/90 
                        px-2 
                        py-2
                        text-sm
                        text-white 
                        outline-none 
                        focus:border-eiar-green
                        focus:ring-2
                        focus:ring-eiar-green/20
                        hover:bg-eiar-green
                        w-full
                        disabled:cursor-not-allowed
                        disabled:text-eiar-green/50
                        disabled:bg-eiar-green/10
                        disabled:border-eiar-green/10
                        disabled:hover:bg-eiar-green/10
                    ">Help</button>
            </div>

            <h4 className="
                uppercase 
                font-semibold 
                text-eiar-green
                text-sm
                px-4
                pt-4
            ">
                Area of Interest
            </h4>

            <div className="
                flex-auto
                relative
            ">
                <div className="
                    absolute
                    top-0
                    right-0
                    bottom-0
                    left-0
                    overflow-scroll
                    p-4
                    flex 
                    flex-col 
                    gap-1.5
                ">

                    {
                        !areaOfInterests.length ?
                        <div>
                            <p className='capitalize text-center font-semibold text-slate-400'>no area of interest added</p>
                            <p className='text-slate-600 text-sm text-center'>Please use the map controls to add your area of interest</p>
                        </div> :

                        areaOfInterests.map(val => 
                            <div 
                                onClick={() => onSelect(val)}  
                                key={val.properties.ID} 
                                className={`
                                    border
                                    border-gray-300
                                    text-sm
                                    text-eiar-deep
                                    p-2
                                    rounded
                                    shadow-sm
                                    cursor-pointer
                                    hover:bg-green-700/10
                                    flex
                                    items-center
                                    justify-between
                                    ${
                                        selectedAreaOfInterest && 
                                        (val.properties.ID === selectedAreaOfInterest.properties.ID) &&
                                        'bg-green-700/10' 
                                    }
                                `}
                            >
                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                ">
                                    {val.geometry.type === 'Point' ? <MapPin size={16}/> : <VectorPolygon size={16}/>}
                                    <p>{val.properties.Name}</p>
                                </div>
                                <X  size={18} onClick={() => onRemove(val)} className="hover:text-red-500"/>
                            </div>
                        )    

                    }
                </div>

            </div>

            <div className="
                border-y
                border-gray-300
                p-4
                flex
                flex-col
                gap-2
            ">

                <button 
                    className="
                        rounded 
                        border
                        border-eiar-green/90
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
                        w-full
                        disabled:cursor-not-allowed
                        disabled:text-eiar-green/50
                        disabled:bg-eiar-green/10
                        disabled:border-eiar-green/10
                        disabled:hover:bg-eiar-green/10
                    "
                    onClick={onCalculate}
                    disabled={hasFeatures()}
                >
                    {isCalculated ? 'Rerun' : 'Run'} analysis
                </button>

               {areaOfInterests.length > 0 && <button 
                    className="
                        rounded
                        border
                        border-eiar-green/10
                        px-8 
                        py-2
                        text-sm
                        text-eiar-deep 
                        outline-none 
                        focus:border-red-700
                        focus:ring-2
                        focus:ring-red-700
                        hover:border-red-700
                        hover:text-red-700
                        w-full
                        disabled:cursor-not-allowed
                        disabled:text-gray-500
                        disabled:hover:border-eiar-green/10
                    "
                    onClick={onClear}
                >
                    Clear Plots
                </button>
                }

            </div>

            <div>
                <p className="
                    text-xs
                    text-gray-500
                    text-justify
                    p-4
                ">
                    Wheat Water Productivity Tool (WWPT) · developed by IWMI East Africa with EIAR under WaPOR Phase II, supported by FAO and the Government of the Netherlands. 
                </p>

                <p className="text-[.7rem] text-gray-500 px-4 pt-2">&copy; 2026 Ethiopian Institute of Agricultural Research</p>
            </div>

        </div>
    )

}