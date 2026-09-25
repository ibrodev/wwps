import json
import re
import traceback
from contextlib import redirect_stderr
from multiprocessing import Queue

import geopandas as gpd
from sqlmodel import Session
from shapely.geometry import shape
from geoalchemy2.shape import from_shape


from app.services.wapor_progress import get_result_cache, set_progress, set_result_cache
from app.schemas.geojson import Feature, FeatureCollection, Result
from app.core.util import hash_id, to_iso_date
from app.models.estimate import Estimate
from app.core.database import engine
from etwapor.productivity import estimate_wheat_wp

from app.core.config import BASE_DIR


TQDM_PATTERN = re.compile(
    r"(?P<percent>\d+(?:\.\d+)?)%"
    r".*?"
    r"\|\s*"
    r"(?P<current>\d+)/(?P<total>\d+)"
)


class TqdmCapture:

    def __init__(self, queue: Queue):
        self.queue = queue
        self.buffer = ""

    def write(self, text: str):

        if not text:
            return

        # tqdm normally uses \r to redraw the same line.
        self.buffer += text

        # Process complete tqdm updates.
        while "\r" in self.buffer or "\n" in self.buffer:

            # Find whichever comes first.
            positions = [
                p for p in (
                    self.buffer.find("\r"),
                    self.buffer.find("\n"),
                )
                if p != -1
            ]

            if not positions:
                break

            pos = min(positions)

            line = self.buffer[:pos]
            self.buffer = self.buffer[pos + 1:]

            if line.strip():
                self.queue.put(line)

    def flush(self):
        # Flush any remaining partial content.
        if self.buffer.strip():
            self.queue.put(self.buffer)
            self.buffer = ""

    def isatty(self):
        return False


def run_wapor_estimation(
    job_id: str,
    features: list[Feature],
    cached: list[Result],
    to_be_processed: list[Feature],
    feature_cache_keys: dict[int, str],
    scheme_code: str | None,
    progress_queue: Queue,
):
    try:
        

        capture = TqdmCapture(progress_queue)

        
        result_data: list[Result] = []

       

        set_progress(
            job_id,
            status="processing",
            cached=len(cached),
            current=0,
            total=len(to_be_processed),
            percent=0,
            message="Starting estimation...",
        )

        if len(to_be_processed):

            

            gdf = gpd.GeoDataFrame.from_features(
                [feature.model_dump() for feature in to_be_processed],
                crs="EPSG:4326"
            )

            with redirect_stderr(capture):

                result = estimate_wheat_wp(
                    gdf=gdf,
                    scheme_code=scheme_code,
                    show_progress=True,
                )


            capture.flush()



            # Convert pandas Timestamp to ISO date strings
            for column in ["SOS", "EOS"]:
                if column in result.columns:
                    result[column] = to_iso_date(result[column])


            json_result: FeatureCollection = FeatureCollection.model_validate(
                json.loads(result.to_json())
            )

            to_db: list[Estimate] = []

            for r in json_result.features:
                
                id = feature_cache_keys[r.properties.ID]
                

                data = {
                    "ID": r.properties.ID, 
                    "NPP": r.properties.NPP, 
                    "EYield_tpha": r.properties.EYield_tpha,
                    "AETI_mm": r.properties.AETI_mm,
                    "WP_kgpm3": r.properties.WP_kgpm3,
                    "LGP": r.properties.LGP
                }

                result_data.append(data)
                set_result_cache(id,  data)

                # GeoJSON -> Shapely
                geometry = shape(r.geometry.model_dump())

                to_db.append(Estimate(
                    id=id,
                    name=r.properties.Name,
                    geometry_type=r.geometry.type,
                    location=r.properties.Location,
                    geometry=from_shape(geometry, srid=4326),
                    sos=r.properties.SOS,
                    eos=r.properties.EOS,
                    npp=r.properties.NPP,
                    eyield_tpha=r.properties.EYield_tpha,
                    aeti_mm=r.properties.AETI_mm,
                    wp_kgpm3=r.properties.WP_kgpm3,
                    lgp=r.properties.LGP,
                ))

            if len(to_db):

                with Session(engine) as session:
                    for e in to_db:
                        session.add(e)
                    session.commit()
        

        # print(cached)
        # print(result_data)

        progress_queue.put({
            "type": "completed",
            "results": json.dumps([*result_data,*cached]),
            "cached": len(cached)
        })

        

    except Exception as exc:

        print(traceback.format_exc())

        progress_queue.put({
            "type": "failed",
            "error": str(exc),
            "traceback": traceback.format_exc(),
        })


def parse_tqdm(text: str):

    match = TQDM_PATTERN.search(text)

    if not match:
        return None

    return {
        "percent": float(match.group("percent")),
        "current": int(match.group("current")),
        "total": int(match.group("total")),
    }


def monitor_progress(
    job_id: str,
    queue: Queue,
    total_cached: int
):

    while True:

        message = queue.get()

        if isinstance(message, dict):

            if message["type"] == "completed":

                set_progress(
                    job_id,
                    results=message["results"],
                    status="completed",
                    cached=total_cached,
                    percent=100,
                    message="Estimation completed.",
                )

                break

            if message["type"] == "failed":

                set_progress(
                    job_id,
                    status="failed",
                    message=message["error"],
                )

                break

            continue

        progress = parse_tqdm(message)

        if progress:


            set_progress(
                job_id,
                status="processing",
                cached=total_cached,
                current=progress["current"],
                total=progress["total"],
                percent=progress["percent"],
                message=(
                    f"Processing "
                    f"{progress['current']}/{progress['total']}"
                ),
            )

    