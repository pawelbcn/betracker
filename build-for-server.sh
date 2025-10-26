#!/bin/bash

# Build script for shared hosting deployment
echo "🚀 Building Delegation Expense Tracker for Shared Hosting..."

# Copy production environment
cp production.env .env.local

# Copy production Next.js config
cp next.config.production.js next.config.js

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deployment
cp -r .next deployment/
cp -r public deployment/
cp -r node_modules deployment/
cp package.json deployment/
cp next.config.js deployment/
cp .env.local deployment/

# Create .htaccess for Apache
cat > deployment/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /tracker/

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /tracker/index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
EOF

echo "✅ Build complete! Upload the 'deployment' folder to your server."
echo "📁 Upload to: /home/platne/brasserwis/public_html/brasserwis/tracker/"
echo ""
echo "🎯 Your app will be available at: https://www.brasserwis.pl/tracker/"
