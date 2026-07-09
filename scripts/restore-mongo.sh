#!/usr/bin/env sh
set -eu

MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017/sailingloc}"
BACKUP_PATH="${1:-}"

if [ -z "$BACKUP_PATH" ]; then
  echo "Usage: scripts/restore-mongo.sh <backup-path>"
  exit 1
fi

mongorestore --uri="$MONGO_URI" "$BACKUP_PATH"
