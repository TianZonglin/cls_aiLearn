#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPOS_FILE="$ROOT/repos.txt"
TEMP_DIR="$ROOT/_repo_sync_tmp"
COMMIT_MSG="chore: sync repos"
CLONE_RETRIES=3
RETRY_WAIT_SECONDS=5

if [[ ! -f "$REPOS_FILE" ]]; then
  echo "[ERROR] repos.txt not found: $REPOS_FILE" >&2
  exit 1
fi

command -v git >/dev/null 2>&1 || {
  echo "[ERROR] git not found in PATH" >&2
  exit 1
}

git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "[ERROR] current directory is not a git repo root: $ROOT" >&2
  exit 1
}

rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

echo "[INFO] syncing repositories from repos.txt"

clone_with_retry() {
  local repo_url="$1"
  local clone_dir="$2"
  local attempt=1

  while (( attempt <= CLONE_RETRIES )); do
    rm -rf "$clone_dir"
    echo "[INFO] clone attempt ${attempt}/${CLONE_RETRIES}: $repo_url"
    if git clone --depth 1 "$repo_url" "$clone_dir"; then
      return 0
    fi

    if (( attempt == CLONE_RETRIES )); then
      echo "[ERROR] clone failed after ${CLONE_RETRIES} attempts: $repo_url" >&2
      return 1
    fi

    echo "[WARN] clone failed, retrying in ${RETRY_WAIT_SECONDS}s..."
    sleep "$RETRY_WAIT_SECONDS"
    attempt=$((attempt + 1))
  done
}

while IFS= read -r repo_url || [[ -n "$repo_url" ]]; do
  repo_url="${repo_url#"${repo_url%%[![:space:]]*}"}"
  repo_url="${repo_url%"${repo_url##*[![:space:]]}"}"
  [[ -z "$repo_url" ]] && continue

  repo_name="${repo_url##*/}"
  repo_name="${repo_name%.git}"
  clone_dir="$TEMP_DIR/$repo_name"
  target_dir="$ROOT/$repo_name"
  staged_dir="$TEMP_DIR/${repo_name}__export"

  echo "[INFO] cloning $repo_url"
  clone_with_retry "$repo_url" "$clone_dir"

  rm -rf "$staged_dir"
  mv "$clone_dir" "$staged_dir"
  rm -rf "$staged_dir/.git"

  echo "[INFO] replacing $target_dir"
  rm -rf "$target_dir"
  mv "$staged_dir" "$target_dir"
done < "$REPOS_FILE"

echo "[INFO] committing and pushing root repository"
git -C "$ROOT" add -A

if ! git -C "$ROOT" diff --cached --quiet; then
  git -C "$ROOT" commit -m "$COMMIT_MSG"
else
  echo "[INFO] no staged changes to commit"
fi

git -C "$ROOT" push origin HEAD
echo "[INFO] done"
