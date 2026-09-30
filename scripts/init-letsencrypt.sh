#!/bin/bash

set -e

# Move to project root
cd "$(dirname "$0")/.."

# Load .env
if [ ! -f .env ]; then
    echo "ERROR: .env file not found."
    exit 1
fi

set -a
source .env
set +a

# Validate required variables
if [ -z "${ADMIN_EMAIL:-}" ]; then
    echo "ERROR: ADMIN_EMAIL is not set in .env"
    exit 1
fi

if [ -z "${HTTPS_HOST:-}" ]; then
    echo "ERROR: HTTPS_HOST is not set in .env"
    exit 1
fi

echo "Requesting Let's Encrypt certificate..."
echo "Domain: ${HTTPS_HOST}"
echo "Email:  ${ADMIN_EMAIL}"

docker compose -f compose.yml -f compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${ADMIN_EMAIL}" \
    --agree-tos \
    --no-eff-email \
    -d "${HTTPS_HOST}"

echo
echo "Let's Encrypt certificate request completed."