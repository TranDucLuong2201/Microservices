#!/bin/bash

echo "🚀 Starting TodoApp with SSL on todo.lunix.codes"
echo "================================================"

# Check if SSL files exist
if [ ! -f "ssl/_.lunix.codes-crt.pem" ] || [ ! -f "ssl/_.lunix.codes-key.pem" ]; then
    echo "❌ SSL files not found!"
    echo "Please ensure these files exist:"
    echo "  - ssl/_.lunix.codes-crt.pem (your SSL certificate)"
    echo "  - ssl/_.lunix.codes-key.pem (your private key)"
    echo "  - ssl/_.lunix.codes-chain.pem (intermediate certificate, optional)"
    echo ""
    echo "After adding the SSL files, run this script again."
    exit 1
fi

echo "✅ SSL files found and configured"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Start services with SSL
echo "🚀 Starting services with SSL..."
docker-compose -f docker-compose.ssl.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.ssl.yml ps

# Test SSL endpoint
echo ""
echo "🔒 Testing SSL endpoint..."
if curl -s -k https://localhost/health > /dev/null; then
    echo "✅ SSL endpoint is responding"
else
    echo "❌ SSL endpoint not responding"
fi

echo ""
echo "🎉 TodoApp is now running with SSL!"
echo "🌐 Access your app at: https://todo.lunix.codes"
echo "📊 RabbitMQ Management: https://todo.lunix.codes:15672 (admin/password)"
echo ""
echo "📝 Make sure your DNS is pointing todo.lunix.codes to this server's IP address"
