"use client"

import { Tally1 } from "lucide-react";
import { JSX } from "react/jsx-runtime";
import { array } from "zod";

export interface Statistics {
    value: string | number | null;
    unit: {
        label: JSX.Element,
        position: 'Left' | 'Bottom'
    }
}

export interface HInfoCardProps {
    title: string;
    statistics: Statistics[];
    type: 'primary' | 'subtle';
    label?: string;
}

export default function HInfoCard({
    title,
    statistics,
    type,
    label,
}: HInfoCardProps) {

    return (

        <div className={`
            p-4
            rounded-sm
            flex
            flex-col
            gap-1.5
            w-full
            ${type === 'primary' ? 'bg-eiar-dark text-white': 'bg-white text-eiar-deep'}
        `}>

            <p className={`
                uppercase
                text-sm
            `}>
                {title}
            </p>
            <div className="flex 
                    justify-between
                    items-center">

            {statistics.map((stat, i, array) =>
            <>
                <div key={i} className="
                    flex
                ">
                <div className={`
                    flex
                    ${stat.unit.position === 'Bottom' ? 'flex-col gap-1': 'gap-1.5 items-end'}
                `}>
                    <p className={`
                        text-2xl
                        font-semibold
                    `}>
                        {stat.value === 0 ? stat.value : stat.value || "-"}
                    </p>
                    <span className={`
                        text-xs
                        mb-1

                    `}>
                        {stat.unit.label}
                    </span>
                </div>

                </div>
                {(i < array.length - 1) && <span key={i+1}><Tally1 /></span>}
            </>
            )}
            </div>

            {
                label &&
                <p className={`
                    text-sm
                `}>
                    {label}
                </p>
            }

        </div>

    )

}