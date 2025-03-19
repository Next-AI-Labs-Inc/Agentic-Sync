#!/bin/bash
# sync-remotes.sh
# Script to synchronize main branch between personal and organization remotes

# Ensure we're on the main branch
current_branch=$(git symbolic-ref --short HEAD)
if [[ "$current_branch" != "main" ]]; then
  echo "⚠️ Not on main branch. Currently on: $current_branch"
  echo "Please checkout main branch first with: git checkout main"
  exit 1
fi

# Pull from both remotes first to avoid conflicts
echo "Pulling latest changes from origin/main..."
git pull origin main

echo "Pulling latest changes from organization/main..."
git pull organization main

# Push to both remotes
echo "Pushing to origin/main..."
git push origin main

echo "Pushing to organization/main..."
git push organization main

echo "✅ Successfully synchronized main branch with both remotes!"