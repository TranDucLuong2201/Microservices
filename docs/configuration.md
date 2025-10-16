# 🔧 CẤU HÌNH HỆ THỐNG

## 🎯 **TỔNG QUAN CẤU HÌNH**

Tài liệu này mô tả chi tiết cách cấu hình từng component trong hệ thống microservices, bao gồm:

- **Environment Variables** - Biến môi trường
- **Database Configuration** - Cấu hình database
- **Network Configuration** - Cấu hình mạng
- **Security Configuration** - Cấu hình bảo mật
- **Docker Configuration** - Cấu hình container

---

## 🔐 **ENVIRONMENT VARIABLES**

### **Development Environment (.env)**

#### **API Gateway**
```env
PORT=3000
AUTH_SERVICE_URL=auth-service:50051
USER_SERVICE_URL=user-service:50052
TODO_SERVICE_URL=todo-service:50053
NODE_ENV=development
```

#### **Auth Service**
```env
GRPC_PORT=50051
JWT_SECRET=your-super-secret-jwt-key-for-development
MONGODB_URI=mongodb://admin:password@mongodb-auth:27017/auth-service?authSource=admin
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
NODE_ENV=development
```

#### **User Service**
```env
GRPC_PORT=50052
MONGODB_URI=mongodb://admin:password@mongodb-user:27017/user-service?authSource=admin
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
NODE_ENV=development
```

#### **Todo Service**
```env
GRPC_PORT=50053
MONGODB_URI=mongodb://admin:password@mongodb-todo:27017/todo-service?authSource=admin
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
NODE_ENV=development
```

#### **Frontend**
```env
VITE_API_URL=http://localhost:3000
VITE_NODE_ENV=development
```

### **Production Environment (.env.production)**

#### **Azure Cosmos DB Configuration**
```env
# Auth Service Database
MONGODB_AUTH_URI=mongodb://microservices-cosmosdb-auth:YOUR_PRIMARY_KEY@microservices-cosmosdb-auth.mongo.cosmos.azure.com:10255/auth-service?ssl=true&replicaSet=globaldb

# User Service Database
MONGODB_USER_URI=mongodb://microservices-cosmosdb-user:YOUR_PRIMARY_KEY@microservices-cosmosdb-user.mongo.cosmos.azure.com:10255/user-service?ssl=true&replicaSet=globaldb

# Todo Service Database
MONGODB_TODO_URI=mongodb://microservices-cosmosdb-todo:YOUR_PRIMARY_KEY@microservices-cosmosdb-todo.mongo.cosmos.azure.com:10255/todo-service?ssl=true&replicaSet=globaldb

# RabbitMQ (Local container)
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your_secure_rabbitmq_password_123

# JWT Secret (Generate strong secret)
JWT_SECRET=your_super_secure_jwt_secret_key_for_production_2024

# Azure Service Bus (Optional - thay thế RabbitMQ)
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_ACTUAL_KEY_HERE
```

---

## 🗄️ **DATABASE CONFIGURATION**

### **MongoDB Connection Settings**

#### **Development (Local MongoDB)**
```javascript
// auth-service/src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

#### **Production (Azure Cosmos DB)**
```javascript
// auth-service/src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            sslValidate: true,
            authSource: 'admin',
            retryWrites: false,
            maxIdleTimeMS: 120000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### **Database Schemas**

#### **User Model (Auth Service)**
```javascript
// auth-service/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema);
```

#### **User Model (User Service)**
```javascript
// user-service/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    stats: {
        totalTodos: {
            type: Number,
            default: 0
        },
        completedTodos: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

#### **Todo Model**
```javascript
// todo-service/src/models/Todo.js
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        trim: true,
        default: 'general'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for performance
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, completed: 1 });
todoSchema.index({ userId: 1, priority: 1 });

module.exports = mongoose.model('Todo', todoSchema);
```

---

## 🌐 **NETWORK CONFIGURATION**

### **Docker Network Configuration**

#### **Development (docker-compose.yml)**
```yaml
networks:
  microservices-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

#### **Production (docker-compose.prod.yml)**
```yaml
networks:
  microservices-network:
    driver: bridge
    internal: false
```

### **Port Configuration**

#### **Development Ports**
```yaml
services:
  frontend:
    ports:
      - "5173:80"        # Frontend development server
  
  api-gateway:
    ports:
      - "3000:3000"      # API Gateway
  
  auth-service:
    ports:
      - "50051:50051"    # Auth Service gRPC
  
  user-service:
    ports:
      - "50052:50052"    # User Service gRPC
  
  todo-service:
    ports:
      - "50053:50053"    # Todo Service gRPC
  
  mongodb-auth:
    ports:
      - "27017:27017"    # MongoDB Auth
  
  mongodb-user:
    ports:
      - "27018:27017"    # MongoDB User
  
  mongodb-todo:
    ports:
      - "27019:27017"    # MongoDB Todo
  
  rabbitmq:
    ports:
      - "5672:5672"      # RabbitMQ AMQP
      - "15672:15672"    # RabbitMQ Management UI
```

