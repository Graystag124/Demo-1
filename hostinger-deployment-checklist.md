# Hostinger Deployment Checklist for Byberr.in

## 🚨 Current Issue
Chunk loading 404 errors indicate missing files on server:
- `2d6cf47c5eac235e.js`
- `dd2be14a30012110.css`
- Other dynamic chunks

## ✅ Pre-Deployment Steps

### 1. Clean Build
```bash
# Remove old build
rm -rf .next
# Fresh install
npm install
# Build with webpack
npm run build
```

### 2. Verify Generated Files
Check that these exist in `.next/static/chunks/`:
- All framework chunks
- All app chunks  
- All CSS files
- Main application files

## 📁 Required Files for Hostinger Upload

### Must Upload (Complete Structure):
```
├── .next/
│   ├── static/
│   │   ├── chunks/          ← ALL chunk files
│   │   ├── css/             ← All CSS files
│   │   ├── media/           ← Images/media
│   │   └── webpack/         ← Webpack runtime
│   ├── server/
│   │   ├── app/
│   │   └── pages/
│   ├── standalone/
│   └── ... (other .next files)
├── public/
│   ├── Byberr 1.svg
│   └── ... (other public assets)
├── package.json
├── .htaccess (generated)
└── next.config.mjs
```

## ⚙️ Server Configuration

### .htaccess Content:
```apache
# Hostinger Next.js Configuration
RewriteEngine On

# Handle static assets - CRITICAL
RewriteRule ^_next/static/(.*)$ - [L]

# Handle API routes
RewriteRule ^api/(.*)$ index.html [L]

# Handle all other routes
RewriteRule ^(.*)$ index.html [L]

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache headers for static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/svg "access plus 1 year"
</IfModule>
```

## 🔍 Troubleshooting Steps

### 1. Verify File Upload
- Check ALL files in `.next/static/chunks/` are uploaded
- Verify file sizes match local build
- Check file permissions (755 for folders, 644 for files)

### 2. Test Individual Files
Try accessing directly:
- `https://byberr.in/_next/static/chunks/2d6cf47c5eac235e.js`
- `https://byberr.in/_next/static/css/dd2be14a30012110.css`

### 3. Server Configuration
- Ensure `.htaccess` is in root directory
- Check Apache `mod_rewrite` is enabled
- Verify file paths in .htaccess

### 4. Alternative: Static Export
If issues persist, try static export:
```bash
# Update next.config.mjs temporarily:
output: 'export',
# Then build:
npm run build
# Upload 'out' folder contents
```

## 🚀 Quick Fix Script
Run `deploy.bat` (Windows) or `deploy.sh` (Linux/Mac) which:
1. Cleans previous build
2. Runs production build
3. Creates proper .htaccess
4. Provides upload instructions

## 📞 Hostinger Support
If still failing, contact Hostinger support with:
- Error details (404 for specific chunks)
- Request verification of Apache modules
- Ask about Node.js application setup vs static hosting
