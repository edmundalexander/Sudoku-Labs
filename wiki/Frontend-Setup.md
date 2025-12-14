# Frontend Setup Guide

Complete guide to deploying the Sudoku Logic Lab frontend on GitHub Pages.

## Overview

The frontend is a single-page React application that runs entirely in the browser. It's hosted on GitHub Pages for free.

**Time Required**: 5 minutes

## Prerequisites

- GitHub account
- Repository forked or cloned
- Backend deployed (see [Backend Setup](Backend-Setup))
- Git installed locally

## Deployment Options

### Option 1: GitHub Pages (Recommended)

Host your frontend on GitHub Pages for free.

### Option 2: Manual Hosting

Host on any static web server (Netlify, Vercel, your own server, etc.)

## GitHub Pages Deployment

### Step 1: Configure Backend URL

1. Create or edit `config/config.local.js`:
   ```bash
   cp config/config.example.js config/config.local.js
   ```

2. Add your backend URL:
   ```javascript
   const CONFIG = {
     GAS_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
   };
   ```

### Step 2: Commit Your Changes

```bash
# Stage all changes
git add .

# Commit
git commit -m "Configure backend URL for deployment"

# Push to your repository
git push origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

### Step 4: Wait for Deployment

GitHub Pages will build your site:
- Usually takes 1-2 minutes
- Watch the Actions tab for progress
- You'll see a green checkmark when done

### Step 5: Access Your Site

Your site will be available at:
```
https://[your-username].github.io/Sudoku-Labs/
```

For example:
```
https://edmund-alexander.github.io/Sudoku-Labs/
```

## Verification

### Test the Deployment

1. Visit your GitHub Pages URL
2. Open browser console (F12)
3. Check for errors
4. Try generating a puzzle
5. Check leaderboard loads
6. Test chat functionality

### Verification Checklist

- [ ] Site loads without errors
- [ ] Puzzle generates correctly
- [ ] Timer works
- [ ] Move counter works
- [ ] Leaderboard displays
- [ ] Chat works
- [ ] No console errors
- [ ] Mobile responsive

## Configuration

### Custom Domain (Optional)

To use a custom domain:

1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In repository **Settings** → **Pages**
3. Enter your custom domain
4. Configure DNS records:
   ```
   Type: CNAME
   Name: www
   Value: your-username.github.io
   ```
5. Wait for DNS propagation (up to 48 hours)

See [GitHub's custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

### HTTPS

GitHub Pages provides free HTTPS:
- Automatically enabled for `*.github.io` domains
- Available for custom domains after DNS verification
- Enforced HTTPS recommended (checkbox in Settings)

## File Structure

The frontend consists of:

```
Sudoku-Labs/
├── index.html           # Main HTML file (entry point)
├── src/
│   └── app.jsx         # React application code
├── config/
│   ├── config.example.js    # Template (public)
│   └── config.local.js      # Your config (gitignored)
├── favicon.svg         # Site icon
└── README.md          # Documentation
```

## How It Works

### In-Browser Compilation

The app uses **Babel Standalone** for in-browser JSX compilation:

```html
<!-- index.html -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" src="src/app.jsx"></script>
```

This means:
- ✅ No build step required
- ✅ Easy to modify and deploy
- ✅ Source code visible (it's open source anyway)
- ⚠️ Slightly slower initial load (usually negligible)

### Configuration Loading

The frontend loads configuration at runtime:

```html
<!-- Load config before app -->
<script src="config/config.local.js"></script>

