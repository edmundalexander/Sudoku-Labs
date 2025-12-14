# Deployment Guide

Complete deployment guide for Sudoku Logic Lab. For the detailed checklist, see [DEPLOYMENT_CHECKLIST.md](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/DEPLOYMENT_CHECKLIST.md).

## Overview

Deploying Sudoku Logic Lab involves two main parts:
1. **Backend**: Google Apps Script Web App
2. **Frontend**: GitHub Pages (or other static hosting)

**Total Time**: 20-30 minutes for first deployment

## Prerequisites

- Google account
- GitHub account  
- Git installed
- Basic command line knowledge

## Deployment Workflow

```
1. Deploy Backend (Google Apps Script)
         ↓
2. Get Deployment URL
         ↓
3. Configure Frontend (config.local.js)
         ↓
4. Deploy Frontend (GitHub Pages)
         ↓
5. Test Everything
         ↓
6. You're Live! 🎉
```

## Part 1: Backend Deployment

### Quick Backend Setup

See [Backend Setup](Backend-Setup) for detailed instructions. Quick version:

1. **Create Google Sheet**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create new sheet
   - Copy the Sheet ID from URL

2. **Create Apps Script Project**
   - Go to [script.google.com](https://script.google.com)
   - New project
   - Paste code from `apps_script/Code.gs`
   - Update Sheet ID in code (line 15)

3. **Initialize Database**
   - Select `setupSheets_` function
   - Click Run
   - Authorize when prompted

4. **Deploy as Web App**
   - Deploy → New Deployment
   - Type: Web App
   - Execute as: Me
   - Who has access: **Anyone** ⚠️ Critical!
   - Click Deploy
   - Copy deployment URL

5. **Test Backend**
   ```bash
   curl "https://script.google.com/macros/s/YOUR_ID/exec?action=ping"
   # Should return: {"ok":true,"timestamp":"..."}
   ```

**Expected Result**: Working API at `https://script.google.com/macros/s/.../exec`

## Part 2: Frontend Deployment

### Option A: GitHub Pages (Recommended)

See [Frontend Setup](Frontend-Setup) for detailed instructions. Quick version:

1. **Configure Backend URL**
   ```bash
   cp config/config.example.js config/config.local.js
   # Edit config.local.js with your GAS URL
   ```

2. **Commit to Repository**
   ```bash
   git add .
   git commit -m "Configure production deployment"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Repository Settings → Pages
   - Source: main branch, / (root)
   - Save

4. **Wait for Deployment**
   - Check Actions tab for build progress
   - Usually 1-2 minutes

5. **Access Your Site**
   - `https://[username].github.io/[repo]/`
   - Test all features

### Option B: Other Static Hosts

**Netlify:**
1. Connect GitHub repository
2. Build command: (leave empty)
3. Publish directory: `.`
4. Deploy

**Vercel:**
1. Import repository
2. Framework: Other
3. Build command: (leave empty)
4. Output directory: `.`
5. Deploy

**Self-Hosted:**
Upload files to any web server via FTP, rsync, or Git.

## Verification Checklist

After deployment, verify everything works:

### Backend Checks
- [ ] API responds to ping
- [ ] Puzzle generation works
- [ ] Leaderboard retrieves data
- [ ] Chat retrieves messages
- [ ] Score saving works
- [ ] Chat posting works

### Frontend Checks
- [ ] Site loads without errors
- [ ] Puzzle generates correctly
- [ ] Timer starts and runs
- [ ] Move counter increments
- [ ] Solution validates
- [ ] Leaderboard displays
- [ ] Chat works
- [ ] Mobile responsive

### Test Commands

```bash
# Set your deployment URL
export GAS_URL="https://script.google.com/macros/s/YOUR_ID/exec"

# Test all endpoints
curl "$GAS_URL?action=ping"
curl "$GAS_URL?action=generateSudoku&difficulty=Easy"
curl "$GAS_URL?action=getLeaderboard"
curl "$GAS_URL?action=getChat"

# Or use diagnostic script
./diagnostic.sh
```

## Configuration Management

### Production Config

For production, your `config/config.local.js` should contain:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/PRODUCTION_ID/exec',
};
```

### Environment Separation

**Development:**
```javascript
// config/config.dev.js
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/DEV_ID/exec',
  DEBUG: true,
};
```

**Production:**
```javascript
// config/config.prod.js
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/PROD_ID/exec',
  DEBUG: false,
};
```

Switch by changing which file `index.html` loads.

## Updating After Initial Deployment

### Updating Backend

When you modify `apps_script/Code.gs`:

1. Copy updated code
2. Paste into Apps Script editor
3. Save (Ctrl+S)
4. Deploy → Manage Deployments
5. Click edit icon (✏️)
6. Click **Update** (URL stays same)

**Alternative: New Deployment**
- Deploy → New Deployment
- Get new URL
- Update `config/config.local.js`
- Push frontend update

### Updating Frontend

When you modify `index.html` or `src/app.jsx`:

1. Make changes locally
2. Test locally
3. Commit:
   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```
