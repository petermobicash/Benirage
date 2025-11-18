# CSP Supabase URL Fix - Deployment Guide

## Problem
The Content Security Policy (CSP) on the deployed Netlify site is blocking requests to the correct Supabase URL (`https://sshguczouozvsdwzfcbx.supabase.co`) because it's configured to only allow the old URL (`https://fjhqjsbnumcxkbirlrxj.supabase.co`).

## Error Message
```
Content-Security-Policy: The page's settings blocked the loading of a resource (connect-src) at https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/rpc/get_stories_by_media_type because it violates the following directive: "connect-src 'self' https://fjhqjsbnumcxkbirlrxj.supabase.co wss://fjhqjsbnumcxkbirlrxj.supabase.co"
```

## Solution Applied

### Files Updated
1. **`public/_headers`** - Removed old Supabase URLs, kept only the correct one
2. **`netlify.toml`** - Added CSP header with correct Supabase URL

### Changes Made

#### 1. Updated `public/_headers` (Line 9)
**Before:**
```
Content-Security-Policy: ... connect-src 'self' https://sshguczouozvsdwzfcbx.supabase.co wss://sshguczouozvsdwzfcbx.supabase.co https://fjhqjsbnumcxkbirlrxj.supabase.co wss://fjhqjsbnumcxkbirlrxj.supabase.co https://dummy.supabase.co; ...
```

**After:**
```
Content-Security-Policy: ... connect-src 'self' https://sshguczouozvsdwzfcbx.supabase.co wss://sshguczouozvsdwzfcbx.supabase.co; ...
```

#### 2. Updated `netlify.toml` (Added CSP to headers section)
Added the CSP header to the `[[headers]]` section for `/*` to ensure it's properly applied.

## Deployment Steps

### Option 1: Git Push (Recommended)
```bash
# Commit the changes
git add public/_headers netlify.toml
git commit -m "fix: Update CSP to allow correct Supabase URL"

# Push to trigger Netlify deployment
git push origin main
```

### Option 2: Manual Netlify Deploy
1. Go to your Netlify dashboard
2. Navigate to **Deploys** tab
3. Click **Trigger deploy** → **Deploy site**
4. Wait for deployment to complete

### Option 3: Netlify CLI
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

## Verification Steps

After deployment:

1. **Clear Browser Cache**
   - Chrome: `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
   - Select "Cached images and files"
   - Click "Clear data"

2. **Hard Refresh the Page**
   - Chrome: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)

3. **Check Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Refresh the page
   - Verify no CSP errors appear

4. **Test Supabase Connection**
   - Navigate to `/stories` page
   - Check if stories load correctly
   - Verify no network errors in Network tab

## Expected Result

After deployment and cache clearing:
- ✅ No CSP errors in console
- ✅ Supabase API calls succeed
- ✅ Stories and content load properly
- ✅ All features work as expected

## Troubleshooting

### If CSP errors persist:

1. **Check Netlify Environment Variables**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Verify `VITE_SUPABASE_URL` is set to: `https://sshguczouozvsdwzfcbx.supabase.co`
   - Verify `VITE_SUPABASE_ANON_KEY` is set correctly

2. **Check Build Logs**
   - Go to Netlify Dashboard → Deploys → Latest Deploy
   - Check build logs for any errors
   - Verify the build completed successfully

3. **Verify Headers are Applied**
   - Open deployed site
   - Open Developer Tools → Network tab
   - Refresh page
   - Click on the main document request
   - Check Response Headers for `Content-Security-Policy`
   - Verify it includes `https://sshguczouozvsdwzfcbx.supabase.co`

4. **Force Clear Netlify CDN Cache**
   ```bash
   # Using Netlify CLI
   netlify api clearCache --site-id YOUR_SITE_ID
   ```

### If still not working:

1. Check if there's a `_headers` file in the `dist` folder after build
2. Verify the build process copies `public/_headers` to `dist/_headers`
3. Check Netlify deploy logs to ensure headers file is recognized

## Additional Notes

- The CSP now only allows the current Supabase project URL
- Old URLs have been removed to prevent confusion
- Both `_headers` and `netlify.toml` are configured for redundancy
- Changes will take effect immediately after deployment and cache clearing

## Support

If issues persist after following all steps:
1. Check Netlify support documentation
2. Verify Supabase project is active and accessible
3. Review browser console for specific error messages
4. Contact Netlify support if headers aren't being applied