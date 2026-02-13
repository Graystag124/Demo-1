@echo off
echo 🚀 Starting deployment to Hostinger...

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist .next rmdir /s /q .next

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build for production
echo 🔨 Building for production...
call npm run build

REM Create .htaccess for Hostinger
echo ⚙️ Creating .htaccess for Hostinger...
(
echo # Hostinger Next.js Configuration
echo RewriteEngine On
echo.
echo # Handle static assets
echo RewriteRule ^_next/static/(.*)$ - [L]
echo.
echo # Handle API routes
echo RewriteRule ^api/(.*)$ index.html [L]
echo.
echo # Handle all other routes with Next.js
echo RewriteRule ^(.*)$ index.html [L]
echo.
echo # Enable compression
echo ^<IfModule mod_deflate.c^>
echo     AddOutputFilterByType DEFLATE text/plain
echo     AddOutputFilterByType DEFLATE text/html
echo     AddOutputFilterByType DEFLATE text/xml
echo     AddOutputFilterByType DEFLATE text/css
echo     AddOutputFilterByType DEFLATE application/xml
echo     AddOutputFilterByType DEFLATE application/xhtml+xml
echo     AddOutputFilterByType DEFLATE application/rss+xml
echo     AddOutputFilterByType DEFLATE application/javascript
echo     AddOutputFilterByType DEFLATE application/x-javascript
echo ^</IfModule^>
echo.
echo # Set cache headers for static assets
echo ^<IfModule mod_expires.c^>
echo     ExpiresActive On
echo     ExpiresByType text/css "access plus 1 year"
echo     ExpiresByType application/javascript "access plus 1 year"
echo     ExpiresByType image/png "access plus 1 year"
echo     ExpiresByType image/jpg "access plus 1 year"
echo     ExpiresByType image/jpeg "access plus 1 year"
echo     ExpiresByType image/gif "access plus 1 year"
echo     ExpiresByType image/ico "access plus 1 year"
echo     ExpiresByType image/svg "access plus 1 year"
echo ^</IfModule^>
) > .htaccess

echo ✅ Build completed successfully!
echo 📁 Upload following to Hostinger:
echo    - .next folder contents
echo    - .htaccess file
echo    - package.json
echo    - public folder
echo.
echo 🌐 After deployment, your site should be available at byberr.in
pause
