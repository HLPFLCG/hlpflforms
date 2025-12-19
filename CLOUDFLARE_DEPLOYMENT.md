# HLPFL Forms - Cloudflare Pages Deployment Guide

## 🚀 Deployment Options

You have two options to deploy HLPFL Forms to Cloudflare Pages:

---

## Option 1: Deploy via Cloudflare Dashboard (Recommended - No CLI needed)

This is the easiest method and doesn't require any API tokens or CLI setup.

### Steps:

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Log in to your account

2. **Navigate to Pages**
   - Click on "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub Repository**
   - Select "GitHub" as your Git provider
   - Authorize Cloudflare to access your GitHub account
   - Select the repository: `HLPFLCG/hlpflforms`
   - Click "Begin setup"

4. **Configure Build Settings**
   - **Project name**: `hlpflforms` (or your preferred name)
   - **Production branch**: `main`
   - **Build command**: Leave empty (no build needed)
   - **Build output directory**: `public`
   - **Root directory**: `/` (leave as default)

5. **Environment Variables** (Optional for now)
   - You can add these later when setting up D1 database
   - For now, skip this step

6. **Deploy**
   - Click "Save and Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)
   - Your site will be live at: `https://hlpflforms.pages.dev`

7. **Custom Domain** (Optional)
   - After deployment, go to "Custom domains"
   - Add your custom domain if desired
   - Follow DNS configuration instructions

---

## Option 2: Deploy via Wrangler CLI

If you prefer using the command line:

### Prerequisites:
1. Cloudflare account
2. API token with Pages permissions

### Steps:

1. **Get Cloudflare API Token**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Or create custom token with these permissions:
     - Account > Cloudflare Pages > Edit
     - Account > Account Settings > Read
   - Copy the token

2. **Set Environment Variable**
   ```bash
   export CLOUDFLARE_API_TOKEN="your_token_here"
   ```

3. **Deploy**
   ```bash
   cd hlpflforms
   wrangler pages deploy public --project-name=hlpflforms
   ```

4. **Verify Deployment**
   - Visit the URL provided in the output
   - Should be: `https://hlpflforms.pages.dev`

---

## Post-Deployment Configuration

### 1. Set Up D1 Database (When Ready)

Currently, the app uses in-memory storage. To enable persistent storage:

1. **Create D1 Database**
   ```bash
   wrangler d1 create hlpflforms-db
   ```

2. **Update wrangler.toml**
   - Copy the database ID from the output
   - Update the `database_id` in `wrangler.toml`

3. **Run Migrations**
   ```bash
   wrangler d1 execute hlpflforms-db --file=schema.sql
   ```

4. **Redeploy**
   - Push changes to GitHub
   - Cloudflare Pages will auto-deploy

### 2. Configure Environment Variables

In Cloudflare Dashboard:
1. Go to your Pages project
2. Click "Settings" > "Environment variables"
3. Add these variables:
   - `SESSION_SECRET`: Your session secret (already in wrangler.toml)
   - Add any other secrets as needed

### 3. Set Up Custom Domain (Optional)

1. In Cloudflare Dashboard, go to your Pages project
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain (e.g., `forms.hlpfl.org`)
5. Follow DNS configuration instructions
6. Wait for SSL certificate to provision (automatic)

---

## Testing the Deployment

### 1. Basic Functionality Test
- Visit: `https://hlpflforms.pages.dev`
- Register a new account
- Create a test form
- Preview the form
- Save the form

### 2. Embedding Test on hlpfl.info

Create a test page on hlpfl.info:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Test - HLPFL</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #0a0a0a;
            color: #ffffff;
        }
        h1 {
            background: linear-gradient(135deg, #c87941 0%, #d4945c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    </style>
</head>
<body>
    <h1>Contact Us</h1>
    <p>Fill out the form below to get in touch with HLPFL.</p>
    
    <!-- Replace YOUR_FORM_ID with actual form ID from dashboard -->
    <script src="https://hlpflforms.pages.dev/embed.js" 
            data-form-id="YOUR_FORM_ID"
            data-theme="dark"></script>
    <div id="hlpfl-form-container"></div>
</body>
</html>
```

### 3. Analytics Test
- Submit a few test forms
- Check the analytics dashboard
- Verify charts and metrics display correctly
- Test export functionality

### 4. Profile Test
- Update profile information
- Upload an avatar
- Change password
- Generate API key
- Verify all features work

---

## Troubleshooting

### Issue: White Screen / 404 Errors
**Solution**: 
- Check that `public` is set as the build output directory
- Verify all files are in the `public` folder
- Clear browser cache and try again

### Issue: Forms Not Saving
**Solution**:
- This is expected with in-memory storage
- Data will reset when the worker restarts
- Migrate to D1 database for persistence

### Issue: CORS Errors
**Solution**:
- Check that `_middleware.js` is in the `functions` folder
- Verify CORS headers are set correctly
- Check browser console for specific errors

### Issue: Embed Script Not Loading
**Solution**:
- Verify the script URL is correct
- Check that `embed.js` is in the `public` folder
- Ensure the form ID is correct
- Check browser console for errors

---

## Monitoring & Maintenance

### 1. Check Deployment Status
- Go to Cloudflare Dashboard > Pages
- View deployment history
- Check build logs if deployment fails

### 2. Monitor Performance
- Use Cloudflare Analytics
- Check response times
- Monitor error rates

### 3. Update Deployment
- Push changes to GitHub `main` branch
- Cloudflare Pages auto-deploys on push
- No manual deployment needed

### 4. Rollback if Needed
- Go to deployment history
- Click "Rollback" on any previous deployment
- Instant rollback to working version

---

## Next Steps After Deployment

1. ✅ **Test all features** on the live site
2. ✅ **Create a test form** and embed it on hlpfl.info
3. ✅ **Verify analytics** are tracking correctly
4. ⏳ **Migrate to D1 database** for persistence
5. ⏳ **Set up custom domain** (optional)
6. ⏳ **Configure email notifications** (future)
7. ⏳ **Add more form templates** (future)

---

## Support

If you encounter any issues:
- Check the [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)
- Review the [Wrangler docs](https://developers.cloudflare.com/workers/wrangler/)
- Check GitHub issues: https://github.com/HLPFLCG/hlpflforms/issues

---

## Current Status

✅ **Code is ready for deployment**
✅ **All features implemented**
✅ **Documentation complete**
⏳ **Awaiting Cloudflare Pages deployment**

**Recommended**: Use Option 1 (Dashboard deployment) for easiest setup.

---

Built with ❤️ by HLPFL