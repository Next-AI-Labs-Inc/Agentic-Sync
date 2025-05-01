#!/bin/bash

# IX Tasks Launcher
# This command file will open the Tasks application

# Change to the script's directory
cd "$(dirname "$0")/tasks"

# If Tauri app is installed, launch it
if [ -d "./src-tauri/target/release/bundle/macos/IX Agent Sync.app" ]; then
  echo "Opening Tauri application..."
  open "./src-tauri/target/release/bundle/macos/IX Agent Sync.app"
else
  # Otherwise, start the development server
  echo "Starting development server..."
  npm run dev
fi