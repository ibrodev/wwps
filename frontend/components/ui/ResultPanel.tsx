"use client"

import area from '@turf/area'

import { GeoJSONFeature } from "@/types/geojson"
import HInfoCard, { HInfoCardProps } from "./HInfoCard";
import Chart from './Chart';
import { FileUp, MoveRight } from 'lucide-react';
import { exportCSV, exportGeoJSON } from '@/lib/fileExport';
import {formatDate} from '@/lib/dateHelpers'

interface ResultPanelProps {
    aoi: GeoJSONFeature[] | [];
    current: GeoJSONFeature | null;
    isCalculated: boolean;
    onExport: () => void
}

export default function ResultPanel(
    {
        aoi,
        current,
        isCalculated,
        onExport
    }: ResultPanelProps
) {

    const round = (value:string | number | null | undefined): string | null => {
        
        if(!value) return null
        
        return Number(value).toFixed(2)
    }

    const mean = (values: number[]) => {
        return round(values.reduce((p, n) => p + n, 0) / values.length)
    }


    const getAOIInfo = (aoi: GeoJSONFeature) => `${aoi.geometry.type} - ID: ${aoi.properties.ID}`

    const getWPInfo = (): HInfoCardProps => {

        return {
            title: `${!current ? 'mean' : ''} water productivity`,
            statistics: [{
                value: current ? round(current.properties.WP_kgpm3) : mean(aoi.map(a => a.properties.WP_kgpm3).filter(a => a !== null && a !== undefined)),
                unit: {
                    label: <><span>kg/m</span><sup>3</sup></>,
                    position: 'Left'
                }
            }],
            type: 'primary'
        }

    }


    const getEYInfo = (): HInfoCardProps => {

        return {
            title: `${!current ? 'mean' : ''} est. yield`,
            statistics: [{
                value: current ? round(current.properties.EYield_tpha) : mean(aoi.map(a => a.properties.EYield_tpha).filter(a => a !== null && a !== undefined)),
                unit: {
                    label: <><span>t/ha</span></>,
                    position: 'Left'
                }
            }],
            type: 'subtle'
        }

    }

    const getAETIInfo = (): HInfoCardProps => {

        return {
            title: `${!current ? 'mean' : ''} seasonal aeti`,
            statistics: [{
                value: current ? round(current.properties.AETI_mm) : mean(aoi.map(a => a.properties.AETI_mm).filter(a => a !== null && a !== undefined)),
                unit: {
                    label: <><span>mm</span></>,
                    position: 'Left'
                }
            }],
            type: 'subtle'
        }

    }

    const getNPPInfo = (): HInfoCardProps => {

        return {
            title: `Seasonal NPP`,
            statistics: [{
                value: round(current?.properties.NPP) || null,
                unit: {
                    label: <><span>gc/m</span><sup>3</sup></>,
                    position: 'Left'
                }
            }],
            type: 'subtle'
        }

    }

    const getAreaInfo = (): HInfoCardProps => {

        const shapeArea = (feature: GeoJSONFeature) => feature.geometry.type === "Polygon" ? round(area(feature) / 10_000) : null

        const totalArea = (features: GeoJSONFeature[]) => round(features.reduce((a, b) => a + Number(shapeArea(b)), 0))

        return {
            title: `area ${!current ? 'analyzed' : ''}`,
            statistics: [{
                value: current ? shapeArea(current) : totalArea(aoi),
                unit: {
                    label: <><span>ha</span></>,
                    position: 'Left'
                }
            }],
            type: 'subtle'
        }
    } 


    const getAnalyzedFeaturesInfo = (): HInfoCardProps => {

        return {
            title: `features analyzed`,
            statistics: [
                {
                    value: aoi.reduce((a, b) => b.geometry.type === "Point" ? a + 1 : a, 0),
                    unit: {
                        label: <><span>Point</span></>,
                        position: 'Left'
                    }
                },
                {
                    value: aoi.reduce((a, b) => b.geometry.type === "Polygon" ? a + 1 : a, 0),
                    unit: {
                        label: <><span>Polygon</span></>,
                        position: 'Left'
                    }
                }
            ],
            type: 'subtle'
        }

    }

    return (
        <div className={`
            absolute
            w-96
            right-2.5
            top-2.5
            bottom-2.5
            z-[200]
            overflow-hidden
            overflow-y-auto
            pb-3
            transition-all
            duration-300
            ease-out
            ${!aoi.length && !current ? 'translate-x-[104%]' : 'translate-x-0'}
        `}>

        <div className='
            w-full 
            gap-1.5
            flex
            flex-col
        '>

            <div className="
                bg-white
                p-4
                rounded-tl-sm
                rounded-tr-sm
                flex
                border-b
                border-gray-800
                justify-between
                items-center
            ">
                <div className='
                flex
                flex-col
                gap-1.5'>
                    <p className="
                    text-sm
                    font-semibold
                ">
                    {current ? current.properties.Name : "Season results"}
                </p>
                <p className="
                    text-xs
                    text-gray-600
                ">
                    {
                        current ? 
                        getAOIInfo(current) :  
                        `${aoi.length} areas of interest`
                    }
                </p>
                </div>
                <div>
                    <span className='px-2 py-1 rounded-xl bg-amber-500/20 text-amber-900 text-xs'>WaPOR v3</span>
                </div>
            </div>

            {(current || !!aoi.length ) && 
            <>
                <HInfoCard 
                    {...getWPInfo()}
                />

                <div className="
                    flex
                    gap-1.5
                    flex-nowrap
                ">
                    <HInfoCard 
                        {...getEYInfo()}
                    />
                    <HInfoCard 
                        {...getAETIInfo()}
                    />  
                </div>
                <div className="
                    flex
                    gap-1.5
                    flex-nowrap
                ">

                    {current && <HInfoCard {...getNPPInfo()}/>}
                    <HInfoCard {...getAreaInfo()}/>
                    {!current && <HInfoCard {...getAnalyzedFeaturesInfo()}/>}

                </div>
            </>
            }

            {!current && aoi.length > 0 && <Chart 
                data={aoi.map(a => {return {name: a.properties.Name, value: Number(a.properties.EYield_tpha)}})}
                title="Estimated crop yield"
                unit='t/ha'
            />}

            {!current && aoi.length > 0 && <Chart 
                data={aoi.map(a => {return {name: a.properties.Name, value: Number(a.properties.WP_kgpm3)}})}
                title="Water productivity"
                unit='kg/m³'
                hslColor={{hue: 197, sat: 93, lig: 29}}
            />}

            {current && <div className='bg-white flex p-4 justify-between items-center rounded '>
                <div className='flex flex-col flex-auto gap-1.5'>
                    <p className='uppercase text-sm'>growing period</p>
                    <p className='text-sm font-semibold flex gap-1.5 items-center'>{formatDate(current.properties.SOS)} <MoveRight size={10}/> {formatDate(current.properties.EOS)}</p>
                </div>
                <div className='w-max'>
                    <p className='text-3xl font-bold'>{current.properties.LGP || '-'}</p>
                    <p className='text-xs text-slate-600'>days (LGP)</p>
                </div>
            </div> }

            {isCalculated && <div className='flex gap-2'>

                    <button
                        className='
                            rounded 
                            border
                            border-eiar-green/90
                            bg-white
                            px-2 
                            py-4
                            text-sm
                            text-eiar-green 
                            outline-none 
                            focus:border-eiar-green
                            focus:ring-2
                            focus:ring-eiar-green/20
                            hover:bg-slate-50
                            w-full
                            disabled:cursor-not-allowed
                            disabled:text-eiar-green/50
                            disabled:bg-eiar-green/10
                            disabled:border-eiar-green/10
                            disabled:hover:bg-eiar-green/10
                            flex
                            items-center
                            justify-center
                            gap-3
                            cursor-pointer
                        '

                        disabled={!isCalculated}
                        onClick={() => exportCSV(current || aoi)}
                        title={!isCalculated ? 'Please run analysis to export results' : ''}
                    >

                        <FileUp size={18}/> Export CSV

                    </button>

                    <button
                        className='
                            rounded 
                            border
                            border-eiar-green/90
                            bg-white
                            px-2 
                            py-4
                            text-sm
                            text-eiar-green 
                            outline-none 
                            focus:border-eiar-green
                            focus:ring-2
                            focus:ring-eiar-green/20
                            hover:bg-slate-50
                            w-full
                            disabled:cursor-not-allowed
                            disabled:text-eiar-green/50
                            disabled:bg-eiar-green/10
                            disabled:border-eiar-green/10
                            disabled:hover:bg-eiar-green/10
                            flex
                            items-center
                            justify-center
                            gap-3
                            cursor-pointer
                        '

                        disabled={!isCalculated}
                        onClick={() => exportGeoJSON(current || aoi)}
                        title={!isCalculated ? 'Please run analysis to export results' : ''}
                    >

                        <FileUp size={16}/> Export GeoJSON

                    </button>


                   


            </div> }
        </div>
        </div>
    )
}