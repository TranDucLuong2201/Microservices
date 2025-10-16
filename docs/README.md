# 📚 MICROSERVICES PROJECT DOCUMENTATION

## 🎯 **TỔNG QUAN DỰ ÁN**

Dự án **Microservices Architecture** được xây dựng với Node.js, sử dụng gRPC để giao tiếp giữa các service, RabbitMQ để xử lý message queue, MongoDB với Mongoose để lưu trữ dữ liệu, và React với Vite cho frontend.

### **🏗️ Kiến trúc hệ thống**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (React)       │◄──►│   (Express)     │◄──►│   (gRPC)        │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 50051   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  User Service   │    │  Todo Service   │
                       │   (gRPC)        │    │   (gRPC)        │
                       │  Port: 50052    │    │  Port: 50053    │
                       └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ MongoDB User    │    │ MongoDB Todo    │
                       │ Port: 27018     │    │ Port: 27019     │
                       └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   RabbitMQ      │    │ MongoDB Auth    │
                       │ Port: 5672      │    │ Port: 27017     │
                       │ Management:15672 │    └─────────────────┘
                       └─────────────────┘
```

### **🔧 Công nghệ sử dụng**

#### **Backend Stack:**
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework cho API Gateway
- **gRPC** - Communication protocol giữa microservices
- **Protocol Buffers** - Serialization format
- **MongoDB** - NoSQL database với Mongoose ODM
- **RabbitMQ** - Message broker cho event-driven communication
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Docker** - Containerization

#### **Frontend Stack:**
- **React 18** - Frontend framework
- **Vite** - Build tool và development server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Context API** - State management

#### **Infrastructure:**
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy và load balancer
- **Azure Cosmos DB** - Managed MongoDB service
- **Azure Service Bus** - Managed message queue
- **SSL/TLS** - Secure communication

---

## 📁 **CẤU TRÚC THƯ MỤC**

```
Microservices/
├── 📁 api-gateway/              # API Gateway service
│   ├── 📁 grpc/                 # gRPC client configurations
│   ├── 📁 middleware/           # Authentication middleware
│   ├── 📁 proto/                # Protocol buffer definitions
│   ├── 📁 routes/               # Express routes
│   ├── 📁 src/                  # Source code
│   ├── 📄 Dockerfile            # Docker configuration
│   └── 📄 package.json          # Dependencies
├── 📁 auth-service/             # Authentication service
│   ├── 📁 src/
│   │   ├── 📁 config/           # Database configuration
│   │   ├── 📁 grpc/             # gRPC server implementation
│   │   ├── 📁 models/           # Mongoose models
│   │   ├── 📁 proto/            # Protocol buffer definitions
│   │   ├── 📁 service/          # Business logic
│   │   └── 📁 utils/            # Utilities (RabbitMQ)
│   ├── 📄 Dockerfile            # Docker configuration
│   └── 📄 package.json          # Dependencies
├── 📁 user-service/             # User management service
│   ├── 📁 src/
│   │   ├── 📁 config/           # Database configuration
│   │   ├── 📁 events/           # Event consumers
│   │   ├── 📁 grpc/             # gRPC server implementation
│   │   ├── 📁 models/           # Mongoose models
│   │   ├── 📁 proto/            # Protocol buffer definitions
│   │   └── 📁 service/          # Business logic
│   ├── 📄 Dockerfile            # Docker configuration
│   └── 📄 package.json          # Dependencies
├── 📁 todo-service/             # Todo management service
│   ├── 📁 src/
│   │   ├── 📁 config/           # Database configuration
│   │   ├── 📁 grpc/             # gRPC server implementation
│   │   ├── 📁 models/           # Mongoose models
│   │   ├── 📁 proto/            # Protocol buffer definitions
│   │   ├── 📁 service/          # Business logic
│   │   └── 📁 utils/            # Utilities (RabbitMQ)
│   ├── 📄 Dockerfile            # Docker configuration
│   └── 📄 package.json          # Dependencies
├── 📁 frontend/                 # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/       # React components
│   │   ├── 📁 contexts/         # React contexts
│   │   ├── 📁 pages/            # Page components
│   │   ├── 📄 App.jsx           # Main App component
│   │   └── 📄 main.jsx          # Entry point
│   ├── 📄 Dockerfile            # Multi-stage build
│   ├── 📄 nginx.conf            # Frontend nginx config
│   └── 📄 package.json          # Dependencies
├── 📁 nginx/                    # Reverse proxy configuration
│   └── 📄 nginx.conf            # Main nginx config
├── 📁 docs/                     # Documentation
│   ├── 📄 architecture.md       # Architecture overview
│   ├── 📄 api-documentation.md  # API documentation
│   ├── 📄 deployment.md         # Deployment guide
│   ├── 📄 configuration.md      # Configuration guide
│   └── 📄 troubleshooting.md    # Troubleshooting guide
├── 📄 docker-compose.yml        # Development configuration
├── 📄 docker-compose.prod.yml   # Production configuration
├── 📄 env.production.example    # Environment variables template
└── 📄 README.md                 # Project overview
```

---

## 🔄 **DATA FLOW**

### **1. Authentication Flow**
```
User → Frontend → API Gateway → Auth Service → MongoDB Auth
  ↓
JWT Token ← API Gateway ← Auth Service
  ↓
Frontend stores token
```

### **2. Todo Management Flow**
```
User → Frontend → API Gateway → Todo Service → MongoDB Todo
  ↓
Event → RabbitMQ → User Service → MongoDB User (update stats)
```

### **3. User Profile Flow**
```
User → Frontend → API Gateway → User Service → MongoDB User
  ↓
Profile data ← API Gateway ← User Service
```

---

## 🚀 **QUICK START**

### **Development Environment**
```bash
# Clone repository
git clone <repository-url>
cd microservices

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### **Production Environment**
```bash
# Copy environment file
cp env.production.example .env.production

# Edit environment variables
nano .env.production

# Deploy production
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📊 **MONITORING & HEALTH CHECKS**

### **Health Check Endpoints**
- **Frontend**: `https://your-domain.com/`
- **API Gateway**: `https://your-domain.com/health`
- **RabbitMQ Management**: `https://your-domain.com:15672`

### **Monitoring Commands**
```bash
# Check container status
docker ps

# View logs
docker logs microservices-api-gateway

# Check database connections
docker exec microservices-auth-service node -e "console.log('DB connected')"
```

---

## 🔒 **SECURITY FEATURES**

- ✅ **SSL/TLS** - HTTPS encryption
- ✅ **JWT Authentication** - Token-based auth
- ✅ **Rate Limiting** - API protection
- ✅ **Security Headers** - XSS, CSRF protection
- ✅ **Database Separation** - Isolated data
- ✅ **Environment Variables** - Secure configuration

---

## 📈 **SCALABILITY**

- ✅ **Microservices Architecture** - Independent scaling
- ✅ **Load Balancing** - Nginx reverse proxy
- ✅ **Database Separation** - Independent databases
- ✅ **Message Queue** - Asynchronous processing
- ✅ **Container Orchestration** - Docker Compose

---

## 🎯 **NEXT STEPS**

1. **Deploy to Azure** - Follow deployment guides
2. **Setup Monitoring** - Application insights
3. **Implement CI/CD** - GitHub Actions
4. **Add Tests** - Unit và integration tests
5. **Performance Optimization** - Caching, CDN

---

**📚 Xem các tài liệu chi tiết trong folder `docs/` để hiểu sâu hơn về từng component!**
