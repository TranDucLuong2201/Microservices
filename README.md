# Microservices Architecture Project với Mongoose và React

Dự án microservices được xây dựng với Node.js, sử dụng gRPC để giao tiếp giữa các service, RabbitMQ để xử lý message queue, MongoDB với Mongoose để lưu trữ dữ liệu, và React với Vite cho frontend.

## 🏗️ Kiến trúc hệ thống

Dự án bao gồm 5 thành phần chính:

- **API Gateway** - Cổng vào chính, xử lý các HTTP request và định tuyến đến các microservice
- **Auth Service** - Quản lý xác thực và phân quyền người dùng với MongoDB
- **User Service** - Quản lý thông tin người dùng với MongoDB
- **Todo Service** - Quản lý các task/todo của người dùng với MongoDB
- **Frontend** - React application với Vite và React Router DOM

## 📁 Cấu trúc thư mục

```
Microservices/
├── api-gateway/          # API Gateway service
│   ├── grpc/            # gRPC client configurations
│   ├── middleware/      # Authentication middleware
│   ├── proto/           # Protocol buffer definitions
│   ├── routes/          # Express routes
│   ├── src/             # Source code
│   └── Dockerfile       # Docker configuration
├── auth-service/        # Authentication service
│   ├── src/
│   │   ├── config/      # Database configuration (Mongoose)
│   │   ├── grpc/        # gRPC server implementation
│   │   ├── models/      # Mongoose models
│   │   ├── proto/       # Protocol buffer definitions
│   │   ├── service/     # Business logic
│   │   └── utils/       # Utilities (RabbitMQ)
│   └── Dockerfile       # Docker configuration
├── todo-service/        # Todo management service
│   ├── src/             # Similar structure to auth-service
│   └── Dockerfile       # Docker configuration
├── user-service/        # User management service
│   ├── src/             # Similar structure to auth-service
│   └── Dockerfile       # Docker configuration
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Auth, Todo)
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main App component
│   ├── Dockerfile       # Docker configuration
│   └── nginx.conf       # Nginx configuration
├── docker-compose.yml   # Docker Compose configuration
└── AZURE_DEPLOYMENT.md  # Azure deployment guide
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js (v18 trở lên)
- Docker và Docker Compose
- MongoDB (hoặc sử dụng Docker)
- RabbitMQ (hoặc sử dụng Docker)
- npm hoặc yarn

### Cách 1: Chạy với Docker Compose (Khuyến nghị)

```bash
# Clone repository
git clone <repository-url>
cd microservices

# Chạy tất cả services với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

Services sẽ chạy trên các port sau:
- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- MongoDB: localhost:27017
- RabbitMQ Management: http://localhost:15672 (admin/password)

### Cách 2: Chạy từng service riêng lẻ

#### 1. Cài đặt dependencies

```bash
# Cài đặt dependencies cho tất cả services
cd api-gateway && npm install
cd ../auth-service && npm install
cd ../todo-service && npm install
cd ../user-service && npm install
cd ../frontend && npm install
```

#### 2. Cấu hình môi trường

Tạo file `.env` trong mỗi service với các biến môi trường cần thiết:

**api-gateway/.env**
```env
PORT=3000
AUTH_SERVICE_URL=localhost:50051
USER_SERVICE_URL=localhost:50052
TODO_SERVICE_URL=localhost:50053
```

**auth-service/.env**
```env
GRPC_PORT=50051
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://localhost:27017/auth-service
RABBITMQ_URL=amqp://localhost:5672
```

**user-service/.env**
```env
GRPC_PORT=50052
MONGODB_URI=mongodb://localhost:27017/user-service
RABBITMQ_URL=amqp://localhost:5672
```

**todo-service/.env**
```env
GRPC_PORT=50053
MONGODB_URI=mongodb://localhost:27017/todo-service
RABBITMQ_URL=amqp://localhost:5672
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3000
```

#### 3. Chạy các services

Mở 6 terminal riêng biệt và chạy từng service:

```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - RabbitMQ
rabbitmq-server

# Terminal 3 - API Gateway
cd api-gateway
npm run dev

# Terminal 4 - Auth Service
cd auth-service
npm run dev

# Terminal 5 - User Service
cd user-service
npm run dev

# Terminal 6 - Todo Service
cd todo-service
npm run dev

# Terminal 7 - Frontend
cd frontend
npm run dev
```

## 🔧 Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework cho API Gateway
- **gRPC** - Communication protocol giữa các microservices
- **Protocol Buffers** - Serialization format cho gRPC
- **MongoDB** - NoSQL database với Mongoose ODM
- **Mongoose** - MongoDB object modeling cho Node.js
- **RabbitMQ** - Message broker cho event-driven communication
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Docker** - Containerization

### Frontend
- **React 18** - Frontend framework
- **Vite** - Build tool và development server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Tailwind CSS** - CSS framework
- **Context API** - State management

### Development Tools
- **nodemon** - Auto-restart development server
- **dotenv** - Environment variables management
- **Docker Compose** - Multi-container orchestration

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Đăng ký tài khoản mới
- `POST /login` - Đăng nhập
- `POST /verify-token` - Xác thực token

