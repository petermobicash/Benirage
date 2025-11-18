# CSP Fix Deployment Instructions

## Why You're Still Seeing the Error
The CSP fix has been successfully pushed to GitHub, but your live website hasn't been redeployed yet with the updated code. The error you're seeing is from the currently deployed version that still has the old CSP configuration.

## Deploy the Fix to Production

### Option 1: Trigger Automatic Deployment (Netlify)
If you have Netlify auto-deployment set up:

1. **Commit Triggered Deployment**: Since we pushed to the `main` branch, Netlify should automatically deploy the changes
2. **Check Netlify Dashboard**: Go to your Netlify dashboard → Deploys tab
3. **Manual Trigger**: If auto-deployment isn't working, click "Trigger deploy" in Netlify

### Option 2: Manual Build and Deploy
If you need to manually build and deploy:

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Build for production
npm run build:production

# 3. Deploy the dist/ folder to your hosting platform
# (Netlify, Vercel, or your preferred hosting)
```

### Option 3: Netlify CLI Deployment
If you have Netlify CLI installed:

```bash
# 1. Build the project
npm run build:production

# 2. Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Option 4: Alternative Hosting Solutions
If using other platforms:

**Vercel**:
```bash
npm run build:production
vercel --prod
```

**GitHub Pages**:
```bash
npm run build:production
# Push dist/ folder contents to gh-pages branch
```

## Verification Steps
After deployment, verify the fix by:

1. **Clear Browser Cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
2. **Check Network Tab**: Open browser DevTools → Network tab
3. **Test Supabase Request**: The XHR request to `https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/content?select=id&slug=eq.about-page` should now succeed
4. **Verify CSP Headers**: Check response headers for the correct CSP policy

## Expected Result
Once deployed, you should no longer see this error:
```
Content-Security-Policy: The page's settings blocked the loading of a resource (connect-src) at https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/content?select=id&slug=eq.about-page because it violates the following directive: "connect-src 'self' https://fjhqjsbnumcxkbirlrxj.supabase.co wss://fjhqjsbnumcxkbirlrxj.supabase.co"
```

## Troubleshooting
If the issue persists after deployment:

1. **Cache Issues**: Ensure your browser cache is completely cleared
2. **CDN Cache**: If using CloudFlare or similar CDN, may need to purge cache
3. **Verify Headers**: Check that the deployed site has the updated CSP headers
4. **Build Verification**: Confirm the `dist/_headers` file in deployment has the correct URL

---
**Status**: 🟡 **AWAITING DEPLOYMENT** - Fix ready, needs to be deployed to production