# Azure VM Port Configuration Guide

## 🔧 **CẤU HÌNH PORTS TRÊN AZURE VM**

### **Ports cần mở trên Azure VM:**

#### **1. Frontend & API Gateway**
- **Port 80 (HTTP)** - Redirect to HTTPS
- **Port 443 (HTTPS)** - Main application access
- **Port 3000** - API Gateway (internal)

#### **2. Microservices (Internal)**
- **Port 50051** - Auth Service (gRPC)
- **Port 50052** - User Service (gRPC)  
- **Port 50053** - Todo Service (gRPC)

#### **3. Databases (Internal)**
- **Port 27017** - MongoDB Auth Service
- **Port 27018** - MongoDB User Service
- **Port 27019** - MongoDB Todo Service

#### **4. Message Queue (Internal)**
- **Port 5672** - RabbitMQ AMQP
- **Port 15672** - RabbitMQ Management UI

### **Azure CLI Commands để cấu hình:**

```bash
# 1. Tạo Network Security Group
az network nsg create \
  --resource-group microservices-rg \
  --name microservices-nsg \
  --location eastus

# 2. Mở port 80 (HTTP)
az network nsg rule create \
  --resource-group microservices-rg \
  --nsg-name microservices-nsg \
  --name AllowHTTP \
  --priority 1000 \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 80 \
  --access Allow \
  --protocol Tcp \
  --description "Allow HTTP traffic"

# 3. Mở port 443 (HTTPS)
az network nsg rule create \
  --resource-group microservices-rg \
  --nsg-name microservices-nsg \
  --name AllowHTTPS \
  --priority 1001 \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 443 \
  --access Allow \
  --protocol Tcp \
  --description "Allow HTTPS traffic"

# 4. Mở port 22 (SSH) - chỉ cho admin
az network nsg rule create \
  --resource-group microservices-rg \
  --nsg-name microservices-nsg \
  --name AllowSSH \
  --priority 1002 \
  --source-address-prefixes 'YOUR_IP_ADDRESS' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 22 \
  --access Allow \
  --protocol Tcp \
  --description "Allow SSH from admin IP"

# 5. Mở port 15672 (RabbitMQ Management) - chỉ cho admin
az network nsg rule create \
  --resource-group microservices-rg \
  --nsg-name microservices-nsg \
  --name AllowRabbitMQManagement \
  --priority 1003 \
  --source-address-prefixes 'YOUR_IP_ADDRESS' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 15672 \
  --access Allow \
  --protocol Tcp \
  --description "Allow RabbitMQ Management UI"

# 6. Gán NSG vào VM
az network nic update \
  --resource-group microservices-rg \
  --name microservices-vm-nic \
  --network-security-group microservices-nsg
```

### **Cấu hình SSL Certificate:**

```bash
# 1. Upload SSL certificate lên VM
scp -i ~/.ssh/your-key.pem your-cert.pem azureuser@your-vm-ip:/home/azureuser/
scp -i ~/.ssh/your-key.pem your-key.pem azureuser@your-vm-ip:/home/azureuser/

# 2. Tạo thư mục SSL
sudo mkdir -p /etc/nginx/ssl

# 3. Copy certificate files
sudo cp your-cert.pem /etc/nginx/ssl/cert.pem
sudo cp your-key.pem /etc/nginx/ssl/key.pem

# 4. Set permissions
sudo chmod 600 /etc/nginx/ssl/key.pem
sudo chmod 644 /etc/nginx/ssl/cert.pem
```

### **Cấu hình Firewall trên VM:**

```bash
# 1. Enable UFW
sudo ufw enable

# 2. Allow SSH
sudo ufw allow 22

# 3. Allow HTTP
sudo ufw allow 80

# 4. Allow HTTPS
sudo ufw allow 443

# 5. Allow RabbitMQ Management (optional, chỉ cho admin)
sudo ufw allow from YOUR_IP_ADDRESS to any port 15672

# 6. Check status
sudo ufw status
```

### **Docker Compose cho Production:**

