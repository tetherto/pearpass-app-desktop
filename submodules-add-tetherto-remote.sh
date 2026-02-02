#!/bin/bash

# Script to add 'tetherto' remote to all submodules
# Remote URL format: git@github.com:tetherto/<repo-name>.git

git submodule foreach '
  # Get the repository name from the submodule path (assuming path is packages/repo-name)
  repo_name=$(basename "$path")
  
  # Construct the new remote URL
  new_remote_url="git@github.com:tetherto/${repo_name}.git"
  
  echo "Processing submodule: $name"
  echo "  Repo name: $repo_name"
  echo "  Adding remote tetherto: $new_remote_url"
  
  # Add the remote, suppressing error if it already exists
  if git remote | grep -q "^tetherto$"; then
    echo "  Remote 'tetherto' already exists. Updating URL..."
    git remote set-url tetherto "$new_remote_url"
  else
    git remote add tetherto "$new_remote_url"
  fi
'
