# Tauri Conversion Plan for Tasks App

## Overview

This document outlines the plan to convert the Tasks web application into a native desktop application using Tauri, with instructions for building and running the macOS version.

## Why Tauri?

1. **Higher Performance**: Uses system WebView instead of bundling Chromium
2. **Smaller Size**: 3-10MB vs 100MB+ for Electron
3. **Native Features**: Access to native OS capabilities
4. **Security**: More secure than Electron due to its architecture
5. **Auto-Updates**: Built-in update system

## macOS Build Instructions

### Prerequisites

1. **Install Rust and Cargo**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install macOS Dependencies**:
   ```bash
   xcode-select --install
   ```

3. **Install Tauri CLI**:
   ```bash
   npm install -g @tauri-apps/cli
   ```

### Building the macOS Application

1. **Build the Next.js application**:
   ```bash
   cd /Users/jedi/react_projects/ix/tasks
   npm run build
   ```

2. **Bundle the application for macOS**:
   ```bash
   npm run tauri:build
   ```
   The built application will be available in `src-tauri/target/release/bundle/macos/`

### Development Testing

1. **Run in development mode (hot-reload)**:
   ```bash
   npm run tauri:dev
   ```

2. **Running production and development simultaneously**:
   - Development runs on port 3045: `npm run dev`
   - Production runs on port 3046: `npm run prod`

## Implementation Plan

### Phase 1: Setup & Proof of Concept

1. Create new git branch `feature/tauri-wrapper` from master
2. Set up Tauri in the existing Next.js project
3. Create basic Rust commands to test API communication
4. Build proof-of-concept to validate approach

### Phase 2: Core Functionality

1. Configure Tauri to use existing Next.js UI
2. Create Rust backend commands for all API operations
3. Modify React components to use Tauri commands instead of direct API calls
4. Implement authentication and session management

### Phase 3: Desktop Experience

1. Add offline capability with local caching
2. Configure automatic updates
3. Create macOS application icons and resources
4. Implement system tray integration
5. Add native notifications

### Phase 4: Distribution

1. Configure build and packaging
2. Create installer
3. Test across different environments
4. Prepare documentation

## Technical Architecture

```
┌────────────────────────────────────┐
│           Tauri Desktop App        │
├──────────────────┬─────────────────┤
│                  │                 │
│   Next.js UI     │  Rust Backend   │
│  (React, etc.)   │   (Tauri API)   │
│                  │                 │
└──────────────────┴─────────────────┘
           │                │
           │                │
           ▼                ▼
┌──────────────────┐ ┌─────────────────┐
│   MongoDB API    │ │  Local Storage  │
│(Existing Server) │ │  (Task Cache)   │
└──────────────────┘ └─────────────────┘
```

## Benefits

1. Seamless desktop experience
2. Better performance than web or Electron
3. Works offline with data synchronization
4. Maintains existing UI and API connections
5. Native OS integration
6. Smaller app size
7. Enhanced security

## Next Steps

This will be documented in the task tracking system. A proof-of-concept will be created to validate the approach before full implementation.