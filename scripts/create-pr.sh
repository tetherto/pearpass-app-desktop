#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_ORG="tetherto"
TARGET_ORG="tetherto"

# Detect the logged-in GitHub user (where forks will live)
FORK_OWNER="$(gh api user -q .login)"

echo "[info] Using GitHub user for forks: ${FORK_OWNER}"

# Repos to process (NO "-backup" suffix here)
REPO_LIST=(
  pearpass-app-desktop
  # "pearpass-app-mobile"
  # "pearpass-app-browser-extension"
  # "pear-apps-lib-feedback"
  # "pear-apps-lib-ui-react-hooks"
  # "pear-apps-utils-avatar-initials"
  # "pear-apps-utils-date"
  # "pear-apps-utils-generate-unique-id"
  # "pear-apps-utils-pattern-search"
  # "pear-apps-utils-qr"
  # "pear-apps-utils-validator"
  # "pearpass-lib-data-export"
  # "pearpass-lib-data-import"
  # "pearpass-lib-ui-react-native-components"
#  "pearpass-lib-ui-theme-provider"
#   "pearpass-lib-vault"
#   "pearpass-lib-vault-core".  
#  "pearpass-utils-password-check"
#  "pearpass-utils-password-generator"
)

BASE_BRANCH="main"               # base branch in TARGET_ORG repo
SEED_BRANCH="main"               # branch on your fork
PR_TITLE="Initial Release"

for REPO in "${REPO_LIST[@]}"; do
  echo ""
  echo "=== Processing ${REPO} ==="

  # ORIGINAL repo (PR target)
  UPSTREAM_REPO="${TARGET_ORG}/${REPO}" 

  # BACKUP repo (code source)
  ARCHIVED_REPO="${REPO}-backup" 

  # YOUR fork (PR source)
  FORK_REPO="${FORK_OWNER}/${REPO}"  

  UPSTREAM_URL="https://github.com/${UPSTREAM_REPO}.git"
  ARCHIVE_URL="https://github.com/${ARCHIVE_ORG}/${ARCHIVED_REPO}.git"
  FORK_URL="https://github.com/${FORK_REPO}.git"

  PR_BODY="This PR adds the initial code for the first PearPass release."

  WORKDIR="${REPO}-fork-seed"
  rm -rf "${WORKDIR}"

  echo "[info] Ensuring fork exists (from ORIGINAL repo): ${FORK_REPO} (fork of ${UPSTREAM_REPO})"
  if ! gh repo view "${FORK_REPO}" &>/dev/null; then
    echo "[info] Fork not found, creating fork for ${UPSTREAM_REPO} under user ${FORK_OWNER}..."
    # IMPORTANT: this forks the ORIGINAL repo, NOT the backup
    gh repo fork "${UPSTREAM_REPO}" --remote=false
  fi

  echo "[info] Cloning fork: ${FORK_URL}"
  git clone "${FORK_URL}" "${WORKDIR}"
  cd "${WORKDIR}"

  echo "[debug] git remote -v"
  git remote -v

  # Add upstream (original tetherto repo)
  git remote remove upstream 2>/dev/null || true
  git remote add upstream "${UPSTREAM_URL}"
  git fetch upstream

  # Base our seed branch on upstream/main (original repo history)
  if git show-ref --verify --quiet "refs/remotes/upstream/${BASE_BRANCH}"; then
    echo "[info] Creating branch ${SEED_BRANCH} from upstream/${BASE_BRANCH}"
    git checkout -B "${SEED_BRANCH}" "upstream/${BASE_BRANCH}"
  else
    echo "!! Upstream base branch '${BASE_BRANCH}' not found for ${REPO}, skipping."
    cd ..
    rm -rf "${WORKDIR}"
    continue
  fi

  # Add archive remote and fetch main (this is ONLY for getting code)
  echo "[info] Fetching archived repo (code source): ${ARCHIVE_URL}"
  git remote remove archive 2>/dev/null || true
  git remote add archive "${ARCHIVE_URL}"
  git fetch archive main

  # Replace current tree with archived main contents
  echo "[info] Replacing working tree with archive/main contents"
  git rm -rf . >/dev/null 2>&1 || true
  git checkout archive/main -- .

  git add .

  if git diff --cached --quiet; then
    echo "[info] No changes after importing archive/main for ${REPO}; skipping commit/PR."
    cd ..
    rm -rf "${WORKDIR}"
    continue
  fi

  git commit -m "This PR adds the initial code for the first PearPass release."

  echo "[info] Pushing '${SEED_BRANCH}' to your fork: ${FORK_REPO}"
  git push -u origin "${SEED_BRANCH}"

  echo "[info] Creating PR: ${FORK_OWNER}:${SEED_BRANCH} -> ${UPSTREAM_REPO}:${BASE_BRANCH}"
  # Base repo is the ORIGINAL repo; head is your fork/branch
  gh pr create \
    -R "${UPSTREAM_REPO}" \
    --title "${PR_TITLE}" \
    --body "${PR_BODY}" \
    --base "${BASE_BRANCH}" \
    --head "${FORK_OWNER}:${SEED_BRANCH}"

  cd ..
  rm -rf "${WORKDIR}"
  echo "=== Finished ${REPO} ==="
done