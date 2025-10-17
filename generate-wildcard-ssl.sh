#!/bin/bash

echo "🔐 Generating Wildcard SSL Certificate for *.lunix.com"
echo "====================================================="

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL not found. Please install OpenSSL first."
    exit 1
fi

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate private key
echo "🔑 Generating private key..."
openssl genrsa -out ssl/wildcard.lunix.com.key 2048

# Generate certificate signing request (CSR)
echo "📝 Generating CSR for *.lunix.com..."
openssl req -new -key ssl/wildcard.lunix.com.key -out ssl/wildcard.lunix.com.csr -subj "/C=VN/ST=Ho Chi Minh/L=Ho Chi Minh City/O=Lunix/OU=IT Department/CN=*.lunix.com"

# Generate self-signed certificate (for testing)
echo "🔒 Generating self-signed certificate..."
openssl x509 -req -days 365 -in ssl/wildcard.lunix.com.csr -signkey ssl/wildcard.lunix.com.key -out ssl/wildcard.lunix.com.crt

# Create combined certificate file
echo "📦 Creating combined certificate..."
cat ssl/wildcard.lunix.com.crt > ssl/cert.pem
echo "" >> ssl/cert.pem

# Copy private key
cp ssl/wildcard.lunix.com.key ssl/key.pem

echo ""
echo "✅ Wildcard SSL files generated successfully!"
echo ""
echo "📁 Files created:"
echo "  - ssl/wildcard.lunix.com.key (private key)"
echo "  - ssl/wildcard.lunix.com.csr (certificate signing request)"
echo "  - ssl/wildcard.lunix.com.crt (self-signed certificate)"
echo "  - ssl/cert.pem (certificate for nginx)"
echo "  - ssl/key.pem (private key for nginx)"
echo ""
echo "📋 Next steps:"
echo "1. Send ssl/wildcard.lunix.com.csr to your SSL provider"
echo "2. They will give you the signed certificate"
echo "3. Replace ssl/cert.pem with the signed certificate"
echo "4. Run: docker-compose -f docker-compose.ssl.yml up -d"
echo ""
echo "🌐 This certificate will work for:"
echo "  - lunix.com"
echo "  - *.lunix.com (any subdomain)"
echo "  - todo.lunix.com"
echo "  - api.lunix.com"
echo "  - admin.lunix.com"
echo "  - etc..."
