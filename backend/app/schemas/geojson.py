from datetime import datetime
from typing import Any, Literal
from typing_extensions import Self

from pydantic import BaseModel, model_validator


class Geometry(BaseModel):

    type: Literal["Point"] | Literal["Polygon"]
    coordinates: Any

class ID(BaseModel):
    ID: int

class Result(ID):

    NPP: float | None = None
    EYield_tpha: float | None = None
    AETI_mm: float | None = None
    WP_kgpm3: float | None = None
    LGP: float | None = None 

class Properties(ID):

    Name: str
    SOS: datetime
    EOS: datetime
    Location: int | None = None


class Feature(BaseModel):

    type: Literal["Feature"]
    id: int | None = None
    geometry: Geometry
    properties: Properties

    @model_validator(mode="after")
    def check_eos_after_sos(self) -> Self:
        if self.properties.EOS < self.properties.SOS:
            raise ValueError("EOS date must be after SOS date")
        return self

    @model_validator(mode="after")
    def check_point_has_location(self) -> Self:
        if self.geometry.type == "Point" and self.properties.Location is None:
            raise ValueError("Point geometry must have a Location property")
        return self

class FeatureCollection(BaseModel):

    type: Literal['FeatureCollection']
    features: list[Feature]


