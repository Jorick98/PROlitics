# Local development and testing

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

Open `http://localhost:5173` in the browser. The editor is designed for a viewport-sized workspace; use the Matrix view's internal scroll area for larger models.

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

There is currently no separate test framework or `test` script. Use `npm.cmd run build` as the automated TypeScript and bundle check, then manually test close/open selection, grid snapping, drag/drop placement, route creation/deletion, failure routing, matrix row totals, undo, and local reload persistence.
