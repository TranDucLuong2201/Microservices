# 🏗️ KIẾN TRÚC HỆ THỐNG

## 🎯 **TỔNG QUAN KIẾN TRÚC**

Dự án sử dụng **Microservices Architecture** với các đặc điểm:

- **Decoupled Services** - Các service độc lập
- **Event-Driven Communication** - Giao tiếp qua events
- **Database per Service** - Mỗi service có database riêng
- **API Gateway Pattern** - Single entry point
- **Containerized Deployment** - Docker containers

---

## 🔧 **COMPONENT ARCHITECTURE**

### **1. Frontend Layer**
```
┌─────────────────────────────────────┐
│           React Frontend            │
│  - Authentication UI                │
│  - Todo Management UI              │
│  - User Profile UI                 │
│  - Responsive Design               │
└─────────────────────────────────────┘
```

**Responsibilities:**
- User interface và user experience
- Client-side routing với React Router
- State management với Context API
- HTTP requests với Axios
- Form validation và error handling

### **2. API Gateway Layer**
```
┌─────────────────────────────────────┐
│           API Gateway               │
│  - Request Routing                  │
│  - Authentication Middleware       │
│  - Rate Limiting                   │
│  - Load Balancing                   │
└─────────────────────────────────────┘
```

**Responsibilities:**
- Single entry point cho tất cả requests
- Authentication và authorization
- Request routing đến microservices
- Rate limiting và security
- Response aggregation

### **3. Microservices Layer**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│Auth Service │ │User Service │ │Todo Service │
│- Login      │ │- Profile    │ │- CRUD       │
│- Register   │ │- Stats      │ │- Priority   │
│- JWT        │ │- Events     │ │- Events     │
└─────────────┘ └─────────────┘ └─────────────┘
```

**Responsibilities:**
- **Auth Service**: Authentication, JWT generation
- **User Service**: User management, profile, statistics
- **Todo Service**: Todo CRUD operations, priority management

### **4. Data Layer**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│MongoDB Auth │ │MongoDB User │ │MongoDB Todo │
│- Users      │ │- Profiles    │ │- Todos      │
│- Sessions   │ │- Stats      │ │- Categories │
└─────────────┘ └─────────────┘ └─────────────┘
```

**Responsibilities:**
- **MongoDB Auth**: User credentials, sessions
- **MongoDB User**: User profiles, statistics
- **MongoDB Todo**: Todo items, categories, priorities

### **5. Message Queue Layer**
```
┌─────────────────────────────────────┐
│            RabbitMQ                 │
│  - Event Publishing                 │
│  - Event Consumption                │
│  - Message Routing                  │
│  - Dead Letter Queues               │
└─────────────────────────────────────┘
```

**Responsibilities:**
- Event-driven communication
- Asynchronous processing
- Service decoupling
- Message persistence

---

## 🔄 **COMMUNICATION PATTERNS**

### **1. Synchronous Communication (gRPC)**
```
API Gateway ←→ Auth Service
API Gateway ←→ User Service  
API Gateway ←→ Todo Service
```

**Use Cases:**
- Real-time data requests
- Authentication verification
- CRUD operations
- Immediate responses

### **2. Asynchronous Communication (RabbitMQ)**
```
Auth Service → RabbitMQ → User Service
Todo Service → RabbitMQ → User Service
```

**Use Cases:**
- Event notifications
- Statistics updates
- Background processing
- Service decoupling

---

## 📊 **DATA FLOW DIAGRAMS**

### **Authentication Flow**
```
1. User submits login form
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. API Gateway receives request
   ↓
4. API Gateway calls Auth Service (gRPC)
   ↓
5. Auth Service validates credentials
   ↓
6. Auth Service queries MongoDB Auth
   ↓
7. Auth Service generates JWT token
   ↓
8. Auth Service publishes "user.logged_in" event
   ↓
9. API Gateway returns token to Frontend
   ↓
10. Frontend stores token và redirects to Dashboard
```

### **Todo Creation Flow**
```
1. User creates new todo
   ↓
2. Frontend sends POST /api/todos
   ↓
3. API Gateway authenticates request
   ↓
4. API Gateway calls Todo Service (gRPC)
   ↓
5. Todo Service saves to MongoDB Todo
   ↓
6. Todo Service publishes "todo.created" event
   ↓
7. User Service consumes event
   ↓
8. User Service updates user statistics
   ↓
9. API Gateway returns success to Frontend
```

