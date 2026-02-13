#!/bin/bash

# Hostinger Deployment Script for Byberr
echo "🚀 Starting deployment to Hostinger..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Create .htaccess for Hostinger
echo "⚙️ Creating .htaccess for Hostinger..."
cat > .htaccess << 'EOF'
# Hostinger Next.js Configuration
RewriteEngine On

# Handle static assets
RewriteRule ^_next/static/(.*)$ - [L]

# Handle API routes
RewriteRule ^api/(.*)$ index.html [L]

# Handle all other routes with Next.js
RewriteRule ^(.*)$ index.html [L]

# Enable compression
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

# Set cache headers for static assets
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
EOF

echo "✅ Build completed successfully!"
echo "📁 Upload the following to Hostinger:"
echo "   - .next folder contents"
echo "   - .htaccess file"
echo "   - package.json"
echo "   - public folder"
echo ""
echo "🌐 After deployment, your site should be available at byberr.in"
