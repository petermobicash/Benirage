# CSP Fix Deployment Checklist

## ✅ Changes Made

The following files have been updated to fix the CSP Supabase URL issue:

1. **`public/_headers`** (Line 9)
   - ✅ Removed old Supabase URLs
   - ✅ Only allows: `https://sshguczouozvsdwzfcbx.supabase.co`

2. **`netlify.toml`** (Line 43)
   - ✅ Added CSP header configuration
   - ✅ Only allows: `https://sshguczouozvsdwzfcbx.supabase.co`

## 🚀 Deployment Steps

### Step 1: Commit Changes
```bash
git add public/_headers netlify.toml CSP_SUPABASE_FIX.md DEPLOY_CSP_FIX.md
git commit -m "fix: Update CSP to allow correct Supabase URL only"
git push origin main
```

### Step 2: Wait for Netlify Deployment
- Go to your Netlify dashboard
- Wait for the automatic deployment to complete (usually 2-5 minutes)
- Check the deploy logs for any errors

### Step 3: Clear Browser Cache
After deployment completes:

**Chrome/Edge:**
1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. Select "Cache"
3. Click "Clear Now"

### Step 4: Hard Refresh
- Chrome/Edge: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Step 5: Verify Fix
1. Open Developer Tools (F12)
2. Go to Console tab
3. Refresh the page
4. ✅ **Success**: No CSP errors appear
5. ✅ **Success**: Stories and content load properly
6. ✅ **Success**: No network errors in Network tab

## 🔍 What Was Fixed

### Before:
```
Content-Security-Policy: ... connect-src 'self' 
  https://fjhqjsbnumcxkbirlrxj.supabase.co  ❌ (old URL)
  wss://fjhqjsbnumcxkbirlrxj.supabase.co    ❌ (old URL)
```

### After:
```
Content-Security-Policy: ... connect-src 'self' 
  https://sshguczouozvsdwzfcbx.supabase.co  ✅ (correct URL)
  wss://sshguczouozvsdwzfcbx.supabase.co    ✅ (correct URL)
```

## 🐛 Troubleshooting

### If CSP errors persist after deployment:

1. **Verify deployment completed successfully**
   - Check Netlify deploy logs
   - Ensure no build errors occurred

2. **Force clear CDN cache**
   ```bash
   # Using Netlify CLI (if installed)
   netlify api clearCache --site-id YOUR_SITE_ID
   ```

3. **Check headers are applied**
   - Open DevTools → Network tab
   - Refresh page
   - Click on the main document request
   - Check Response Headers for `Content-Security-Policy`
   - Verify it includes `https://sshguczouozvsdwzfcbx.supabase.co`

4. **Try incognito/private browsing**
   - This ensures no cached data interferes

### If stories still don't load:

1. **Check Supabase environment variables in Netlify**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Verify `VITE_SUPABASE_URL` = `https://sshguczouozvsdwzfcbx.supabase.co`
   - Verify `VITE_SUPABASE_ANON_KEY` is set correctly

2. **Check Supabase project is active**
   - Log into Supabase dashboard
   - Verify project is running
   - Check API settings

## 📝 Notes

- The minified JavaScript you saw is normal production output
- The CSP fix is in the HTTP headers, not the JavaScript code
- Changes take effect immediately after deployment and cache clearing
- Both `_headers` and `netlify.toml` are configured for redundancy

## ✨ Expected Result

After successful deployment:
- ✅ No CSP errors in browser console
- ✅ Supabase API calls succeed
- ✅ Stories page loads content
- ✅ All features work normally

---

**Need Help?** Check the detailed guide in [`CSP_SUPABASE_FIX.md`](./CSP_SUPABASE_FIX.md)