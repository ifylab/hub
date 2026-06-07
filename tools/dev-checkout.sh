#!/usr/bin/env bash
# dev-checkout.sh — clone or update every portfolio repo as a sibling of the hub,
# reading the list from apps/index.json. Sub-projects live next to hub/, not inside it.
set -euo pipefail

hub_dir="$(cd "$(dirname "$0")/.." && pwd)"
workspace_dir="$(dirname "$hub_dir")"
index="$hub_dir/apps/index.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required (brew install jq)" >&2
  exit 1
fi

if [ ! -f "$index" ]; then
  echo "error: $index not found" >&2
  exit 1
fi

count="$(jq '.projects | length' "$index")"
if [ "$count" -eq 0 ]; then
  echo "No projects listed in apps/index.json yet."
  exit 0
fi

jq -r '.projects[] | "\(.name)\t\(.repo)"' "$index" | while IFS="$(printf '\t')" read -r name repo; do
  dest="$workspace_dir/$name"
  if [ -d "$dest/.git" ]; then
    echo "updating $name"
    git -C "$dest" pull --ff-only
  else
    echo "cloning $name"
    git clone "$repo" "$dest"
  fi
done
