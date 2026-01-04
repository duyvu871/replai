# Replai Assistant 🚀

Replai Assistant is a powerful, AI-driven browser extension designed to enhance your social media interactions. Built with **WXT**, **React**, **Tailwind CSS**, and **Google Gemini AI**, it provides instant AI-powered replies, summaries, and professional translations directly within your social media posts.

## ✨ Features

- **🤖 Smart AI Replies**: Generate context-aware replies with customizable tones (Polite, Funny, Professional, etc.).
- **📝 Post Summarization**: Instantly condense long posts into concise Vietnamese summaries.
- **🌐 Advanced Multi-language Translation**:
  - Supports **Vietnamese, English, Japanese, Korean, Chinese, and French**.
  - **Context-Aware API**: Preserves original tone and handles technical/slang terms naturally.
- **🧠 Intelligent Caching**: Uses `PostContext` to cache post content and AI responses, saving tokens and improving performance.
- **⚡ Professional UI/UX**:
  - High-density, compact design for seamless integration.
  - ChatGPT-style **Typewriter effect** for AI responses.
  - **Markdown support** for rich-text rendering of summaries and replies.
  - Smooth loading skeletons and micro-animations.

## 🛠️ Technology Stack

- **Framework**: [WXT](https://wxt.dev/) (Web Extension Toolbox)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **AI Model**: Google Gemini (gemini-2.0-flash / gemini-2.5-flash)
- **State Management**: React Context API
- **Utilities**: Lucide Icons, React Markdown, Sharp (for icon generation)

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (Latest LTS)
- NPM or PNPM
- A Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/duyvu871/replai
cd replai
npm install
```

### 3. Development

Run the extension in development mode (auto-reloads on changes):

```bash
npm run dev
```

### 4. Build

Compile the extension for production:

```bash
npm run build
```

The output will be in the `.output/` directory, ready to be loaded as an "unpacked extension" in your browser.

## ⚙️ Configuration

1. After installing/running the extension, click the extension icon in your browser toolbar.
2. Enter your **Gemini API Key** in the settings popup.
3. Click **Save Config**.
4. Go to a social media platform (e.g., Facebook) and look for the **Sparkles icon** ✨ near posts to start using Replai!

## 📜 Project Structure

- `components/`: Core UI components (PostTrigger, Typewriter, etc.)
- `entrypoints/`: Extension entry points (Background, Content Script, Popup)
- `assets/`: Icons and global styles
- `hooks/`: Custom React hooks (useGemini, etc.)
- `lib/`: Utility logic and API services
- `public/`: Static assets for the extension manifest

## 📄 License

This project is for demonstration and personal use. All rights reserved.
