#!/usr/bin/env bash
# One-time setup on an Ubuntu/Debian VPS. Run as root in the server console:
#   bash setup-vps.sh
# Safe for servers that already host other sites: it only ADDS a new nginx site
# and tests the config before reloading.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/WassupXes/RyanDevX.git}"
BRANCH="${BRANCH:-claude/dazzling-galileo-xznxdg}"
SRC_DIR=/opt/jokiblox-src
WEB_DIR=/var/www/jokiblox
EMAIL="${EMAIL:-you@example.com}"   # set to your email for Let's Encrypt expiry notices

apt-get update -y
apt-get install -y nginx git rsync certbot python3-certbot-nginx

if [ -d "$SRC_DIR/.git" ]; then
  git -C "$SRC_DIR" fetch origin "$BRANCH" && git -C "$SRC_DIR" checkout -B "$BRANCH" "origin/$BRANCH"
else
  # Private repo? Git will ask for your GitHub username + a Personal Access Token.
  git clone --branch "$BRANCH" "$REPO_URL" "$SRC_DIR"
fi

mkdir -p "$WEB_DIR"
rsync -a --delete "$SRC_DIR/site/" "$WEB_DIR/"
chown -R www-data:www-data "$WEB_DIR"

cp "$SRC_DIR/deploy/nginx-jokiblox.conf" /etc/nginx/sites-available/jokiblox.conf
ln -sf /etc/nginx/sites-available/jokiblox.conf /etc/nginx/sites-enabled/jokiblox.conf
nginx -t
systemctl reload nginx

if command -v ufw >/dev/null && ufw status | grep -q active; then ufw allow 'Nginx Full'; fi

echo
echo "Site files are live on port 80. Next:"
echo "  1) Point DNS:  A  jokiblox.com -> $(curl -fsS https://api.ipify.org || echo '<server IP>')   and   A  www -> same IP"
echo "  2) When DNS resolves, enable HTTPS:"
echo "     certbot --nginx -d jokiblox.com -d www.jokiblox.com -m $EMAIL --agree-tos --redirect -n"
echo "  3) To update later:  bash $SRC_DIR/deploy/update.sh"