#### **Production Ports**
```yaml
services:
  nginx:
    ports:
      - "80:80"          # HTTP
      - "443:443"        # HTTPS
  
  # Internal services không expose ports
  # Chỉ communicate qua Docker network
```

---

## 🔒 **SECURITY CONFIGURATION**

### **JWT Configuration**

#### **JWT Secret Generation**
```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **JWT Middleware**
```javascript
// api-gateway/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };
```

### **Rate Limiting Configuration**

#### **Nginx Rate Limiting**
```nginx
# nginx/nginx.conf
http {
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    server {
        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api-gateway:3000;
        }
        
        # Login rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://api-gateway:3000;
        }
    }
}
```

### **SSL/TLS Configuration**

#### **SSL Certificate Setup**
```bash
# Generate self-signed certificate (development)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Production certificates (Let's Encrypt)
certbot --nginx -d your-domain.com
```

#### **Nginx SSL Configuration**
```nginx
# nginx/nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
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
}
```

---

## 🐳 **DOCKER CONFIGURATION**

### **Dockerfile Best Practices**

#### **Multi-stage Build (Frontend)**
```dockerfile
# frontend/Dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **Optimized Build (Backend Services)**
```dockerfile
# auth-service/Dockerfile
FROM node:18-alpine

# Install dependencies first (for better caching)
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check')" || exit 1

EXPOSE 50051
CMD ["npm", "start"]
```

### **Docker Compose Configuration**

#### **Development Configuration**
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Database services
  mongodb-auth:
    image: mongo:7.0
    container_name: microservices-mongodb-auth
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: auth-service
    volumes:
      - mongodb_auth_data:/data/db
    networks:
      - microservices-network

  # Application services
  auth-service:
    build: ./auth-service
    container_name: microservices-auth-service
    restart: unless-stopped
    ports:
      - "50051:50051"
    environment:
      GRPC_PORT: 50051
      JWT_SECRET: your-super-secret-jwt-key-for-development
      MONGODB_URI: mongodb://admin:password@mongodb-auth:27017/auth-service?authSource=admin
      RABBITMQ_URL: amqp://admin:password@rabbitmq:5672
    depends_on:
      - mongodb-auth
      - rabbitmq
    networks:
      - microservices-network

volumes:
  mongodb_auth_data:

networks:
  microservices-network:
    driver: bridge
```

#### **Production Configuration**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Application services (no database containers)
  auth-service:
    build: ./auth-service
    container_name: microservices-auth-service
    restart: unless-stopped
    environment:
      GRPC_PORT: 50051
      JWT_SECRET: ${JWT_SECRET}
      MONGODB_URI: ${MONGODB_AUTH_URI}
      AZURE_SERVICE_BUS_CONNECTION_STRING: ${AZURE_SERVICE_BUS_CONNECTION_STRING}
    networks:
      - microservices-network

  # Reverse proxy
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

networks:
  microservices-network:
    driver: bridge
```

---

## 📊 **MONITORING CONFIGURATION**

### **Health Check Configuration**

#### **Application Health Checks**
```javascript
// api-gateway/src/index.js
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
```

#### **Docker Health Checks**
```dockerfile
# Health check for services
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### **Logging Configuration**

#### **Structured Logging**
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

module.exports = logger;
```

---

## 🔧 **PERFORMANCE CONFIGURATION**

### **Database Optimization**

#### **Connection Pooling**
```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferMaxEntries: 0 // Disable mongoose buffering
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};
```

#### **Indexing Strategy**
```javascript
// models/Todo.js
// Compound indexes for common queries
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, completed: 1 });
todoSchema.index({ userId: 1, priority: 1 });
todoSchema.index({ userId: 1, category: 1 });
```

### **Caching Configuration**

#### **Redis Configuration (Future)**
```javascript
// config/redis.js
const redis = require('redis');

const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

module.exports = client;
```

---

## 🚀 **DEPLOYMENT CONFIGURATION**

### **Environment-specific Configurations**

#### **Development**
- **Hot Reloading** - nodemon cho development
- **Debug Mode** - Verbose logging
- **Local Databases** - MongoDB containers
- **HTTP Only** - No SSL required

#### **Production**
- **Optimized Builds** - Minified và compressed
- **SSL/TLS** - HTTPS required
- **Managed Databases** - Azure Cosmos DB
- **Monitoring** - Application insights
- **Backup** - Automated backups

---

**📚 Cấu hình này đảm bảo hệ thống hoạt động ổn định, bảo mật và có thể scale trong production!**
