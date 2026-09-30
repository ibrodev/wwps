#!/bin/sh

set -e

echo "Generating Nginx configuration..."

envsubst '${NGINX_SERVER_NAMES} ${HTTPS_HOST}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/nginx.conf

echo "Generated configuration:"
cat /etc/nginx/nginx.conf

echo "Testing Nginx configuration..."

nginx -t

exec nginx -g "daemon off;"