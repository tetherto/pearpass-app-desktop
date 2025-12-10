#!/bin/bash

# Script to checkout all submodules to main branch and pull latest changes
# Usage: ./update-submodules.sh [remote-name]
# If no remote is specified, 'origin' will be used by default

# Use first argument as remote name, default to 'origin'
REMOTE="${1:-origin}"

echo "Updating all submodules to main branch using remote: $REMOTE"

# Initialize and update submodules
git submodule update --init --recursive

# Iterate through each submodule
git submodule foreach "
  echo \"Processing submodule: \$name\"
  git checkout main || echo \"Warning: Could not checkout main for \$name\"
  echo \"Pulling from $REMOTE remote\"
  git pull $REMOTE main || echo \"Warning: Could not pull latest from $REMOTE for \$name\"
  echo \"---\"
"

echo "All submodules updated successfully!"
