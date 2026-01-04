---
description: Setup and maintain CI/CD pipeline for the extension
---

# CI/CD Workflow for Replai Assistant

This workflow defines how to setup and maintain the Continuous Integration and Continuous Deployment pipeline using GitHub Actions.

## 1. Overview

The pipeline handles:

- **Continuous Integration (CI)**: Runs on every push and pull request to ensure code quality.
  - Type Checking (`npm run compile`)
- **Continuous Deployment (CD)**: Runs when a new tag is pushed (e.g., `v1.0.0`).
  - Build Chrome Extension (`npm run zip`)
  - Build Firefox Extension (`npm run zip:firefox`)
  - Create GitHub Release
  - Upload artifacts (`.zip` files) to the release

## 2. Triggering a Release

To trigger a new release and build:

1. Update the version in `package.json` (optional but recommended).
2. Create and push a tag:
   ```bash
   git tag v0.0.1
   git push origin v0.0.1
   ```
   _Replace `v0.0.1` with your desired version._

## 3. Configuration

The workflow configuration is located in `.github/workflows/cicd.yml`.

### Key Steps in YAML:

- **Checkout code**: Uses `actions/checkout`.
- **Setup Node**: Uses `actions/setup-node`.
- **Install Dependencies**: `npm ci` (preferred over `npm install` for CI).
- **Type Check**: `npm run compile`.
- **Build & Zip**:
  - Chrome: `npm run zip` -> Outputs to `.output/wxt-react-starter-*.zip` (default name, check wxt config).
  - Firefox: `npm run zip:firefox` -> Outputs to `.output/wxt-react-starter-*-firefox.zip`.
- **Release**: Uses `softprops/action-gh-release` to create the release and upload assets.

## 4. Troubleshooting

- If builds fail due to missing secrets (e.g., API keys), ensure strict validation is disabled or secrets are provided if WXT requires them (usually WXT is fine without secrets for basic builds).
- Check the "Actions" tab in GitHub repository for logs.
