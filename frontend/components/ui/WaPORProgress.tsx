"use client";

import { EstimateResult } from "@/types/geojson";
import { useEffect, useState } from "react";

interface WaporProgress {
    job_id: string;
    status: string;
    cached: number;
    current: number;
    total: number;
    percent: number;
    feature_id: string | null;
    yield: number | null;
    cwp: number | null;
    message: string | null;
    results: string | null;
}

interface Props {
    jobId: string | null;
    onComplete: (result: EstimateResult[]) => void;
    onError: () => void;
}

export default function WaPORProgress({
    jobId,
    onComplete,
    onError
}: Props) {

    const [progress, setProgress] =
        useState<WaporProgress | null>(null);

    useEffect(() => {

        let timer: NodeJS.Timeout;

        const checkProgress = async () => {

            try {

                const response = await fetch(
                    `/api/v1/wapor/estimate/${jobId}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    return;
                }

                const data =
                    await response.json();

                setProgress(data);

                if (
                    data.status !== "completed" &&
                    data.status !== "failed"
                ) {
                    timer = setTimeout(
                        checkProgress,
                        1000
                    );
                }

                

            } catch (error) {

                console.error(
                    "Progress error:",
                    error
                );

                timer = setTimeout(
                    checkProgress,
                    2000
                );
            }
        };

        checkProgress();

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };

    }, [jobId]);

    useEffect(() => {

        if (progress?.status === 'completed' && progress.results) {

            const result: EstimateResult[] = JSON.parse(progress.results) 


            onComplete(result)

        }

        if (progress?.status === 'failed') {


            onError()

        }


    }, [progress])

    return (
         

        

        <div>
             <div className="w-full space-y-3">

                <div className="flex justify-between items-center">
                    <span className="font-medium uppercase">
                        {progress?.status}
                    </span>

                    <span className="text-4xl leading-none">
                        {progress?.percent.toFixed(0)}%
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded bg-gray-200">

                    <div
                        className="h-full rounded bg-blue-600 transition-all duration-300"
                        style={{
                            width: `${progress?.percent}%`,
                        }}
                    />

                </div>

                <div className="text-sm text-gray-500 flex justify-between mt-2">

                    
                    <p>{progress?.message}</p>

                    <p>Cached: {progress?.cached}</p>

                </div>

               

            </div>
        </div>

       

        
    );
}