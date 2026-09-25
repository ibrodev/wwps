from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel


class Geometry(BaseModel):

    type: Literal["Point"] | Literal["Polygon"]
    coordinates: Any

class Result(BaseModel):

    ID: int
    NPP: float | None = None
    EYield_tpha: float | None = None
    AETI_mm: float | None = None
    WP_kgpm3: float | None = None
    LGP: float | None = None 

class Properties(Result):

    Name: str
    SOS: datetime
    EOS: datetime
    Location: int | None = None


class Feature(BaseModel):

    type: Literal["Feature"]
    id: int | None = None
    geometry: Geometry
    properties: Properties


class FeatureCollection(BaseModel):

    type: Literal['FeatureCollection']
    features: list[Feature]


