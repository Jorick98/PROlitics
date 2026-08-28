# PROlitics

A workspace for the PROlitics application.

## Folder structure

- `src/` - Application source code
- `public/` - Static assets served by the app
- `tests/` - Automated tests
- `docs/` - Project documentation and decisions
- `.github/` - GitHub configuration and Actions workflows

## Documentation

Documentation is organized by feature and topic. Start with [docs/documentation.md](docs/documentation.md) for the contents.

## Local development and testing

Requirements: Node.js LTS and npm. In PowerShell, run:

```powershell
cd C:\Users\joric\Documents\PROlitics
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173` in the browser. The process editor uses a two-area layout: a 24 px snap grid and a transition matrix view.

Run the TypeScript check and production build with:

```powershell
npm.cmd run build
```

Preview the production build locally with:

```powershell
npm.cmd run preview
```

Open `http://localhost:4173`. There is no separate test framework yet; `npm.cmd run build` is the automated compile and bundle check. Manual acceptance scenarios are documented in [docs/Testresults.md](docs/Testresults.md).

## GitHub workflow


   ```powershell
   git branch -M main
   git push -u origin main
   ```

For later changes, use VS Code's Source Control view to stage, commit, and sync changes.
