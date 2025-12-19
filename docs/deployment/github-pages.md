# Deploy to GitHub Pages

This project uses **Vite** for building and **GitHub Actions** for deployment.

## Quick Start

1. **Push to Main**: Simply push your changes to the `main` branch.
2. **Wait for Action**: A GitHub Action will automatically build the project and deploy it to GitHub Pages.
3. **Visit Site**: Your site will be live at `https://<username>.github.io/Sudoku-Labs/`.

## Setup (One-Time)

If this is your first time deploying, ensure your repository settings are correct:

1. Go to your repository on GitHub.
2. Click **Settings** → **Pages** (left sidebar).
3. Under "Build and deployment":
   - **Source**: Select **GitHub Actions**.
4. That's it! The workflow file `.github/workflows/deploy.yml` handles the rest.

## Configuration

### Base Path
The project is configured to run on a subdirectory (e.g., `/Sudoku-Labs/`). This is handled in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load correctly with relative paths
})
```

### Environment Variables
If you need to inject secrets (like `GAS_URL`) during the build:
1. Go to **Settings** → **Secrets and variables** → **Actions**.
2. Add a new repository secret (e.g., `GAS_URL`).
3. Update `.github/workflows/deploy.yml` to use the secret if needed (though currently, config is loaded from `public/config/`).

## Troubleshooting

### 404 on Assets
If assets are failing to load:
- Ensure `vite.config.js` has `base: './'` or the correct absolute path.
- Check that the `dist/` folder structure in the artifact matches what you expect.

### Build Failures
Check the "Actions" tab in your repository to see the build logs. Common issues:
- **Linting errors**: The build process may fail if there are syntax errors.
- **Missing dependencies**: Ensure `package.json` includes all required packages.
