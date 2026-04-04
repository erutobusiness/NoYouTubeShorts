# No YouTube Shorts

YouTube Shortsをブロックするクロスブラウザ拡張機能。

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) (Cross-browser extension framework)
- **UI**: [Svelte 5](https://svelte.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: TypeScript
- **Linter/Formatter**: [Biome](https://biomejs.dev/)
- **Browsers**: Chrome / Firefox / Edge

## Features

- YouTube Shorts ページの自動リダイレクト
- ON/OFF 切り替え
- ブロック回数カウンター
- クロスブラウザ対応 (Manifest V3)

## Development

```bash
# Install dependencies
npm install

# Dev mode (Chrome)
npm run dev

# Dev mode (Firefox)
npm run dev:firefox

# Build (Chrome)
npm run build

# Build (Firefox)
npm run build:firefox

# Create ZIP for distribution
npm run zip
npm run zip:firefox

# Lint
npm run lint
npm run lint:fix
```

## Project Structure

```
entrypoints/
  background.ts     # Service worker - Shorts detection & redirect
  popup/
    index.html      # Popup entry
    main.ts         # Svelte mount
    App.svelte      # Popup UI
    style.css       # Tailwind imports & custom properties
components/
  Toggle.svelte     # Reusable toggle switch
utils/
  storage.ts        # WXT storage definitions
public/
  icon-*.png        # Extension icons
```
