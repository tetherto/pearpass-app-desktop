#!/bin/bash

# Script to fetch 'kapil' remote for all submodules

git submodule foreach '
  echo "Processing submodule: $name"
  
  # Check if remote kapil exists
  if git remote | grep -q "^kapil$"; then
    echo "  Fetching from remote kapil..."
    git fetch kapil || echo "  Warning: Failed to fetch from kapil for $name"
  else
    echo "  Warning: Remote kapil does not exist for $name"
  fi
'
