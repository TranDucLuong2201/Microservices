# 🌐 API DOCUMENTATION

## 🎯 **TỔNG QUAN API**

Hệ thống microservices cung cấp RESTful API thông qua API Gateway với các endpoints sau:

- **Authentication API** - Đăng ký, đăng nhập, xác thực
- **User API** - Quản lý thông tin người dùng
- **Todo API** - Quản lý todo items
- **Health Check API** - Kiểm tra trạng thái hệ thống

---

## 🔐 **AUTHENTICATION API**

### **Base URL**
```
Development: http://localhost:3000/api/auth
Production: https://your-domain.com/api/auth
```

### **Endpoints**

#### **1. User Registration**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

#### **2. User Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### **3. Token Verification**
```http
POST /api/auth/verify-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

## 👤 **USER API**

### **Base URL**
```
Development: http://localhost:3000/api/users
Production: https://your-domain.com/api/users
```

### **Headers Required**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Endpoints**

#### **1. Get User Profile**
```http
GET /api/users/:userId
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software Developer",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "stats": {
      "totalTodos": 15,
      "completedTodos": 8
    },
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **2. Update User Profile**
```http
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "bio": "Senior Software Developer",
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "john@example.com",
    "bio": "Senior Software Developer",
    "preferences": {
      "theme": "light",
      "notifications": false
    },
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **3. Get User Statistics**
```http
GET /api/users/:userId/profile
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "profile": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "stats": {
      "totalTodos": 15,
      "completedTodos": 8,
      "pendingTodos": 7,
      "completionRate": 53.33
    },
    "recentActivity": [
      {
        "action": "todo_created",
        "description": "Created todo: Learn React",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## ✅ **TODO API**

### **Base URL**
```
Development: http://localhost:3000/api/todos
Production: https://your-domain.com/api/todos
```

### **Headers Required**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Endpoints**

#### **1. Create Todo**
```http
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Learn React Hooks",
  "description": "Study React hooks and build a project",
  "priority": "high",
  "category": "learning",
  "tags": ["react", "javascript", "frontend"],
  "dueDate": "2024-01-15T00:00:00.000Z"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "todo": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Learn React Hooks",
    "description": "Study React hooks and build a project",
    "completed": false,
    "priority": "high",
    "category": "learning",
    "tags": ["react", "javascript", "frontend"],
    "dueDate": "2024-01-15T00:00:00.000Z",
    "userId": "507f1f77bcf86cd799439011",
    "isArchived": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **2. Get User Todos**
```http
GET /api/todos
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `completed` (optional): Filter by completion status
- `priority` (optional): Filter by priority
- `category` (optional): Filter by category
- `search` (optional): Search in title and description

**Example:**
```http
GET /api/todos?page=1&limit=20&completed=false&priority=high
```

**Response Success (200):**
```json
{
  "success": true,
  "todos": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Learn React Hooks",
      "description": "Study React hooks and build a project",
      "completed": false,
      "priority": "high",
      "category": "learning",
      "tags": ["react", "javascript"],
      "dueDate": "2024-01-15T00:00:00.000Z",
      "userId": "507f1f77bcf86cd799439011",
      "isArchived": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### **3. Get Single Todo**
```http
GET /api/todos/:todoId
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "todo": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Learn React Hooks",
    "description": "Study React hooks and build a project",
    "completed": false,
    "priority": "high",
    "category": "learning",
    "tags": ["react", "javascript"],
    "dueDate": "2024-01-15T00:00:00.000Z",
    "userId": "507f1f77bcf86cd799439011",
    "isArchived": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **4. Update Todo**
```http
PUT /api/todos/:todoId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Learn React Hooks - Updated",
  "description": "Study React hooks and build a project with TypeScript",
  "priority": "medium",
  "completed": true
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "todo": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Learn React Hooks - Updated",
    "description": "Study React hooks and build a project with TypeScript",
    "completed": true,
    "priority": "medium",
    "category": "learning",
    "tags": ["react", "javascript"],
    "dueDate": "2024-01-15T00:00:00.000Z",
    "userId": "507f1f77bcf86cd799439011",
    "isArchived": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **5. Toggle Todo Completion**
```http
PATCH /api/todos/:todoId/toggle
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Todo status updated",
  "todo": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Learn React Hooks",
    "completed": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **6. Delete Todo**
```http
DELETE /api/todos/:todoId
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

---

## 🏥 **HEALTH CHECK API**

### **Base URL**
```
Development: http://localhost:3000/health
Production: https://your-domain.com/health
```

### **Endpoints**

#### **1. System Health Check**
```http
GET /health
```

**Response Success (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 45678592,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1024000
  },
  "version": "1.0.0",
  "services": {
    "auth-service": "healthy",
    "user-service": "healthy",
    "todo-service": "healthy",
    "database": "connected",
    "rabbitmq": "connected"
  }
}
```

---

## 📊 **ERROR RESPONSES**

### **Standard Error Format**
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **HTTP Status Codes**

#### **Success Codes**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content returned

#### **Client Error Codes**
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation failed

#### **Server Error Codes**
- `500 Internal Server Error` - Server error
- `502 Bad Gateway` - Service unavailable
- `503 Service Unavailable` - Service temporarily unavailable

### **Common Error Examples**

#### **Validation Error (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

#### **Authentication Error (401)**
```json
{
  "success": false,
  "message": "Access token required",
  "error": "AUTHENTICATION_REQUIRED"
}
```

#### **Authorization Error (403)**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "AUTHORIZATION_FAILED"
}
```

#### **Not Found Error (404)**
```json
{
  "success": false,
  "message": "Todo not found",
  "error": "RESOURCE_NOT_FOUND"
}
```

---

## 🔒 **AUTHENTICATION & AUTHORIZATION**

### **JWT Token Format**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

### **Token Usage**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Token Expiration**
- **Access Token**: 24 hours
- **Refresh Token**: 7 days (future implementation)

---

## 📈 **RATE LIMITING**

### **Rate Limits**
- **General API**: 10 requests/second per IP
- **Login Endpoint**: 5 requests/minute per IP
- **Registration**: 3 requests/minute per IP

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

### **Rate Limit Exceeded Response (429)**
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "error": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 🧪 **TESTING THE API**

### **Using cURL**

#### **Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### **Login User**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### **Create Todo**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Learn React",
    "description": "Study React fundamentals",
    "priority": "high"
  }'
```

### **Using Postman**
1. Import collection từ file `docs/postman-collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: JWT token từ login response
3. Run requests trong collection

---

## 📚 **SDK & CLIENT LIBRARIES**

### **JavaScript/Node.js**
```javascript
// Example API client
class TodoAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async createTodo(todoData) {
    const response = await fetch(`${this.baseURL}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(todoData)
    });
    return response.json();
  }

  async getTodos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/todos?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }
}

// Usage
const api = new TodoAPI('http://localhost:3000', 'your-jwt-token');
const todos = await api.getTodos({ completed: false });
```

### **Python**
```python
import requests

class TodoAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_todo(self, todo_data):
        response = requests.post(
            f'{self.base_url}/api/todos',
            json=todo_data,
            headers=self.headers
        )
        return response.json()
    
    def get_todos(self, params=None):
        response = requests.get(
            f'{self.base_url}/api/todos',
            params=params,
            headers=self.headers
        )
        return response.json()

# Usage
api = TodoAPI('http://localhost:3000', 'your-jwt-token')
todos = api.get_todos({'completed': False})
```

---

**📚 API này được thiết kế để dễ sử dụng, có documentation rõ ràng và hỗ trợ đầy đủ các tính năng cần thiết!**
