# 🚀 DEPLOYMENT GUIDE

## 🎯 **TỔNG QUAN DEPLOYMENT**

Tài liệu này hướng dẫn deploy microservices application lên Azure VM với đầy đủ các bước từ development đến production.

---

## 🏗️ **DEPLOYMENT ARCHITECTURE**

### **Development Environment**
```
┌─────────────────────────────────────┐
│         Local Machine              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │Frontend │ │API GW   │ │Services │ │
│  │:5173    │ │:3000    │ │:50051+  │ │
│  └─────────┘ └─────────┘ └─────────┘ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │MongoDB  │ │RabbitMQ │ │Nginx    │ │
│  │:27017+  │ │:5672    │ │:80/443  │ │
│  └─────────┘ └─────────┘ └─────────┘ │
└─────────────────────────────────────┘
```

### **Production Environment**
```
┌─────────────────────────────────────┐
│         Azure VM                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │Frontend │ │API GW   │ │Services │ │
│  │Container│ │Container│ │Containers│ │
│  └─────────┘ └─────────┘ └─────────┘ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │CosmosDB │ │Service  │ │Nginx    │ │
│  │Managed  │ │Bus      │ │SSL      │ │
│  └─────────┘ └─────────┘ └─────────┘ │
└─────────────────────────────────────┘
```

---

## 🔧 **PREPARATION**

