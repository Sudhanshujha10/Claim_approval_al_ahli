#!/usr/bin/env bash
set -euo pipefail

LATEST_PATCH=$(ls -1t change-logs/*.patch 2>/dev/null | head -n 1 || true)
if [ -z "${LATEST_PATCH}" ]; then
  echo "No patch files found in change-logs/."
  exit 1
fi

echo "Reverting latest patch: ${LATEST_PATCH}"
git apply -R "${LATEST_PATCH}"

