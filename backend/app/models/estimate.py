from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel
from geoalchemy2 import Geometry


class Estimate(SQLModel, table=True):

    __tablename__ = "estimates"

    id: str = Field(primary_key=True)
    name: str
    geometry_type: str
    location: int | None = None

    geometry: Any | None = Field(
        sa_column=Column(
            Geometry(
                geometry_type="GEOMETRY",
                srid=4326,
                spatial_index=True,
            ),
            nullable=True,
        )
    )

    sos: date
    eos: date

    scheme_code: str | None = None

    npp: float | None = None
    eyield_tpha: float | None = None
    aeti_mm: float | None = None
    wp_kgpm3: float | None = None
    lgp: float | None = None

    area_ha: float | None = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
        ),
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            onupdate=lambda: datetime.now(timezone.utc),
        ),
    )
