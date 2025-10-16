# 🗄️ CẤU HÌNH MONGODB TRÊN AZURE

## 🎯 **TẠI SAO CẦN CẤU HÌNH MONGODB TRÊN AZURE?**

Hiện tại project đang dùng MongoDB local trong Docker containers. Để deploy lên Azure production, bạn cần:

- ✅ **Azure Cosmos DB** (MongoDB API) thay vì MongoDB local
- ✅ **Managed database** - Azure tự động backup, scale, security
- ✅ **High availability** - 99.99% uptime guarantee
- ✅ **Global distribution** - có thể scale ra nhiều regions

---

## 🚀 **BƯỚC 1: TẠO AZURE COSMOS DB**

### **1.1 Tạo Resource Group (nếu chưa có)**
```bash
az group create --name microservices-rg --location eastus
```

### **1.2 Tạo 3 Cosmos DB instances cho 3 services**

**Auth Service Database:**
```bash
az cosmosdb create \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-auth \
  --kind MongoDB \
  --locations regionName=eastus \
  --default-consistency-level Session
```

**User Service Database:**
```bash
az cosmosdb create \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-user \
  --kind MongoDB \
  --locations regionName=eastus \
  --default-consistency-level Session
```

**Todo Service Database:**
```bash
az cosmosdb create \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-todo \
  --kind MongoDB \
  --locations regionName=eastus \
  --default-consistency-level Session
```

---

## 🔑 **BƯỚC 2: LẤY CONNECTION STRINGS**

### **2.1 Lấy connection string cho Auth Service**
```bash
az cosmosdb keys list \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-auth \
  --type connection-strings
```

**Kết quả sẽ như:**
```
mongodb://microservices-cosmosdb-auth:ABC123...@microservices-cosmosdb-auth.mongo.cosmos.azure.com:10255/auth-service?ssl=true&replicaSet=globaldb
```

### **2.2 Lấy connection string cho User Service**
```bash
az cosmosdb keys list \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-user \
  --type connection-strings
```

### **2.3 Lấy connection string cho Todo Service**
```bash
az cosmosdb keys list \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-todo \
  --type connection-strings
```

---

## 🔒 **BƯỚC 3: CẤU HÌNH SECURITY**

### **3.1 Cho phép Azure Services truy cập**
```bash
# Auth Service
az cosmosdb update \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-auth \
  --enable-public-network true

# User Service  
az cosmosdb update \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-user \
  --enable-public-network true

# Todo Service
az cosmosdb update \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-todo \
  --enable-public-network true
```

---

## ⚙️ **BƯỚC 4: CẬP NHẬT ENVIRONMENT VARIABLES**

### **4.1 Tạo file `.env.production`**
```bash
cp env.production.example .env.production
```

### **4.2 Cập nhật connection strings**
Mở file `.env.production` và thay thế:

```env
# Thay YOUR_PRIMARY_KEY bằng key thực tế từ Azure CLI
MONGODB_AUTH_URI=mongodb://microservices-cosmosdb-auth:YOUR_PRIMARY_KEY@microservices-cosmosdb-auth.mongo.cosmos.azure.com:10255/auth-service?ssl=true&replicaSet=globaldb

MONGODB_USER_URI=mongodb://microservices-cosmosdb-user:YOUR_PRIMARY_KEY@microservices-cosmosdb-user.mongo.cosmos.azure.com:10255/user-service?ssl=true&replicaSet=globaldb

MONGODB_TODO_URI=mongodb://microservices-cosmosdb-todo:YOUR_PRIMARY_KEY@microservices-cosmosdb-todo.mongo.cosmos.azure.com:10255/todo-service?ssl=true&replicaSet=globaldb

# RabbitMQ (giữ nguyên)
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your_secure_rabbitmq_password_123

# JWT Secret (tạo mới mạnh)
JWT_SECRET=your_super_secure_jwt_secret_key_for_production_2024

# Azure Service Bus (nếu dùng)
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_ACTUAL_KEY_HERE
```