### **User Profile Update Flow**
```
1. User updates profile
   ↓
2. Frontend sends PUT /api/users/:id
   ↓
3. API Gateway authenticates request
   ↓
4. API Gateway calls User Service (gRPC)
   ↓
5. User Service updates MongoDB User
   ↓
6. User Service publishes "user.updated" event
   ↓
7. API Gateway returns updated profile
   ↓
8. Frontend updates UI
```

---

## 🔒 **SECURITY ARCHITECTURE**

### **Authentication & Authorization**
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │
│   - JWT Storage │◄──►│   - JWT Verify  │
│   - Token Send  │    │   - Auth Check  │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Auth Service   │
                       │   - JWT Sign    │
                       │   - JWT Verify  │
                       └─────────────────┘
```

### **Data Security**
- **Database Separation** - Mỗi service có database riêng
- **Encrypted Communication** - SSL/TLS cho tất cả connections
- **Environment Variables** - Sensitive data không hardcode
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Sanitize tất cả inputs

---

## 📈 **SCALABILITY PATTERNS**

### **Horizontal Scaling**
```
┌─────────────┐    ┌─────────────┐
│Auth Service │    │Auth Service │
│Instance 1   │    │Instance 2   │
└─────────────┘    └─────────────┘
         │                  │
         └────────┬─────────┘
                  │
         ┌─────────────┐
         │Load Balancer│
         └─────────────┘
```

### **Database Scaling**
```
┌─────────────┐    ┌─────────────┐
│MongoDB Auth │    │MongoDB User │
│Primary      │    │Primary      │
└─────────────┘    └─────────────┘
         │                  │
         ▼                  ▼
┌─────────────┐    ┌─────────────┐
│MongoDB Auth │    │MongoDB User │
│Secondary    │    │Secondary    │
└─────────────┘    └─────────────┘
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Development Environment**
```
┌─────────────────────────────────────┐
│         Docker Compose              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │Frontend │ │API GW   │ │Services │ │
│  │:5173    │ │:3000    │ │:50051+  │ │
│  └─────────┘ └─────────┘ └─────────┘ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │MongoDB  │ │RabbitMQ │ │Nginx    │ │
│  │:27017+  │ │:5672    │ │:80/443 │ │
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

## 🔧 **TECHNICAL DECISIONS**

### **Why gRPC?**
- **Performance** - Binary protocol, faster than HTTP/JSON
- **Type Safety** - Protocol buffers provide strong typing
- **Streaming** - Support for streaming requests/responses
- **Code Generation** - Automatic client/server code generation

### **Why MongoDB?**
- **Flexibility** - Schema-less, easy to evolve
- **Scalability** - Horizontal scaling support
- **Performance** - Fast read/write operations
- **Ecosystem** - Rich tooling và community

### **Why RabbitMQ?**
- **Reliability** - Message persistence và delivery guarantees
- **Routing** - Flexible message routing patterns
- **Management** - Web-based management interface
- **Clustering** - High availability support

### **Why React?**
- **Component-based** - Reusable UI components
- **Virtual DOM** - Efficient rendering
- **Ecosystem** - Rich library ecosystem
- **Developer Experience** - Great tooling và debugging

---

## 📊 **PERFORMANCE CHARACTERISTICS**

### **Expected Performance**
- **API Response Time**: < 200ms
- **Database Query Time**: < 50ms
- **Frontend Load Time**: < 2s
- **Concurrent Users**: 1000+
- **Throughput**: 1000 requests/second

### **Bottlenecks**
- **Database Connections** - Connection pooling
- **Network Latency** - CDN và caching
- **Memory Usage** - Container resource limits
- **CPU Usage** - Load balancing

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Short Term**
- **Caching Layer** - Redis cho session storage
- **API Versioning** - Backward compatibility
- **Monitoring** - Application performance monitoring
- **Testing** - Unit và integration tests

### **Long Term**
- **Kubernetes** - Container orchestration
- **Service Mesh** - Istio cho service communication
- **Event Sourcing** - Complete audit trail
- **CQRS** - Command Query Responsibility Segregation

---

**📚 Kiến trúc này được thiết kế để dễ dàng scale, maintain và extend trong tương lai!**
