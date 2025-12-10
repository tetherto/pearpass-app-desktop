#!/bin/bash

# Script to add 'kapil' remote to all submodules
# Remote URL format: git@github.com:kapildev421/<repo-name>.git

git submodule foreach '
  # Get the repository name from the submodule path (assuming path is packages/repo-name)
  repo_name=$(basename "$path")
  
  # Construct the new remote URL
  new_remote_url="git@github.com:kapildev421/${repo_name}.git"
  
  echo "Processing submodule: $name"
  echo "  Repo name: $repo_name"
  echo "  Adding remote kapil: $new_remote_url"
  
  # Add the remote, suppressing error if it already exists
  if git remote | grep -q "^kapil$"; then
    echo "  Remote 'kapil' already exists. Updating URL..."
    git remote set-url kapil "$new_remote_url"
  else
    git remote add kapil "$new_remote_url"
  fi
'
