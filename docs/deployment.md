# Deployment

## Overview

This project is packaged for containerized deployment using Docker Compose. The stack includes:

- `frontend` — Next.js web application
- `backend` — FastAPI API service
- `db` — PostgreSQL with PostGIS
- `redis` — Redis for job cache and progress state
- `nginx` — reverse proxy and TLS termination
- `certbot` — SSL certificate management
- `db-backup` — one-off PostgreSQL dump job

The deployment model is intended for both local development and production-like environments.

## Prerequisites

- Docker Engine
- Docker Compose v2
- A `.env` file based on `.sample.env`
- For production HTTPS, a valid domain and access to ports 80 and 443

## Configuration

Start from the sample environment file:

```bash
cp .sample.env .env
```

Key variables include:

- `PROJECT_NAME` — prefix used for container names and volumes
- `POSTGRES_PASSWORD` — database password
- `DATABASE_URL` — backend connection string to PostgreSQL
- `NGINX_SERVER_NAMES` — domain or IP list served by NGINX
- `HTTPS_HOST` — certificate host for LetsEncrypt
- `ADMIN_EMAIL` — optional operational contact

Example values:

```env
PROJECT_NAME=wwp_system
POSTGRES_PASSWORD=change-me
DATABASE_URL=postgresql+psycopg://postgres:change-me@db:5432/postgres
NGINX_SERVER_NAMES="example.gov.et"
HTTPS_HOST=example.gov.et
```

## Local development deployment

The development stack uses the `compose.dev.yaml` file and exposes the backend and frontend directly to the host.

```bash
docker compose -f compose.dev.yaml up --build
```

This starts:

- frontend on `http://localhost:3000`
- backend on `http://localhost:8000`
- PostgreSQL on `localhost:5432`
- Redis on the internal Docker network

The dev configuration mounts source folders for live reload, and build targets are set to the dev images for both backend and frontend.

## Standard application deployment

The default Compose file is designed for a composed runtime environment with NGINX in front of the application stack.

```bash
docker compose up --build -d
```

This arrangement exposes the app via NGINX and typically routes:

- `/` -> frontend
- `/api/` -> backend

The DB and Redis remain internal to the Docker network unless explicitly port-mapped.

## Production deployment

The production-oriented stack is defined in `compose.prod.yaml` and includes certbot, NGINX SSL configuration, and production image targets.

```bash
docker compose -f compose.prod.yaml up --build -d
```

Production behavior:

- `frontend` uses the production builder/runner image
- `backend` uses the production Python image
- `nginx` serves HTTP on port `80` and HTTPS on port `443`
- `certbot` obtains/renews SSL certificates in `./_docker/nginx/certbot`

## NGINX routing behavior

The nginx configuration forwards:

- `/` to the frontend service on port `3000`
- `/api/` to the backend service on port `8000`

This keeps the frontend and backend logically separated while presenting a single public entry point.

## TLS certificate initialization and renewal

The project includes helper scripts in `scripts/` for certificate setup and renewal:

- `scripts/init-letsencrypt.sh` — creates an initial Let's Encrypt certificate
- `scripts/renew-letsencrypt.sh` — renews the current certificate and reloads NGINX

### Initialize a certificate

Before running the certificate request, make sure the environment includes the required values:

```bash
cp .sample.env .env
```

Then confirm these are set in `.env`:

```env
ADMIN_EMAIL=admin@example.com
HTTPS_HOST=example.gov.et
NGINX_SERVER_NAMES="example.gov.et"
```

Run the initialization script:

```bash
bash scripts/init-letsencrypt.sh
```

This script:

1. loads `.env`
2. validates `ADMIN_EMAIL` and `HTTPS_HOST`
3. runs `docker compose -f compose.yaml -f compose.prod.yaml run --rm certbot certonly --webroot ... -d "${HTTPS_HOST}"`
4. stores the certificate under `./_docker/nginx/certbot`

### Renew the certificate

To renew the certificate and reload NGINX:

```bash
bash scripts/renew-letsencrypt.sh
```

The script runs:

```bash
docker compose -f compose.yaml -f compose.prod.yaml run --rm certbot renew
docker compose exec -T nginx nginx -s reload
```

This is the expected process for keeping the Let's Encrypt certificate valid without manual intervention.

## Persistence and backup

The stack persists database data using a Docker named volume:

```yaml
volumes:
  dbdata:
    name: ${PROJECT_NAME}_dbdata
```

The backup job is available as an optional Compose profile:

```bash
docker compose run --rm --profile backup db-backup
```

This creates a PostgreSQL dump under `./backups/postgres` and removes files older than 14 days.

### Recovery and restore

To restore a previous PostgreSQL dump, first identify the dump file in `./backups/postgres`:

```bash
ls -lh ./backups/postgres
```

Then stop the app if you want a clean restore and restore the database from the dump:

```bash
docker compose down
docker compose up -d db
```

Once the database is up and healthy, run a restore command into the PostgreSQL container:

```bash
cat ./backups/postgres/<backup-file>.dump | docker exec -i $(docker compose ps -q db) pg_restore --clean --if-exists --no-owner --no-privileges -d postgres
```

If you are restoring a plain SQL dump instead of a custom format file, use:

```bash
cat ./backups/postgres/<backup-file>.sql | docker exec -i $(docker compose ps -q db) psql -U postgres -d postgres
```

After the restore completes, bring the rest of the stack back up:

```bash
docker compose up -d
```

For production recoveries, make sure to confirm the version compatibility of the dump and the target Postgres image before restoring.

## Health and verification

After startup, verify the API is reachable:

```bash
curl http://localhost/api/health
```

Expected response:

```json
{"status":"Okay"}
```

For a dev environment, the frontend should also be reachable at:

```bash
curl http://localhost:3000
```

## Container build targets

The Dockerfiles use multi-stage builds:

- `frontend/Dockerfile`
  - `dev` for local development
  - `deps` and `builder` for production build preparation
  - `runner` for the production Next.js server

- `backend/Dockerfile`
  - `dev` for hot-reload development
  - `builder` for dependency installation
  - `prod` for runtime image with the installed app

## Recommended production checklist

- copy `.sample.env` to `.env` and set real secrets
- set `NGINX_SERVER_NAMES` to the public domain
- ensure port `80` and `443` are open on the host
- ensure the certificate path is valid before enabling HTTPS
- set up regular PostgreSQL backups
- review Redis persistence and retention for long-running jobs
- verify the backend can reach `db` and `redis` by service name over the Docker network

## Typical commands

### Restart everything

```bash
docker compose down && docker compose up --build -d
```

### View logs

```bash
docker compose logs -f backend frontend nginx db redis
```

### Stop services

```bash
docker compose down
```

## Notes

- Development and production files are intentionally separate, allowing different ports, build targets, and HTTPS/SSL configurations.
- The `certbot` service depends on the NGINX certificate challenge directory, which is mounted into the container.
- If you change the project name or domain, ensure the `.env` values and container names stay consistent with the Compose configuration.
