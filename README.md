# PROlitics

A workspace for the PROlitics application.

## Folder structure

- `src/` - Application source code
- `public/` - Static assets served by the app
- `tests/` - Automated tests
- `docs/` - Project documentation and decisions
- `.github/` - GitHub configuration and Actions workflows

## GitHub workflow

1. Create an empty repository named `PROlitics` on GitHub.
2. Open this folder in VS Code.
3. Add the GitHub repository as the remote:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/PROlitics.git
   ```

4. Push the initial commit:

   ```powershell
   git branch -M main
   git push -u origin main
   ```

For later changes, use VS Code's Source Control view to stage, commit, and sync changes.
