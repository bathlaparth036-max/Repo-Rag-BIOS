# Chrome Extension (Manifest V3)

## Architecture
- **`manifest.json`**: Declares `sidePanel`, `activeTab`, `scripting`, and host permissions for `github.com` and `127.0.0.1:8000`.
- **`background.js`**: Background service worker handling extension clicks and side panel behavior.
- **`content.js`**: Injects the floating `< ◉ > Analyze with RepoRAG` action button onto GitHub repository pages.
- **`sidepanel.html`**: Chrome Side Panel API integration providing instant codebase intelligence alongside repository files.
