# PROlitics

A workspace for the PROlitics application.

## Folder structure

- `src/` - Application source code
- `public/` - Static assets served by the app
- `tests/` - Automated tests
- `docs/` - Project documentation and decisions
- `.github/` - GitHub configuration and Actions workflows

## Documentatie

De documentatie is per functie en onderwerp opgesplitst. Begin bij [docs/documentation.md](docs/documentation.md) voor de inhoudsopgave.

## Lokaal testen

Vereisten: Node.js LTS en npm. Voer in PowerShell uit:

```powershell
cd C:\Users\joric\Documents\PROlitics
npm.cmd install
npm.cmd run dev
```

Open daarna `http://localhost:5173` in de browser.

Controleer de TypeScript-code en maak een productiebuild met:

```powershell
npm.cmd run build
```

Bekijk de productiebuild lokaal met:

```powershell
npm.cmd run preview
```

Open dan `http://localhost:4173`. Er is momenteel geen apart testframework geconfigureerd; `npm.cmd run build` is de geautomatiseerde compileer- en buildcontrole.

## GitHub workflow


   ```powershell
   git branch -M main
   git push -u origin main
   ```

For later changes, use VS Code's Source Control view to stage, commit, and sync changes.