---

## 🐳 **BƯỚC 5: DEPLOY VỚI DOCKER**

### **5.1 Build và start services**
```bash
# Sử dụng production config
docker-compose -f docker-compose.prod.yml up -d --build
```

### **5.2 Kiểm tra logs**
```bash
# Xem logs của tất cả services
docker-compose -f docker-compose.prod.yml logs -f

# Xem logs của từng service
docker logs microservices-auth-service
docker logs microservices-user-service  
docker logs microservices-todo-service
```

### **5.3 Kiểm tra kết nối database**
```bash
# Check container status
docker ps

# Test API endpoints
curl -k https://localhost/health
curl -k https://localhost/api/auth/verify-token
```

---

## 💰 **CHI PHÍ VÀ OPTIMIZATION**

### **💰 Chi phí ước tính:**
- **Cosmos DB**: ~$25-50/tháng per instance (400 RU/s)
- **Total**: ~$75-150/tháng cho 3 databases
- **Có thể giảm** với autoscale và reserved capacity

### **🔧 Optimization:**
```bash
# Enable autoscale để tiết kiệm chi phí
az cosmosdb sql database throughput update \
  --resource-group microservices-rg \
  --account-name microservices-cosmosdb-auth \
  --name auth-service \
  --max-throughput 4000
```

---

## 🧪 **TEST CONNECTION**

### **6.1 Test từ VM**
```bash
# Cài đặt MongoDB client
sudo apt-get install mongodb-clients

# Test connection
mongo "mongodb://microservices-cosmosdb-auth:YOUR_PRIMARY_KEY@microservices-cosmosdb-auth.mongo.cosmos.azure.com:10255/auth-service?ssl=true&replicaSet=globaldb"
```

### **6.2 Test từ MongoDB Compass**
1. Download MongoDB Compass
2. Paste connection string vào
3. Click "Connect"

---

## 📊 **MONITORING**

### **7.1 Azure Portal**
- Vào Azure Portal → Cosmos DB accounts
- Xem metrics, throughput, errors
- Set up alerts

### **7.2 Application Logs**
```bash
# Xem logs real-time
docker logs -f microservices-auth-service

# Check database connections
docker exec microservices-auth-service node -e "console.log('DB connected')"
```

---

## 🚨 **TROUBLESHOOTING**

### **❌ Lỗi thường gặp:**

**1. Connection timeout:**
```bash
# Check firewall rules
az cosmosdb show --resource-group microservices-rg --name microservices-cosmosdb-auth
```

**2. Authentication failed:**
```bash
# Verify connection string
echo $MONGODB_AUTH_URI
```

**3. SSL certificate error:**
```bash
# Update connection string với ssl=true
MONGODB_AUTH_URI=mongodb://...?ssl=true&replicaSet=globaldb
```

---

## ✅ **CHECKLIST HOÀN THÀNH**

- [ ] ✅ Tạo 3 Azure Cosmos DB instances
- [ ] ✅ Lấy connection strings từ Azure CLI
- [ ] ✅ Cập nhật environment variables
- [ ] ✅ Deploy với Docker Compose production
- [ ] ✅ Test connections và API endpoints
- [ ] ✅ Setup monitoring và alerts
- [ ] ✅ Configure backup và security

---

## 🎉 **KẾT QUẢ CUỐI CÙNG**

Sau khi hoàn thành, bạn sẽ có:

- ✅ **3 Azure Cosmos DB instances** thay vì MongoDB local
- ✅ **Managed database** với auto-backup và scaling
- ✅ **High availability** 99.99% uptime
- ✅ **Secure connections** với SSL/TLS
- ✅ **Production-ready** microservices architecture

**🚀 Bây giờ bạn có thể deploy lên Azure VM với database managed hoàn toàn!**
