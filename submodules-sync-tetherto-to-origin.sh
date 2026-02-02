#!/bin/bash

# Script to sync tetherto main to origin main for all submodules

set -e

git submodule foreach '
  echo "Processing submodule: $name"
  
  # Check if remote tetherto exists
  if git remote | grep -q "^tetherto$"; then
    echo "  Fetching tetherto..."
    git fetch tetherto
    
    echo "  Checking out main..."
    git checkout main
    
    echo "  Merging tetherto/main..."
    git merge tetherto/main
    
    echo "  Pushing to origin main..."
    git push origin main
    
    echo "  Successfully synced tetherto main to origin main for $name."
  else
    echo "  Warning: Remote tetherto does not exist for $name. Skipping."
  fi
'
