#!/bin/bash

# Script to checkout 'kapil-main' branch from 'kapil/main' for all submodules

git submodule foreach '
  echo "Processing submodule: $name"
  
  # Check if remote kapil exists
  if git remote | grep -q "^kapil$"; then
    # Check if kapil-main branch already exists locally
    if git show-ref --verify --quiet refs/heads/kapil-main; then
        echo "  Branch kapil-main already exists. Checking it out..."
        git checkout kapil-main
        echo "  Pulling latest from kapil/main..."
        git pull kapil main || echo "  Warning: Failed to pull from kapil/main for $name"
    else
        echo "  Creating and checking out branch kapil-main from kapil/main..."
        git checkout -b kapil-main kapil/main || echo "  Warning: Failed to checkout kapil-main for $name (maybe kapil/main does not exist?)"
    fi
  else
    echo "  Warning: Remote kapil does not exist for $name"
  fi
'
