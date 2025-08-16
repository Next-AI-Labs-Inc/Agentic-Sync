# Tauri Integration Guide for IX Projects

## Overview

This document details the standards and practices for building desktop applications with Tauri in the IX ecosystem. Tauri provides a lightweight alternative to Electron, enabling the creation of efficient desktop applications using web technologies.

## Why Tauri?

- **Performance**: Uses the system's native WebView instead of bundling Chromium
- **Efficiency**: Dramatically smaller binaries (3-10MB vs 100MB+ for Electron)
- **Security**: More secure architecture with fine-grained permissions
- **Native Features**: Rich access to OS capabilities via Rust backend
- **Cross-Platform**: Works across macOS, Windows, and Linux
- **Auto-Updates**: Built-in update system for application maintenance

## Prerequisites

### Development Environment Setup

1. **Install Rust and Cargo**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Platform-Specific Dependencies**:
   - **macOS**:
     ```bash
     xcode-select --install
     ```
   - **Windows**:
     ```
     # Install Visual Studio build tools with C++ development components
     # and Windows 10/11 SDK
     ```
   - **Linux**:
     ```bash
     # Debian/Ubuntu
     sudo apt update
     sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
     ```

3. **Install Tauri CLI**:
   ```bash
   npm install -g @tauri-apps/cli
   ```

## Project Configuration

### Next.js Configuration

The `next.config.js` file should include Tauri-specific optimizations:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing Next.js configuration...
  
  // Use environment variable to determine if we're in Tauri build mode
  ...(process.env.TAURI_BUILD === 'true'
    ? {
        output: 'export', // Static export for Tauri
        distDir: 'out', // Output directory for Tauri
        images: {
          unoptimized: true, // Required for static export
        }
      }
    : {
        // For development with API routes
        images: {
          domains: ['localhost'],
        }
      }
  )
};

module.exports = nextConfig;
```

### Tauri Configuration

The `tauri.conf.json` file in the `src-tauri` directory controls the Tauri application settings:

```json
{
  "build": {
    "beforeDevCommand": "npm run build",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:3020",
    "distDir": "../out",
    "withGlobalTauri": true
  },
  "package": {
    "productName": "IX Agent Sync",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": true
    },
    "bundle": {
      "active": true,
      "category": "DeveloperTool",
      "copyright": "© 2025 Next AI Labs Inc.",
      "identifier": "com.nextailabs.ixagentsync",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 800,
        "resizable": true,
        "title": "IX Agent Sync",
        "width": 1200
      }
    ]
  }
}
```

### Cargo Configuration

The `Cargo.toml` file in the `src-tauri` directory defines the Rust dependencies:

```toml
[package]
name = "tasks"
version = "0.1.0"
description = "Tasks application"
authors = ["IX Team"]
license = ""
repository = ""
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
tauri = { version = "1.5", features = ["api-all"] }

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

## Application Icons

Icons must be properly formatted for each platform:

1. **Source Icon**: Create a high-resolution source image (at least 1024x1024 pixels) in `icons/logo_src.png`

2. **Required Icon Files**:
   - `32x32.png`: Small icon for Windows
   - `128x128.png`: Regular icon for macOS/Linux
   - `128x128@2x.png`: High-DPI icon (256x256)
   - `icon.icns`: macOS icon bundle
   - `icon.ico`: Windows icon bundle

3. **Icon Generation Script**: Use the provided script to generate all required formats from the source image:
   ```bash
   npm run convert-icons-properly
   ```

## NPM Scripts

Add these standard scripts to your `package.json`:

```json
{
  "scripts": {
    "tauri": "cd src-tauri && tauri",
    "tauri:dev": "cd src-tauri && tauri dev",
    "tauri:build": "npm run convert-icons-properly && TAURI_BUILD=true npm run build && cd src-tauri && TAURI_BUILD=true tauri build",
    "build:app": "node scripts/build-tauri-app.js",
    "install:app": "open src-tauri/target/release/bundle/dmg/IX\\ Agent\\ Sync_0.1.0_aarch64.dmg",
    "deploy:app": "npm run build:app && npm run install:app",
    "convert-icons-properly": "node scripts/convert-icons-properly.js"
  }
}
```

## Build Process

### Development Workflow

1. **Run in Development Mode** (with hot-reload):
   ```bash
   npm run tauri:dev
   ```

2. **Build for Production**:
   ```bash
   npm run build:app
   ```

3. **Install Built Application** (macOS):
   ```bash
   npm run install:app
   ```

### Build Script

The build process is managed by the `scripts/build-tauri-app.js` file, which:

1. Converts the source icon to all required formats
2. Builds the Next.js application with static export settings
3. Builds the Tauri desktop application
4. Locates the built application for installation

## Implementation Strategy

### Phase 1: Setup & Proof of Concept

1. Create a feature branch
2. Set up the Tauri configuration files
3. Create a minimal Rust backend
4. Build a proof-of-concept to validate the approach

### Phase 2: Core Application Integration

1. Configure Tauri to use the existing UI
2. Create backend commands for API operations
3. Modify React components to use Tauri commands
4. Implement authentication and session management

### Phase 3: Native Desktop Experience

1. Add offline capabilities with local caching
2. Configure automatic updates
3. Implement system tray integration
4. Add native notifications

### Phase 4: Distribution

1. Configure platform-specific packaging
2. Create installers for each platform
3. Test across different environments
4. Prepare user documentation

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

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Ensure Rust and platform-specific dependencies are installed
   - Check that Next.js builds successfully with `TAURI_BUILD=true`
   - Verify icon files are correctly generated

2. **Missing Icons**:
   - If `iconutil` or ImageMagick are not available, the fallback method may produce lower-quality icons
   - Ensure the source icon has sufficient resolution (1024x1024 recommended)

3. **Permission Issues**:
   - By default, Tauri uses a restrictive permissions model
   - Configure `allowlist` in `tauri.conf.json` to only enable necessary permissions

### Debugging

1. **Development Logging**:
   - Rust backend logs appear in the terminal running `npm run tauri:dev`
   - Frontend logs appear in the WebView's developer tools

2. **Inspecting WebView**:
   - Right-click and select "Inspect Element" in development mode
   - Use `tauri::window` API to programmatically open DevTools

## References

- [Tauri Official Documentation](https://tauri.app/)
- [Next.js Static Export Guide](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [Rust Crate Documentation](https://docs.rs/tauri/)