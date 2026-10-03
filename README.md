# WWPS

Wheat Water Productivity Tool (WWPT) to estimate wheat grain yield and crop water productivity using FAO WaPOR v3 satellite data, including seasonal Net Primary Production (NPP) and actual evapotranspiration (AETI), applying the FAO biomass-to-yield methodology.

## Overview

This project combines:

- a Next.js frontend for drawing, importing, and visualizing area-of-interest polygons
- a FastAPI backend for geospatial estimation requests and async job processing
- PostgreSQL with PostGIS for storing estimate results and geometries
- Redis for caching and job progress tracking
- NGINX for request routing and TLS termination

## Features

- Interactive map-based AOI selection
- GeoJSON import for field boundaries
- WaPOR productivity estimation workflow
- Background processing for long-running calculations
- Cached results to reduce redundant work
- Spatial persistence in PostGIS
- Dockerized local and production deployment

## Project structure

```text
.
├── backend/                 # FastAPI application and spatial analysis logic
├── frontend/                # Next.js client app
├── _docker/                 # Docker assets for nginx, redis, and postgis
├── backups/                 # PostgreSQL backup storage
├── docs/
│   ├── architecture.md      # Architecture overview and technical design
│   └── deployment.md        # Deployment instructions and runtime setup
├── compose.yaml             # Standard Docker Compose setup
├── compose.dev.yaml         # Development environment
├── compose.prod.yaml        # Production deployment stack
├── .sample.env              # Sample environment variables
├── .env                     # Local environment (not committed in some setups)
├── README.md                # Project entrypoint
└── ...
```

## Documentation

- [docs/architecture.md](docs/architecture.md)
- [docs/deployment.md](docs/deployment.md)

## Local development

1. Copy the sample environment file:

```bash
cp .sample.env .env
```

2. Start the development stack:

```bash
docker compose -f compose.dev.yaml up --build
```

3. Access the app:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API health check: http://localhost/api/health

## Standard deployment

```bash
docker compose up --build -d
```

## Production deployment

```bash
docker compose -f compose.prod.yaml up --build -d
```

## Typical backend health check

```bash
curl http://localhost/api/health
```

Expected response:

```json
{"status":"Okay"}
```

## Technology stack

- Frontend: Next.js, React, TypeScript, Leaflet, Tailwind
- Backend: Python, FastAPI, SQLModel, PostGIS, GeoPandas
- Data storage: PostgreSQL + PostGIS
- Caching / job tracking: Redis
- Proxy / TLS: NGINX + certbot
- Containerization: Docker Compose

## Notes

This project is designed for geospatial analysis workloads where processing can be computationally expensive. The backend intentionally uses asynchronous job tracking and Redis-backed progress updates to keep the API responsive while long-running estimations finish in the background.