Tạo file `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # Auth Service Database
  mongodb-auth:
    image: mongo:7.0
    container_name: microservices-mongodb-auth
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_AUTH_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_AUTH_PASSWORD}
      MONGO_INITDB_DATABASE: auth-service
    volumes:
      - mongodb_auth_data:/data/db
    networks:
      - microservices-network

  # User Service Database
  mongodb-user:
    image: mongo:7.0
    container_name: microservices-mongodb-user
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_USER_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_USER_PASSWORD}
      MONGO_INITDB_DATABASE: user-service
    volumes:
      - mongodb_user_data:/data/db
    networks:
      - microservices-network

  # Todo Service Database
  mongodb-todo:
    image: mongo:7.0
    container_name: microservices-mongodb-todo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_TODO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_TODO_PASSWORD}
      MONGO_INITDB_DATABASE: todo-service
    volumes:
      - mongodb_todo_data:/data/db
    networks:
      - microservices-network

  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3.12-management
    container_name: microservices-rabbitmq
    restart: unless-stopped
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - microservices-network

  # Auth Service
  auth-service:
    build: ./auth-service
    container_name: microservices-auth-service
    restart: unless-stopped
    environment:
      GRPC_PORT: 50051
      JWT_SECRET: ${JWT_SECRET}
      MONGODB_URI: mongodb://${MONGODB_AUTH_USER}:${MONGODB_AUTH_PASSWORD}@mongodb-auth:27017/auth-service?authSource=admin
      AZURE_SERVICE_BUS_CONNECTION_STRING: ${AZURE_SERVICE_BUS_CONNECTION_STRING}
    depends_on:
      - mongodb-auth
      - rabbitmq
    networks:
      - microservices-network

  # User Service
  user-service:
    build: ./user-service
    container_name: microservices-user-service
    restart: unless-stopped
    environment:
      GRPC_PORT: 50052
      MONGODB_URI: mongodb://${MONGODB_USER_USER}:${MONGODB_USER_PASSWORD}@mongodb-user:27017/user-service?authSource=admin
      AZURE_SERVICE_BUS_CONNECTION_STRING: ${AZURE_SERVICE_BUS_CONNECTION_STRING}
    depends_on:
      - mongodb-user
      - rabbitmq
    networks:
      - microservices-network

  # Todo Service
  todo-service:
    build: ./todo-service
    container_name: microservices-todo-service
    restart: unless-stopped
    environment:
      GRPC_PORT: 50053
      MONGODB_URI: mongodb://${MONGODB_TODO_USER}:${MONGODB_TODO_PASSWORD}@mongodb-todo:27017/todo-service?authSource=admin
      AZURE_SERVICE_BUS_CONNECTION_STRING: ${AZURE_SERVICE_BUS_CONNECTION_STRING}
    depends_on:
      - mongodb-todo
      - rabbitmq
    networks:
      - microservices-network

  # API Gateway
  api-gateway:
    build: ./api-gateway
    container_name: microservices-api-gateway
    restart: unless-stopped
    environment:
      PORT: 3000
      AUTH_SERVICE_URL: auth-service:50051
      USER_SERVICE_URL: user-service:50052
      TODO_SERVICE_URL: todo-service:50053
    depends_on:
      - auth-service
      - user-service
      - todo-service
    networks:
      - microservices-network

  # Frontend
  frontend:
    build: ./frontend
    container_name: microservices-frontend
    restart: unless-stopped
    environment:
      VITE_API_URL: /api
    depends_on:
      - api-gateway
    networks:
      - microservices-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: microservices-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - api-gateway
    networks:
      - microservices-network

volumes:
  mongodb_auth_data:
  mongodb_user_data:
  mongodb_todo_data:
  rabbitmq_data:

networks:
  microservices-network:
    driver: bridge
```

### **Environment Variables cho Production:**

Tạo file `.env.production`:

```env
# Database Credentials
MONGODB_AUTH_USER=admin_auth
MONGODB_AUTH_PASSWORD=your_secure_password_auth
MONGODB_USER_USER=admin_user
MONGODB_USER_PASSWORD=your_secure_password_user
MONGODB_TODO_USER=admin_todo
MONGODB_TODO_PASSWORD=your_secure_password_todo

# RabbitMQ Credentials
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your_secure_rabbitmq_password

# JWT Secret
JWT_SECRET=your_super_secure_jwt_secret_key_for_production

# Azure Service Bus
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://your-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY
```

### **Deployment Commands:**

```bash
# 1. Clone repository trên VM
git clone https://github.com/your-username/microservices.git
cd microservices

# 2. Copy environment file
cp .env.production .env

# 3. Build và start services
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Check logs
docker-compose -f docker-compose.prod.yml logs -f

# 5. Check status
docker-compose -f docker-compose.prod.yml ps
```

### **Health Check URLs:**

- **Frontend**: https://your-domain.com/
- **API Health**: https://your-domain.com/health
- **RabbitMQ Management**: https://your-domain.com:15672 (admin/your_password)

### **Monitoring Commands:**

```bash
# Check container status
docker ps

# Check logs
docker logs microservices-nginx
docker logs microservices-api-gateway
docker logs microservices-auth-service

# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
netstat -tulpn | grep :443
netstat -tulpn | grep :80
```
