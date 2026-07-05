#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
# new-project.sh — scaffold a new .ify sub-project as a workspace sibling.
#
# Usage:
#   tools/new-project.sh <slug> --stack python|csharp [--desc "one-liner"] [--dest <dir>]
#
# <slug> is the repo name (kebab-case). The project is created as a sibling of
# the hub checkout unless --dest overrides it. The script scaffolds and runs
# `git init` with the project identity; it never commits, never creates the
# GitHub repo, and never registers the project in apps/index.json — those are
# ship-time steps (see the checklist it prints).
set -euo pipefail

usage() { sed -n '3,12p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }

hub_dir="$(cd "$(dirname "$0")/.." && pwd)"
template_dir="$hub_dir/template"
dest_root="$(dirname "$hub_dir")"

slug="" stack="" desc="TODO: one plain sentence — what it does and for whom."
while [ $# -gt 0 ]; do
  case "$1" in
    --stack) stack="${2:-}"; shift 2 ;;
    --desc)  desc="${2:-}";  shift 2 ;;
    --dest)  dest_root="${2:-}"; shift 2 ;;
    -h|--help) usage ;;
    -*) echo "error: unknown flag $1" >&2; usage ;;
    *) if [ -n "$slug" ]; then echo "error: unexpected argument $1" >&2; usage; fi; slug="$1"; shift ;;
  esac
done

[ -n "$slug" ] || usage
case "$stack" in python|csharp) ;; *) echo "error: --stack must be python or csharp" >&2; usage ;; esac
printf '%s' "$slug" | grep -Eq '^[a-z][a-z0-9-]*[a-z0-9]$' || {
  echo "error: slug must be kebab-case (lowercase letters, digits, hyphens)" >&2; exit 1; }

dest="$dest_root/$slug"
[ ! -e "$dest" ] || { echo "error: $dest already exists" >&2; exit 1; }

package="$(printf '%s' "$slug" | tr '-' '_')"
name="$(printf '%s' "$slug" | awk -F- '{ out=""; for (i=1; i<=NF; i++) out = out toupper(substr($i,1,1)) substr($i,2); print out }')"
year="$(date +%Y)"

# Deterministic per-project VSCode chrome color: hash of slug into a fixed palette.
palette=("#416F6F" "#3E5153" "#41546F" "#46466F" "#55416F" "#6F416A" "#6F4141" "#6F5B41" "#6F6041" "#4A6F41" "#416F5A" "#5B4A6F")
idx="$(printf '%s' "$slug" | cksum | cut -d' ' -f1)"
color="${palette[$((idx % ${#palette[@]}))]}"

mkdir -p "$dest"
cp -R "$template_dir/common/." "$dest/"
cp -R "$template_dir/$stack/." "$dest/"

# Rename placeholder path components (deepest first), then substitute tokens.
while IFS= read -r p; do
  base="$(basename "$p")"
  new="$(printf '%s' "$base" | sed "s/__PACKAGE__/$package/g; s/__NAME__/$name/g")"
  [ "$base" = "$new" ] || mv "$p" "$(dirname "$p")/$new"
done < <(find "$dest" -depth \( -name '*__PACKAGE__*' -o -name '*__NAME__*' \))

SLUG="$slug" PACKAGE="$package" NAME="$name" DESC="$desc" YEAR="$year" COLOR="$color" \
  find "$dest" -type f -exec perl -pi -e \
  's/__SLUG__/$ENV{SLUG}/g; s/__PACKAGE__/$ENV{PACKAGE}/g; s/__NAME__/$ENV{NAME}/g; s/__DESC__/$ENV{DESC}/g; s/__YEAR__/$ENV{YEAR}/g; s/__COLOR__/$ENV{COLOR}/g' {} +

git -C "$dest" init -b main -q
git -C "$dest" config user.name "Hossein Zargar"
git -C "$dest" config user.email "goldsmith323@gmail.com"
if [ -f "$HOME/.ssh/id_ed25519.pub" ]; then
  git -C "$dest" config gpg.format ssh
  git -C "$dest" config user.signingkey "$HOME/.ssh/id_ed25519.pub"
  git -C "$dest" config commit.gpgsign true
fi

cat <<EOF
Scaffolded $slug ($stack) at $dest

Next steps:
  1. Add the local CLAUDE.md (gitignored; skeleton in workbook/Plan/10-subproject-template.md).
  2. Replace the TODO description and README placeholders before anything ships.
$( [ "$stack" = "python" ] && echo "  3. First run: uv sync && uv run pytest" || echo "  3. First run: dotnet build $name.sln && dotnet test $name.sln" )
  4. Commit when ready (identity and SSH signing are preconfigured in this repo).

At ship time (the ship-a-tool ripple, per workbook):
  - gh repo create ifylab/$slug --public --source "$dest" --push
  - Repo settings: description, topics, homepage; enable Discussions; enable
    secret scanning + push protection + Dependabot security; add the main ruleset.
  - Add the tool to hub/apps/index.json:
      { "name": "$slug", "repo": "https://github.com/ifylab/$slug",
        "description": "<final one-liner>", "language": "<Python|C#>", "status": "active" }
  - Surface it: hub README, org profile README, site Tools page, personal profile.
EOF
