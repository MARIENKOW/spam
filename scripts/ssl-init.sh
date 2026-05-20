#!/bin/sh
set -e

DOMAIN=$(grep '^DOMAIN=' .env | cut -d= -f2- | sed 's/#.*//' | xargs)

if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN is not set in .env"
    exit 1
fi

DOMAIN_ARGS=$(echo "$DOMAIN" | tr ' ' '\n' | sed 's/^/-d /' | tr '\n' ' ')

echo "Requesting certificate for: $DOMAIN"

docker compose run --rm --entrypoint certbot certbot certonly --webroot \
    -w /var/www/certbot \
    --cert-name app \
    $DOMAIN_ARGS \
    --agree-tos --register-unsafely-without-email --expand
