# 📊 GitHub Stats

> View GitHub contribution statistics

Part of the [zOS Apps](https://github.com/zos-apps) ecosystem.

## Installation

```bash
npm install github:zos-apps/github-stats
```

## Usage

```tsx
import App from '@zos-apps/github-stats';

function MyApp() {
  return <App />;
}
```

## Package Spec

App metadata is defined in `package.json` under the `zos` field:

```json
{
  "zos": {
    "id": "ai.hanzo.githubstats",
    "name": "GitHub Stats",
    "icon": "📊",
    "category": "developer",
    "permissions": ["network"],
    "installable": true
  }
}
```

## Version

v4.2.0

## License

MIT © Hanzo AI
