# Contributing to Replai Assistant

Welcome to the Replai Assistant team! This document serves as a guide for developers working on this project.

## 🛠️ Development Setup

1.  **Prerequisites**:

    - Node.js (v20 or newer recommended)
    - Git

2.  **Initial Setup**:

    ```bash
    git clone <repository_url>
    cd replai
    npm install
    ```

3.  **Local Development**:

    - **Chrome**: Run `npm run dev` to start the extension in Chrome.
    - **Firefox**: Run `npm run dev:firefox` to start in Firefox.
    - **Console Logs**: In the opened browser window, access the Extension management page -> Inspect background script to see logs.

4.  **API Key**:
    - The project requires a Gemini API Key.
    - In dev mode, click the extension icon and enter your key in the popup settings.

## 📂 Project Structure

- `components/`: Reusable UI components (React).
  - `post-trigger.tsx`: The main "Sparkle" button and Assistant popover.
  - `post-context.tsx`: State management for the current active post.
- `entrypoints/`: WXT specific entry points.
  - `background.ts`: The mesh that handles API calls and system prompts (Centralized Logic).
  - `content.tsx`: The script injected into Facebook/Social pages.
  - `popup/`: The extension settings popup.
- `hooks/`: Custom hooks like `useGemini` for data fetching.
- `types/`: Shared TypeScript interfaces.

## 👥 Branching & Workflow

We follow a standard Feature-Branch workflow:

1.  **Sync**: Always pull the latest `main` before starting.
2.  **Branch**: Create a new branch for your task.
    - Features: `feature/your-feature-name` (e.g., `feature/add-dark-mode`)
    - Fixes: `fix/bug-description` (e.g., `fix/ui-overflow`)
3.  **Commit**: Keep commits small and focused.
4.  **Pull Request**: Push your branch and open a PR into `main`.

## 🚢 CI/CD & Release Strategy

We use GitHub Actions for storage and delivery.

1.  **Continuous Integration (CI)**:

    - Runs on every **Push** and **PR**.
    - Checks: Typescript compilation (`npm run compile`).
    - _Action: Fix any type errors before merging._

2.  **Continuous Deployment (CD)**:
    - Triggered **ONLY** by Tags.
    - **How to Release**:
      1.  Make sure `package.json` version is updated.
      2.  Run: `git tag v1.0.0` (replace with actual version).
      3.  Run: `git push origin v1.0.0`.
    - **Result**: GitHub Action builds the `.zip` files for Chrome and Firefox and attaches them to a new GitHub Release.

## 🧩 Adding New Features

- **New AI Task**:
  1.  Define the TaskType in `types/index.ts`.
  2.  Add the system prompt in `entrypoints/background.ts`.
  3.  Call `sendMessage` with the new taskId from the UI.
- **New UI Component**:
  - Place in `components/`.
  - Use Tailwind CSS for styling.
  - Ensure it supports Shadcn UI patterns structure if applicable.

## 🐛 Troubleshooting

- **"Extension context invalidated"**: This happens when the extension reloads while you are on a webpage. Refresh the webpage to reconnect the content script.
- **Style Issues**: If Tailwind classes aren't applying, check `wxt.config.ts` and ensure the Shadow DOM injection is correct (we use `shadow-dom-provider.tsx`).
