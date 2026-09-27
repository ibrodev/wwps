#!/bin/bash

set -euo pipefail

COMPOSE_DIR="./"
BACKUP_DIR="$COMPOSE_DIR/backups/postgres"

cd "$COMPOSE_DIR"

mkdir -p "$BACKUP_DIR"

echo "========================================"
echo "PostgreSQL backup started"
echo "Time: $(date)"
echo "========================================"

docker compose run --rm db-backup

echo "========================================"
echo "PostgreSQL backup completed"
echo "Time: $(date)"
echo "========================================"