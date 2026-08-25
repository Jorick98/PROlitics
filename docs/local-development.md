# Lokaal ontwikkelen en testen

## Vereisten

- Node.js LTS;
- npm.

In PowerShell kan `npm.ps1` door de execution policy worden geblokkeerd. Gebruik dan `npm.cmd`.

## Development server

```powershell
cd C:\Users\joric\Documents\PROlitics
npm.cmd install
npm.cmd run dev
```

Open daarna `http://localhost:5173` in de browser.

## Productiebuild en TypeScript-check

```powershell
cd C:\Users\joric\Documents\PROlitics
npm.cmd run build
```

De build doet eerst TypeScript-controle en daarna Vite bundling.

## Productiebuild lokaal bekijken

```powershell
npm.cmd run preview
```

Open `http://localhost:4173`.

Er is momenteel geen apart testframework of `test`-script geconfigureerd. Gebruik daarom `npm.cmd run build` als geautomatiseerde compileer- en buildcontrole en controleer de kernflows handmatig in de development server.