4. Wait for GitHub Pages to rebuild (~1-2 min)
5. Hard refresh browser to see changes

## Deployment Best Practices

### Do's ✅

- **Test locally first**
- **Use version control** (Git)
- **Keep config files gitignored**
- **Document your changes**
- **Test after each deployment**
- **Keep backups** of Google Sheet data
- **Monitor for errors** (check Logs sheet)

### Don'ts ❌

- **Don't commit sensitive data**
- **Don't skip testing**
- **Don't deploy broken code**
- **Don't forget to update documentation**
- **Don't delete old deployments immediately** (keep as backup)

## Rollback Procedure

If something goes wrong:

### Backend Rollback

1. Apps Script → Deploy → Manage Deployments
2. Find previous working version
3. Click "⋮" → Make this the active deployment
4. Or redeploy previous code

### Frontend Rollback

```bash
# Find last working commit
git log --oneline

# Revert to that commit
git revert [commit-hash]

# Or reset (careful!)
git reset --hard [commit-hash]

# Push
git push origin main
```

## Monitoring

### Check Deployment Status

**GitHub Pages:**
- Repository → Actions tab
- Look for "pages-build-deployment"
- Green = success, Red = failure

**Apps Script:**
- Apps Script editor → Executions (left sidebar)
- View execution logs
- Check for errors

### Monitor Usage

**Apps Script Quotas:**
- Apps Script editor → Project Settings
- View quota usage
- Limits: 20,000 URL fetches/day

**Google Sheets:**
- Open your database sheet
- Check row counts
- Limit: ~10,000 rows per sheet

## Troubleshooting Deployment

### Backend Won't Deploy

**Check:**
- No syntax errors in Code.gs
- Sheet ID is correct
- Have permission to Sheet
- "Anyone" access selected

**Solutions:**
- Check Apps Script console for errors
- Try new deployment (not update)
- Verify Sheet exists and is accessible

### Frontend Won't Deploy

**Check:**
- GitHub Pages enabled
- Correct branch selected (main)
- Folder set to / (root)
- No build errors in Actions

**Solutions:**
- Check Actions tab for errors
- Verify repository is public (for free Pages)
- Try disabling and re-enabling Pages

### API Returning 302 Redirects

**Cause:** Deployment access not set to "Anyone"

**Solution:**
- Deploy → Manage Deployments
- Edit deployment
- Change to "Anyone" access
- Update

See [Troubleshooting](Troubleshooting) for more issues.

## Security Considerations

### Backend Security
- Input sanitization enabled (built-in)
- No authentication (by design - public game)
- Rate limiting via GAS quotas
- Monitor Logs sheet for abuse

### Frontend Security
- HTTPS only (GitHub Pages provides free SSL)
- No sensitive data in code
- Config files gitignored
- XSS protection via sanitization

### Data Privacy
- No personal information collected
- Anonymous play
- Names are user-provided (not verified)
- Chat messages are public

## Performance Optimization

### Backend Optimization
- Keep Sheet row counts manageable
- Archive old data periodically
- Use caching for frequent queries
- Optimize query complexity

### Frontend Optimization
- CDN-hosted dependencies
- Minimal JavaScript
- Lazy loading (if needed)
- Image optimization

See [Performance Optimization](Performance-Optimization) for details.

## Custom Domain (Optional)

### Setup Custom Domain

1. Buy domain (Namecheap, Google Domains, etc.)
2. In GitHub repo: Settings → Pages
3. Add custom domain
4. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   
   Type: CNAME
   Name: www
   Value: username.github.io
   ```
5. Wait for DNS propagation (up to 48 hours)
6. Enable "Enforce HTTPS" in Pages settings

## Scaling Considerations

### Current Capacity

With default setup:
- **~1,000 daily active users**
- **~20,000 API calls/day** (GAS limit)
- **~10,000 leaderboard entries** (Sheet limit)

### Scaling Solutions

If you exceed limits:
1. **Multiple Sheets**: Partition data by month/year
2. **Pagination**: Limit leaderboard to top 100
3. **Caching**: Cache leaderboard client-side
4. **Archive**: Move old data to separate sheets
5. **Upgrade**: Use Google Cloud for higher quotas

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs (Logs sheet)
- Monitor quota usage
- Test all features

**Monthly:**
- Review leaderboard data
- Archive old chat messages
- Check for updates/security patches
- Update documentation if needed

**Per Release:**
- Test in staging first (if you have it)
- Update changelog
- Notify users of downtime (if any)
- Monitor for issues after deployment

## Getting Help

- **Documentation**: [Full Deployment Checklist](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/DEPLOYMENT_CHECKLIST.md)
- **Backend Setup**: [Backend Setup Guide](Backend-Setup)
- **Frontend Setup**: [Frontend Setup Guide](Frontend-Setup)
- **Troubleshooting**: [Troubleshooting Guide](Troubleshooting)
- **Issues**: [GitHub Issues](https://github.com/edmund-alexander/Sudoku-Labs/issues)

---

**Deployment complete! 🚀**

Your Sudoku Logic Lab is now live and ready for players!