### Users (`/api/users`)
- `GET /:userId` - Lấy thông tin user
- `PUT /:userId` - Cập nhật thông tin user
- `GET /:userId/profile` - Lấy profile user với số lượng todo

### Todos (`/api/todos`)
- `POST /` - Tạo todo mới
- `GET /` - Lấy danh sách todos của user
- `GET /:todoId` - Lấy thông tin todo cụ thể
- `PUT /:todoId` - Cập nhật todo
- `DELETE /:todoId` - Xóa todo
- `PATCH /:todoId/toggle` - Toggle trạng thái completed

## 🔒 Authentication Flow

1. User đăng ký/đăng nhập qua Auth Service
2. Auth Service trả về JWT token
3. Client sử dụng token trong header `Authorization: Bearer <token>`
4. API Gateway verify token với Auth Service
5. Nếu token hợp lệ, request được forward đến service tương ứng

## 💾 Data Storage với MongoDB

Dự án sử dụng **MongoDB với Mongoose**:

### Models

**User Model (Auth Service)**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  isActive: Boolean,
  lastLogin: Date
}
```

**User Model (User Service)**
```javascript
{
  name: String,
  email: String (unique),
  avatar: String,
  bio: String,
  preferences: {
    theme: String,
    notifications: Boolean
  },
  isActive: Boolean,
  lastLogin: Date
}
```

**Todo Model**
```javascript
{
  title: String,
  description: String,
  completed: Boolean,
  priority: String (low/medium/high),
  dueDate: Date,
  tags: [String],
  userId: ObjectId,
  category: String,
  isArchived: Boolean
}
```

### Database Features
- **Persistence** - Dữ liệu được lưu trữ vĩnh viễn
- **Scalability** - MongoDB hỗ trợ horizontal scaling
- **Flexibility** - Schema linh hoạt với Mongoose
- **Validation** - Built-in validation với Mongoose
- **Indexing** - Tối ưu hóa query performance

## 📊 Message Queue Architecture

Dự án sử dụng RabbitMQ để xử lý các event giữa các services:

- **Event-driven communication** - Services giao tiếp qua events
- **Asynchronous processing** - Xử lý bất đồng bộ
- **Decoupling** - Giảm sự phụ thuộc giữa các services

### Events
- `user.registered` - Khi user đăng ký mới
- `user.logged_in` - Khi user đăng nhập
- `todo.created` - Khi tạo todo mới
- `todo.deleted` - Khi xóa todo

## 🎨 Frontend Features

### React Router DOM Best Practices
- **Nested Routes** - Sử dụng Outlet cho layout
- **Protected Routes** - Authentication guard
- **Public Routes** - Redirect khi đã đăng nhập
- **No Page Reload** - Client-side routing mượt mà

### State Management
- **Context API** - AuthContext và TodoContext
- **Custom Hooks** - useAuth, useTodo
- **Error Handling** - Centralized error management

### UI/UX Features
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - Theme switching
- **Real-time Updates** - Live data synchronization
- **Form Validation** - Client-side validation
- **Loading States** - User feedback
- **Error Messages** - User-friendly error handling

## 🧪 Testing

```bash
# Chạy health check
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚀 Deployment

### Local Development
```bash
# Sử dụng Docker Compose
docker-compose up -d

# Hoặc chạy từng service
npm run dev
```

### Production với Azure
Xem file `AZURE_DEPLOYMENT.md` để biết hướng dẫn chi tiết deploy lên Azure.

### Docker Commands
```bash
# Build images
docker build -t auth-service ./auth-service
docker build -t user-service ./user-service
docker build -t todo-service ./todo-service
docker build -t api-gateway ./api-gateway
docker build -t frontend ./frontend

# Run containers
docker run -d --name auth-service -p 50051:50051 auth-service
docker run -d --name user-service -p 50052:50052 user-service
docker run -d --name todo-service -p 50053:50053 todo-service
docker run -d --name api-gateway -p 3000:3000 api-gateway
docker run -d --name frontend -p 5173:80 frontend
```

## 📝 Scripts có sẵn

Mỗi service có các script sau:
- `npm start` - Chạy production mode
- `npm run dev` - Chạy development mode với nodemon
- `npm test` - Chạy tests (chưa implement)

Frontend có thêm:
- `npm run build` - Build production
- `npm run preview` - Preview production build

## 🔧 Development Commands

```bash
# Install dependencies cho tất cả services
npm run install:all

# Start development environment
npm run dev:all

# Build production
npm run build:all

# Run tests
npm run test:all

# Clean node_modules
npm run clean:all
```

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án được phân phối dưới ISC License. Xem file `LICENSE` để biết thêm thông tin.

## 👥 Tác giả

- **Duclu** - *Initial work*

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue trong repository này.

## 🔗 Links

- [Azure Deployment Guide](./AZURE_DEPLOYMENT.md)
- [Docker Compose Configuration](./docker-compose.yml)
- [Frontend Documentation](./frontend/README.md)