### **Prerequisites**
- ✅ Azure CLI installed
- ✅ Docker và Docker Compose installed
- ✅ Git repository access
- ✅ SSL certificate (Let's Encrypt hoặc custom)
- ✅ Domain name configured

### **Required Azure Resources**
- ✅ Resource Group
- ✅ Virtual Machine (Ubuntu 22.04)
- ✅ Azure Cosmos DB (3 instances)
- ✅ Azure Service Bus (optional)
- ✅ Network Security Group

---

## 🚀 **STEP 1: AZURE VM SETUP**

### **1.1 Create Resource Group**
```bash
az group create \
  --name microservices-rg \
  --location eastus
```

### **1.2 Create Virtual Machine**
```bash
az vm create \
  --resource-group microservices-rg \
  --name microservices-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --location eastus \
  --public-ip-sku Standard
```

### **1.3 Open Required Ports**
```bash
# HTTP
az vm open-port \
  --resource-group microservices-rg \
  --name microservices-vm \
  --port 80

# HTTPS
az vm open-port \
  --resource-group microservices-rg \
  --name microservices-vm \
  --port 443

# SSH (optional, for admin access)
az vm open-port \
  --resource-group microservices-rg \
  --name microservices-vm \
  --port 22
```

### **1.4 Get VM Public IP**
```bash
az vm show \
  --resource-group microservices-rg \
  --name microservices-vm \
  --show-details \
  --query publicIps \
  --output tsv
```

---

## 🗄️ **STEP 2: DATABASE SETUP**

### **2.1 Create Azure Cosmos DB Instances**

#### **Auth Service Database**
```bash
az cosmosdb create \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-auth \
  --kind MongoDB \
  --locations regionName=eastus \
  --default-consistency-level Session
```

#### **User Service Database**
```bash
az cosmosdb create \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-user \
  --kind MongoDB \
  --locations regionName=eastus \
  --default-consistency-level Session
```

#### **Todo Service Database**
```bash
az cosmosdb create \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-todo \
  --kind MongoDB \
  --locations regionName=eastus \
  --default-consistency-level Session
```

### **2.2 Get Connection Strings**
```bash
# Auth Service
az cosmosdb keys list \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-auth \
  --type connection-strings

# User Service
az cosmosdb keys list \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-user \
  --type connection-strings

# Todo Service
az cosmosdb keys list \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-todo \
  --type connection-strings
```

### **2.3 Configure Database Security**
```bash
# Enable public network access
az cosmosdb update \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-auth \
  --enable-public-network true

az cosmosdb update \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-user \
  --enable-public-network true

az cosmosdb update \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-todo \
  --enable-public-network true
```

---

## 🔐 **STEP 3: SSL CERTIFICATE SETUP**

### **3.1 Using Let's Encrypt (Recommended)**

#### **Install Certbot**
```bash
# SSH vào VM
ssh azureuser@YOUR_VM_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install certbot
sudo apt install certbot python3-certbot-nginx -y
```

#### **Generate SSL Certificate**
```bash
# Generate certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### **3.2 Using Custom Certificate**

#### **Upload Certificate Files**
```bash
# Upload certificate files to VM
scp -i ~/.ssh/your-key.pem your-cert.pem azureuser@YOUR_VM_IP:/home/azureuser/
scp -i ~/.ssh/your-key.pem your-key.pem azureuser@YOUR_VM_IP:/home/azureuser/

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Copy certificates
sudo cp your-cert.pem /etc/nginx/ssl/cert.pem
sudo cp your-key.pem /etc/nginx/ssl/key.pem

# Set permissions
sudo chmod 600 /etc/nginx/ssl/key.pem
sudo chmod 644 /etc/nginx/ssl/cert.pem
```

---

## 🐳 **STEP 4: DOCKER SETUP**

### **4.1 Install Docker**
```bash
# SSH vào VM
ssh azureuser@YOUR_VM_IP

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker azureuser

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout và login lại
exit
ssh azureuser@YOUR_VM_IP
```

### **4.2 Verify Docker Installation**
```bash
# Check Docker version
docker --version
docker-compose --version

# Test Docker
docker run hello-world
```

---

## 📁 **STEP 5: APPLICATION DEPLOYMENT**

### **5.1 Clone Repository**
```bash
# Clone repository
git clone https://github.com/your-username/microservices.git
cd microservices

# Check out production branch
git checkout main
```

### **5.2 Configure Environment Variables**
```bash
# Copy environment template
cp env.production.example .env.production

# Edit environment variables
nano .env.production
```

#### **Environment Variables Content**
```env
# Azure Cosmos DB Connection Strings
MONGODB_AUTH_URI=mongodb://microservices-cosmosdb-auth:YOUR_PRIMARY_KEY@microservices-cosmosdb-auth.mongo.cosmos.azure.com:10255/auth-service?ssl=true&replicaSet=globaldb

MONGODB_USER_URI=mongodb://microservices-cosmosdb-user:YOUR_PRIMARY_KEY@microservices-cosmosdb-user.mongo.cosmos.azure.com:10255/user-service?ssl=true&replicaSet=globaldb

MONGODB_TODO_URI=mongodb://microservices-cosmosdb-todo:YOUR_PRIMARY_KEY@microservices-cosmosdb-todo.mongo.cosmos.azure.com:10255/todo-service?ssl=true&replicaSet=globaldb

# RabbitMQ Credentials
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your_secure_rabbitmq_password_123

# JWT Secret
JWT_SECRET=your_super_secure_jwt_secret_key_for_production_2024

# Azure Service Bus (Optional)
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_ACTUAL_KEY_HERE
```

### **5.3 Deploy Application**
```bash
# Build và start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check deployment status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🔧 **STEP 6: NGINX CONFIGURATION**

### **6.1 Update Nginx Configuration**
```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/microservices
```

#### **Nginx Configuration Content**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        rewrite /api/(.*) /$1 break;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Login Route (stricter rate limiting)
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        rewrite /api/(.*) /$1 break;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend Routes
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### **6.2 Enable Site Configuration**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/microservices /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## 🧪 **STEP 7: TESTING & VERIFICATION**

### **7.1 Health Check Tests**
```bash
# Test HTTP redirect
curl -I http://your-domain.com

# Test HTTPS
curl -I https://your-domain.com

# Test API health
curl https://your-domain.com/health

# Test API endpoints
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### **7.2 Database Connection Tests**
```bash
# Test MongoDB connections
docker exec microservices-auth-service node -e "console.log('Auth DB connected')"
docker exec microservices-user-service node -e "console.log('User DB connected')"
docker exec microservices-todo-service node -e "console.log('Todo DB connected')"
```

### **7.3 Service Status Check**
```bash
# Check all containers
docker ps

# Check logs
docker logs microservices-api-gateway
docker logs microservices-frontend
docker logs microservices-auth-service
```

---

## 📊 **STEP 8: MONITORING SETUP**

### **8.1 Application Monitoring**
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor system resources
htop

# Monitor network usage
nethogs

# Monitor disk I/O
iotop
```

### **8.2 Log Monitoring**
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -f
```

### **8.3 Set Up Log Rotation**
```bash
# Configure logrotate for Docker logs
sudo nano /etc/logrotate.d/docker
```

#### **Logrotate Configuration**
```
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

---

## 🔄 **STEP 9: CI/CD SETUP**

### **9.1 GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure VM

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Azure VM
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.AZURE_VM_HOST }}
        username: ${{ secrets.AZURE_VM_USERNAME }}
        key: ${{ secrets.AZURE_VM_SSH_KEY }}
        script: |
          cd /home/azureuser/microservices
          git pull origin main
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml up -d --build
```

### **9.2 GitHub Secrets Setup**
```bash
# Add secrets to GitHub repository
AZURE_VM_HOST=your-vm-ip
AZURE_VM_USERNAME=azureuser
AZURE_VM_SSH_KEY=your-private-ssh-key
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Container Won't Start**
```bash
# Check container logs
docker logs microservices-auth-service

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart auth-service
```

