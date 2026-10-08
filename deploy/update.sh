#!/usr/bin/env bash
# Pull the latest site and publish it. Run as root on the VPS.
set -euo pipefail
SRC_DIR=/opt/jokiblox-src
BRANCH="${BRANCH:-$(git -C "$SRC_DIR" rev-parse --abbrev-ref HEAD)}"
git -C "$SRC_DIR" fetch origin "$BRANCH"
git -C "$SRC_DIR" reset --hard "origin/$BRANCH"
rsync -a --delete "$SRC_DIR/site/" /var/www/jokiblox/
chown -R www-data:www-data /var/www/jokiblox
echo "Updated to $(git -C "$SRC_DIR" log -1 --format='%h %s')"