<!-- Then app.jsx uses CONFIG global -->
<script type="text/babel" src="src/app.jsx"></script>
```

### React and Tailwind

- **React 18**: Loaded from CDN
- **Tailwind CSS**: Loaded from CDN with JIT mode
- **No npm/webpack**: Everything runs in browser

## Updating the Frontend

### Making Changes

1. Edit files locally:
   ```bash
   vim index.html
   # or
   vim src/app.jsx
   ```

2. Test locally:
   ```bash
   python -m http.server 8000
   # Open http://localhost:8000
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "Update frontend feature"
   git push origin main
   ```

4. GitHub Pages auto-deploys:
   - Usually takes 1-2 minutes
   - Watch Actions tab for status
   - Clear browser cache if needed

### Cache Busting

If changes don't appear:

1. **Hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear cache**: Browser settings → Clear browsing data
3. **Incognito mode**: Test in private/incognito window
4. **Wait**: Sometimes takes a few minutes for CDN to update

## Alternative Hosting

### Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - Build command: (leave empty)
   - Publish directory: `.` (root)
4. Deploy

**Advantages:**
- Faster deploys
- Better preview deployments
- Custom domain easier

### Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Import your repository
3. Configure:
   - Framework: Other
   - Build command: (leave empty)
   - Output directory: `.`
4. Deploy

**Advantages:**
- Very fast CDN
- Automatic HTTPS
- Great analytics

### Self-Hosting

Host on any web server:

```bash
# Example: nginx
server {
    listen 80;
    server_name sudoku.example.com;
    root /var/www/sudoku-labs;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Upload files via FTP, rsync, or Git.

## Environment Variables

Since there's no build step, we use runtime config:

### Development

Use `config/config.local.js` (gitignored):
```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/.../exec',
  DEBUG: true,
};
```

### Production

Option 1: Update `config.local.js` before deployment
Option 2: Use GitHub Actions to inject config during deploy
Option 3: Use different branches (dev/prod)

## Performance Optimization

### Current Performance

- ✅ Lightweight (~50KB total)
- ✅ CDN-hosted dependencies
- ✅ Minimal JavaScript
- ⚠️ In-browser Babel compilation adds ~100ms

### Future Optimizations

Consider pre-compiling for production:

1. **Add build step:**
   ```bash
   npm install --save-dev @babel/core @babel/cli @babel/preset-react
   ```

2. **Build script:**
   ```json
   "scripts": {
     "build": "babel src --out-dir dist"
   }
   ```

3. **Deploy `dist/` instead of `src/`**

This would eliminate runtime compilation overhead.

## Troubleshooting

### Site Not Loading

**Possible causes:**
- GitHub Pages not enabled
- Branch/folder misconfigured
- Deployment in progress
- Repository is private

**Solutions:**
1. Check Settings → Pages is configured
2. Verify branch is correct (usually `main`)
3. Wait 2-3 minutes for deployment
4. Make repository public for free GitHub Pages

### Config Not Found

**Symptom:** Console shows "CONFIG is not defined"

**Solution:**
- Create `config/config.local.js`
- Copy from `config/config.example.js`
- Ensure it's loaded before `app.jsx` in `index.html`

### 404 on Sub-Pages

**Cause:** Single-page app doesn't have real routes

**Solution:** This app doesn't use routing, so this shouldn't be an issue.

### CORS Errors

**Cause:** Backend not allowing cross-origin requests

**Solution:**
- Ensure backend deployed with "Anyone" access
- Google Apps Script allows CORS by default
- Check backend logs for errors

### Slow Initial Load

**Cause:** In-browser Babel compilation

**Solutions:**
- Consider pre-compilation (see Performance above)
- Use CDN caching
- Minimize `app.jsx` size

## Security Considerations

### config.local.js

- ✅ In `.gitignore` - not committed to repo
- ✅ Not included in GitHub Pages build (only `index.html` and `src/`)
- ⚠️ But GAS URL is not sensitive (it's a public API)

### HTTPS

- Always use HTTPS (free on GitHub Pages)
- Enforce HTTPS in GitHub Pages settings
- Redirect HTTP → HTTPS automatically

### Content Security Policy

Consider adding CSP headers:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline';">
```

Note: `unsafe-eval` needed for Babel, `unsafe-inline` for Tailwind.

## GitHub Actions (Advanced)

Automate deployment with GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

This is optional—GitHub Pages deploys automatically anyway.

## Monitoring

### GitHub Pages Status

Check deployment status:
1. Repository → **Actions** tab
2. Look for "pages build and deployment" workflows
3. Green checkmark = success
4. Red X = failure (click for logs)

### Analytics (Optional)

Add Google Analytics:

```html
<!-- In index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Next Steps

- **[Backend Setup](Backend-Setup)** - Set up the API
- **[Configuration](Configuration-Guide)** - Advanced config
- **[Troubleshooting](Troubleshooting)** - Fix common issues

---

**Frontend deployed! 🚀**

Visit your site and start playing!
