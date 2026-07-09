#!/usr/bin/env sh
set -eu

MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017/sailingloc}"
BACKUP_DIR="${BACKUP_DIR:-backups/sailingloc-$(date +%Y%m%d-%H%M%S)}"

mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR"
echo "Backup created in $BACKUP_DIR"
