#!/usr/bin/env bash
# One-time, BEFORE making the GitHub repo private: give the VPS a read-only deploy key,
# so update.sh / auto-deploy keep pulling after the repo goes private.
# Run as root:  bash /opt/jokiblox-src/deploy/use-deploy-key.sh
set -euo pipefail
SRC_DIR=/opt/jokiblox-src
KEY=/root/.ssh/jokiblox_deploy
REPO=$(git -C "$SRC_DIR" remote get-url origin | sed -E 's#^(https://github\.com/|git@[^:]+:)##; s#\.git$##')

mkdir -p /root/.ssh && chmod 700 /root/.ssh
[ -f "$KEY" ] || ssh-keygen -q -t ed25519 -N "" -C "jokiblox-vps" -f "$KEY"
# GitHub SSH over port 443 (works even where outbound port 22 is blocked)
if ! grep -q "Host github-jokiblox" /root/.ssh/config 2>/dev/null; then
  cat >> /root/.ssh/config <<CFG
Host github-jokiblox
  HostName ssh.github.com
  Port 443
  User git
  IdentityFile $KEY
  IdentitiesOnly yes
CFG
  chmod 600 /root/.ssh/config
fi
grep -q "ssh.github.com" /root/.ssh/known_hosts 2>/dev/null || ssh-keyscan -p 443 ssh.github.com >> /root/.ssh/known_hosts 2>/dev/null

echo
echo "1) Copy this whole line:"
echo
cat "$KEY.pub"
echo
echo "2) GitHub → $REPO → Settings → Deploy keys → Add deploy key"
echo "   Title: VPS · paste the line · leave 'Allow write access' OFF · Add key"
read -rp "3) Press Enter once the key is added… "

git -C "$SRC_DIR" remote set-url origin "git@github-jokiblox:$REPO.git"
if git -C "$SRC_DIR" fetch -q origin; then
  echo "✓ The VPS now pulls with the deploy key. You can make the repo private."
else
  echo "✗ Pull failed. Check the key was added to $REPO (Settings → Deploy keys), then run this script again."
  exit 1
fi
