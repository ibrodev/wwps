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
    onComplete: (result: EstimateResult[]) => void
}

export default function WaPORProgress({
    jobId,
    onComplete
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


    }, [progress])

    if (!jobId) return null

    if (!progress) {
        return (
            <div>
                Starting...
            </div>
        );
    }

    return (
         <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-eiar-dark/40"
      />

      <div className="relative z-10 w-full max-w-md rounded bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-b-eiar-dark/15 px-3 py-3">
          <div className="flex flex-col">
                <h2
                id="modal-title"
                className="font-semibold text-gray-900 "
                >
                    progressing
                </h2>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 "
            aria-label="Close modal"
          >
          </button>
        </div>

        <div className="mt-4 p-3">
             <div className="w-full space-y-3">

            <div className="flex justify-between">
                <span className="font-medium">
                    {progress.status}
                </span>

                <span>
                    {progress.percent.toFixed(0)}%
                </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                        width: `${progress.percent}%`,
                    }}
                />

            </div>

            <div className="text-sm text-gray-500">

                cached: {progress.cached} |

                {progress.current} of{" "}
                {progress.total} features

            </div>

            {progress.message && (
                <div className="text-sm">
                    {progress.message}
                </div>
            )}

            {progress.status === "completed" && (
                <div className="font-medium text-green-600 max-w-xl">
                    Estimation completed
                </div>
            )}

            {progress.status === "failed" && (
                <div className="font-medium text-red-600">
                    Estimation failed
                </div>
            )}

        </div>
        </div>
      </div>

       

      </div>
        
    );
}