#### **2. Database Connection Failed**
```bash
# Test connection string
echo $MONGODB_AUTH_URI

# Check network connectivity
docker exec microservices-auth-service ping microservices-cosmosdb-auth.mongo.cosmos.azure.com

# Verify firewall rules
az cosmosdb show --resource-group microservices-rg --name microservices-cosmosdb-auth
```

#### **3. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

#### **4. Nginx Configuration Errors**
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 **SECURITY CHECKLIST**

### **✅ Security Measures Implemented**
- ✅ **SSL/TLS** - HTTPS encryption
- ✅ **Rate Limiting** - API protection
- ✅ **Security Headers** - XSS, CSRF protection
- ✅ **Database Separation** - Isolated data
- ✅ **Environment Variables** - Secure configuration
- ✅ **Firewall Rules** - Network security
- ✅ **Regular Updates** - System maintenance

### **🔧 Additional Security Measures**
```bash
# Enable UFW firewall
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Set up fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **8.1 Database Optimization**
```bash
# Enable database indexing
# (Already configured in models)

# Monitor database performance
# Use Azure Cosmos DB metrics in Azure Portal
```

### **8.2 Application Optimization**
```bash
# Enable gzip compression in nginx
# (Already configured)

# Set up caching headers
# (Already configured in nginx)

# Monitor application performance
docker stats
```

### **8.3 System Optimization**
```bash
# Optimize system resources
sudo nano /etc/sysctl.conf

# Add performance tuning
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Apply changes
sudo sysctl -p
```

---

## 🎉 **DEPLOYMENT COMPLETE**

### **✅ Deployment Checklist**
- [ ] ✅ Azure VM created và configured
- [ ] ✅ Azure Cosmos DB instances created
- [ ] ✅ SSL certificate installed
- [ ] ✅ Docker và Docker Compose installed
- [ ] ✅ Application deployed
- [ ] ✅ Nginx configured
- [ ] ✅ Health checks passing
- [ ] ✅ Monitoring setup
- [ ] ✅ CI/CD configured
- [ ] ✅ Security measures implemented

### **🌐 Access URLs**
- **Frontend**: `https://your-domain.com/`
- **API**: `https://your-domain.com/api/`
- **Health Check**: `https://your-domain.com/health`
- **RabbitMQ Management**: `https://your-domain.com:15672`

### **📊 Next Steps**
1. **Monitor Performance** - Set up alerts
2. **Backup Strategy** - Configure automated backups
3. **Scaling** - Plan for horizontal scaling
4. **Testing** - Implement comprehensive testing
5. **Documentation** - Keep documentation updated

---

**🚀 Application đã được deploy thành công lên Azure VM với đầy đủ tính năng production-ready!**
