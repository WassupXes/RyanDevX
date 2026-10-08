#!/usr/bin/env bash
# One-time: make the VPS pull and publish the latest site every 5 minutes.
# Run as root:  bash /opt/jokiblox-src/deploy/enable-autodeploy.sh
set -euo pipefail
SRC_DIR=/opt/jokiblox-src

# git must be able to fetch without asking for a password (cron can't type it).
if ! GIT_TERMINAL_PROMPT=0 git -C "$SRC_DIR" fetch -q origin 2>/dev/null; then
  echo "git fetch needs a login. Saving credentials once (use a read-only GitHub token as the password):"
  git -C "$SRC_DIR" config credential.helper store
  git -C "$SRC_DIR" fetch origin
fi

cat > /etc/cron.d/jokiblox-update <<CRON
*/5 * * * * root bash $SRC_DIR/deploy/update.sh >> /var/log/jokiblox-update.log 2>&1
CRON
chmod 644 /etc/cron.d/jokiblox-update
echo "Auto-deploy on: the site updates within 5 minutes of every push. Log: /var/log/jokiblox-update.log"
echo "Turn off: rm /etc/cron.d/jokiblox-update"
