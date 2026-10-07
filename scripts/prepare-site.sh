#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PARTS="$ROOT/dist/parts"
ZIP="${TMPDIR:-/tmp}/las-constelaciones-v3-remaining.zip"
: > "$ZIP"
for part in "$PARTS"/part-*; do cat "$part" >> "$ZIP"; done
unzip -oq "$ZIP" -d "$ROOT"
