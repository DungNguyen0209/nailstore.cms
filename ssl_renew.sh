#!/bin/bash

DOCKER="/usr/bin/docker"

cd /usr/local/src/nailstore.cms/ || exit 1
$DOCKER compose run certbot renew && $DOCKER compose kill -s SIGHUP nginx
$DOCKER system prune -af