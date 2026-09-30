#!/bin/bash

set -e

# Move to project root
cd "$(dirname "$0")/.."


echo "[$(date)] Checking Let's Encrypt certificate..."

docker compose -f compose.yaml -f compose.prod.yaml run --rm certbot renew

echo "[$(date)] Reloading Nginx..."

docker compose exec -T nginx nginx -s reload

echo "[$(date)] Done."