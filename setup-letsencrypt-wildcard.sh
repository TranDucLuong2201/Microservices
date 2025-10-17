#!/bin/bash

echo "🔐 Setting up Let's Encrypt Wildcard SSL for *.lunix.com"
echo "======================================================"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot not found. Installing..."
    
    # Install certbot based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt update
        sudo apt install -y certbot
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install certbot
    else
        echo "Please install certbot manually: https://certbot.eff.org/"
        exit 1
    fi
fi

# Create SSL directory
mkdir -p ssl

echo "📝 Generating wildcard certificate for *.lunix.com"
echo "This will use DNS challenge (you need to add TXT record to DNS)"
echo ""

# Generate wildcard certificate
certbot certonly \
    --manual \
    --preferred-challenges dns \
    --email admin@lunix.com \
    --agree-tos \
    --no-eff-email \
    -d "*.lunix.com" \
    -d "lunix.com"

if [ $? -eq 0 ]; then
    echo "✅ Certificate generated successfully!"
    
    # Copy certificates to ssl directory
    echo "📦 Copying certificates..."
    sudo cp /etc/letsencrypt/live/lunix.com/fullchain.pem ssl/cert.pem
    sudo cp /etc/letsencrypt/live/lunix.com/privkey.pem ssl/key.pem
    sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
    
    echo ""
    echo "🎉 Wildcard SSL setup complete!"
    echo "🌐 Your certificate works for:"
    echo "  - lunix.com"
    echo "  - *.lunix.com (any subdomain)"
    echo "  - todo.lunix.com"
    echo "  - api.lunix.com"
    echo "  - admin.lunix.com"
    echo ""
    echo "🚀 Now run: docker-compose -f docker-compose.ssl.yml up -d"
    echo ""
    echo "🔄 Auto-renewal setup:"
    echo "Add this to crontab: 0 12 * * * /usr/bin/certbot renew --quiet"
else
    echo "❌ Certificate generation failed"
    exit 1
fi
