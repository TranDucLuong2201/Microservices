#!/bin/bash

echo "🚀 Deploying TodoApp with Wildcard SSL to Virtual Machine"
echo "========================================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx (for additional proxy if needed)
echo "🌐 Installing Nginx..."
apt install -y nginx

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# Create project directory
echo "📁 Creating project directory..."
mkdir -p /opt/todoapp
cd /opt/todoapp

# Copy project files (assuming you upload them)
echo "📋 Please upload your project files to /opt/todoapp/"
echo "Required files:"
echo "  - docker-compose.yml"
echo "  - docker-compose.ssl.yml"
echo "  - nginx/nginx-ssl.conf"
echo "  - ssl/cert.pem"
echo "  - ssl/key.pem"
echo "  - ssl/chain.pem (optional)"
echo "  - All service directories (api-gateway, frontend, etc.)"

# Wait for user to upload files
read -p "Press Enter after uploading all files..."

# Verify SSL certificates
echo "🔐 Verifying SSL certificates..."
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "❌ SSL certificates not found!"
    echo "Please ensure ssl/cert.pem and ssl/key.pem exist"
    exit 1
fi

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
chmod 644 ssl/chain.pem 2>/dev/null || true

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.ssl.yml down --remove-orphans 2>/dev/null || true

# Remove old volumes (optional - uncomment if you want fresh start)
# echo "🗑️ Removing old volumes..."
# docker volume rm microservices_mongodb_auth_data 2>/dev/null || true
# docker volume rm microservices_mongodb_user_data 2>/dev/null || true
# docker volume rm microservices_mongodb_todo_data 2>/dev/null || true
# docker volume rm microservices_rabbitmq_data 2>/dev/null || true

# Start services with SSL
echo "🚀 Starting services with SSL..."
docker-compose -f docker-compose.ssl.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.ssl.yml ps

# Test SSL
echo "🔐 Testing SSL..."
curl -k -s https://localhost/health || echo "SSL test failed"

# Setup auto-start
echo "🔄 Setting up auto-start..."
cat > /etc/systemd/system/todoapp.service << EOF
[Unit]
Description=TodoApp Microservices
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/todoapp
ExecStart=/usr/local/bin/docker-compose -f docker-compose.ssl.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.ssl.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable todoapp.service

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "🌐 Your application is now running at:"
echo "  - https://lunix.codes"
echo "  - https://todo.lunix.codes"
echo "  - https://api.lunix.codes"
echo "  - https://admin.lunix.codes"
echo ""
echo "📊 Management URLs:"
echo "  - RabbitMQ: https://lunix.codes:15672 (admin/password)"
echo "  - API Health: https://lunix.codes/api/health"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.ssl.yml logs -f"
echo "  - Restart: docker-compose -f docker-compose.ssl.yml restart"
echo "  - Stop: docker-compose -f docker-compose.ssl.yml down"
echo "  - Start: docker-compose -f docker-compose.ssl.yml up -d"
echo ""
echo "📝 Don't forget to configure DNS:"
echo "  - lunix.codes A [Your VM IP]"
echo "  - *.lunix.codes A [Your VM IP]"
