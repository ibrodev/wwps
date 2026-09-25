from datetime import datetime
import json
from multiprocessing import Process, Queue
import threading
from uuid import uuid4

import geopandas as gpd

from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select

from app.services.wapor_progress import get_progress, get_result_cache, set_progress, set_result_cache
from app.services.wapor_worker import monitor_progress, run_wapor_estimation
from app.schemas.geojson import Feature, Result
from app.core.util import hash_id
from app.core.database import engine
from app.models.estimate import Estimate

from etwapor.productivity import estimate_wheat_wp




router = APIRouter(
    prefix='/api/v1/wapor',
    tags=['wapor']
)

@router.post('/estimate')
async def estimate(features: list[Feature]):

    gdf = gpd.GeoDataFrame.from_features(
        [feature.model_dump() for feature in features],
        crs="EPSG:4326"
    )
    result = estimate_wheat_wp(
        gdf=gdf
    )

    # Convert pandas Timestamp to ISO date strings
    for column in ["SOS", "EOS"]:
        if column in result.columns:
            result[column] = result[column].dt.strftime("%Y-%m-%d")

    geojson = json.loads(result.to_json())

    print(geojson)

    return geojson


@router.post("/estimate_new")
async def create_estimation(features: list[Feature]):

    # TODO: validate each feature

    

    cached: list[Result] = []
    to_be_processed: list[Feature] = []
    
    # Keep the cache key associated with the original feature
    feature_cache_keys: dict[int, str] = {}

    for f in features:

        id = hash_id(f.geometry, f.properties.SOS, f.properties.EOS)
        found = get_result_cache(id)
        
        if found:
            cached.append({**json.loads(found["data"]), "ID": f.properties.ID})
        
        else:

            with Session(engine) as session:

                estimate = session.get(Estimate, id)

                if estimate:

                    data = {
                        "ID": f.properties.ID, 
                        "NPP": estimate.npp, 
                        "EYield_tpha": estimate.eyield_tpha,
                        "AETI_mm": estimate.aeti_mm,
                        "WP_kgpm3": estimate.wp_kgpm3,
                        "LGP": estimate.lgp
                    }

                    set_result_cache(id,  data)
                    cached.append({**json.loads(data)})
                 
                else:

                    to_be_processed.append(f)
                    feature_cache_keys[f.properties.ID] = id


    if len(to_be_processed):

        job_id = str(uuid4())
        
        set_progress(
            job_id,
            status="queued",
            percent=0,
            message="Job queued.",
        )
    
        progress_queue = Queue()

        process = Process(
            target=run_wapor_estimation,
            args=(
                job_id,
                features,
                cached,
                to_be_processed,
                feature_cache_keys,
                None,
                progress_queue,
            ),
        )

        process.start()

        total_cached = len(cached)

        monitor_thread = threading.Thread(
            target=monitor_progress,
            args=(
                job_id,
                progress_queue,
                total_cached,
            ),
            daemon=True,
        )

        monitor_thread.start()

        return {
            "job_id": job_id,
            "status": "queued",
        }

    else:
        return {
            "status": "completed",
            "results": cached
        }


@router.get("/estimate/{job_id}")
async def get_estimation_progress(job_id: str):

    progress = get_progress(job_id)

    if progress is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return progress