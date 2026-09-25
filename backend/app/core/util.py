from datetime import date, datetime
import hashlib
import json
from typing import Any

from app.schemas.geojson import Geometry

def to_iso_date(date: str):
    return date.dt.strftime("%Y-%m-%d")

def rounded(g: Any) -> Any:
        if isinstance(g, (list, tuple)):
            return [rounded(x) for x in g]
        if isinstance(g, float):
            return round(g, 6)
        return g



def hash_id(geometry: Geometry, sos: datetime, eos: datetime):

    blob = json.dumps(
        {
            "type": geometry.type, 
            "coordinates": rounded(geometry.coordinates),
            "sos": sos.isoformat(),
            "eos": eos.isoformat()
        }
    ).encode()

    return hashlib.sha256(blob).hexdigest()


