@echo off
echo 🚀 Hostinger Deployment Script for Byberr
echo =====================================

REM Check if static export is requested
set /p static_build="Use static export? (y/n, default=n): "
if /i "%static_build%"=="y" goto static_build

REM Standard deployment
echo 🔨 Building for production (server-side)...
goto standard_build

:static_build
echo 📦 Building static export...

:standard_build
REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if /i "%static_build%"=="y" (
    REM Use static config
    echo 🔄 Switching to static export configuration...
    copy next.config.static.mjs next.config.mjs.bak
    copy next.config.static.mjs next.config.mjs
    call npm run build
    copy next.config.mjs.bak next.config.mjs
    del next.config.mjs.bak
    echo ✅ Static build completed in 'out' folder
    echo 📁 Upload contents of 'out' folder to Hostinger
) else (
    REM Standard build
    echo 🔨 Building for production...
    call npm run build
    echo ✅ Server-side build completed in '.next' folder
    echo 📁 Upload contents of '.next' folder to Hostinger
)

REM Create .htaccess
echo ⚙️ Creating .htaccess for Hostinger...
(
echo # Hostinger Next.js Configuration - Updated for Chunk Loading Issues
echo.
echo # Enable rewrite engine
echo RewriteEngine On
echo.
echo # Set correct base path
echo RewriteBase /
echo.
echo # Handle static assets explicitly - CRITICAL for chunk loading
echo RewriteCond %%REQUEST_URI^^ ^/_next/static/
echo RewriteRule .* - [L]
echo.
echo # Handle public folder assets
echo RewriteCond %%REQUEST_URI^^ ^/(.*\.(js^|css^|png^|jpg^|jpeg^|gif^|ico^|svg^|woff^|woff2^|ttf^|eot^)$
echo RewriteCond %%REQUEST_FILENAME^^ !-f
echo RewriteCond %%REQUEST_FILENAME^^ !-d
echo RewriteRule .* - [L]
echo.
echo # Handle API routes
echo RewriteCond %%REQUEST_URI^^ ^/api/
echo RewriteRule ^api/(.*)$ index.html [L,QSA]
echo.
echo # Handle all other routes - fallback to index.html
echo RewriteCond %%REQUEST_FILENAME^^ !-f
echo RewriteCond %%REQUEST_FILENAME^^ !-d
echo RewriteRule ^(.*)$ index.html [L,QSA]
echo.
echo # Security headers
echo ^<IfModule mod_headers.c^>
echo     # Enable CORS for Next.js
echo     Header always set Access-Control-Allow-Origin "*"
echo     Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
echo     Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
echo.
echo     # Security headers
echo     Header always set X-Frame-Options "SAMEORIGIN"
echo     Header always set X-Content-Type-Options "nosniff"
echo     Header always set Referrer-Policy "strict-origin-when-cross-origin"
echo ^</IfModule^>
echo.
echo # Compression for performance
echo ^<IfModule mod_deflate.c^>
echo     SetOutputFilter DEFLATE
echo     SetEnvIfNoCase Request_URI \
echo         \.(?:gif^|jpe?g^|png^)$ no-gzip dont-vary
echo     SetEnvIfNoCase Request_URI \
echo         \.(?:exe^|t?gz^|zip^|bz2^|sit^|rar^)$ no-gzip dont-vary
echo.
echo     AddOutputFilterByType DEFLATE text/plain
echo     AddOutputFilterByType DEFLATE text/html
echo     AddOutputFilterByType DEFLATE text/xml
echo     AddOutputFilterByType DEFLATE text/css
echo     AddOutputFilterByType DEFLATE application/xml
echo     AddOutputFilterByType DEFLATE application/xhtml+xml
echo     AddOutputFilterByType DEFLATE application/rss+xml
echo     AddOutputFilterByType DEFLATE application/javascript
echo     AddOutputFilterByType DEFLATE application/x-javascript
echo     AddOutputFilterByType DEFLATE application/json
echo ^</IfModule^>
echo.
echo # Cache headers for static assets
echo ^<IfModule mod_expires.c^>
echo     ExpiresActive On
echo.
echo     # Static assets - long cache
echo     ExpiresByType text/css "access plus 1 year"
echo     ExpiresByType application/javascript "access plus 1 year"
echo     ExpiresByType application/x-javascript "access plus 1 year"
echo.
echo     # Images - long cache
echo     ExpiresByType image/png "access plus 1 year"
echo     ExpiresByType image/jpg "access plus 1 year"
echo     ExpiresByType image/jpeg "access plus 1 year"
echo     ExpiresByType image/gif "access plus 1 year"
echo     ExpiresByType image/ico "access plus 1 year"
echo     ExpiresByType image/svg "access plus 1 year"
echo     ExpiresByType image/webp "access plus 1 year"
echo.
echo     # Fonts - long cache
echo     ExpiresByType font/woff "access plus 1 year"
echo     ExpiresByType font/woff2 "access plus 1 year"
echo     ExpiresByType application/font-woff "access plus 1 year"
echo     ExpiresByType application/font-woff2 "access plus 1 year"
echo.
echo     # HTML - shorter cache
echo     ExpiresByType text/html "access plus 1 hour"
echo ^</IfModule^>
echo.
echo # Error handling
echo ErrorDocument 404 /index.html
echo ErrorDocument 500 /index.html
) > .htaccess

echo.
echo ✅ Deployment files ready!
echo.
echo 📋 UPLOAD INSTRUCTIONS:
echo ========================
if /i "%static_build%"=="y" (
    echo 📁 Upload ALL contents from 'out' folder to Hostinger root
    echo 📁 Include .htaccess file in root
) else (
    echo 📁 Upload ALL contents from '.next' folder to Hostinger root
    echo 📁 Include .htaccess file in root
    echo 📁 Include package.json
    echo 📁 Include public folder
)
echo.
echo 🔍 TROUBLESHOOTING:
echo ===================
echo 1. Verify ALL chunk files are uploaded
echo 2. Check file permissions (755 for folders, 644 for files)
echo 3. Test individual chunks: https://byberr.in/_next/static/chunks/[filename].js
echo 4. Ensure .htaccess is in root directory
echo 5. Contact Hostinger support if issues persist
echo.
echo 🌐 After deployment, visit: https://byberr.in
echo.
pause
