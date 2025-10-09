# Microservices Architecture Project

Dự án microservices được xây dựng với Node.js, sử dụng gRPC để giao tiếp giữa các service và RabbitMQ để xử lý message queue.

## 🏗️ Kiến trúc hệ thống

Dự án bao gồm 4 service chính:

- **API Gateway** - Cổng vào chính, xử lý các HTTP request và định tuyến đến các microservice
- **Auth Service** - Quản lý xác thực và phân quyền người dùng
- **User Service** - Quản lý thông tin người dùng
- **Todo Service** - Quản lý các task/todo của người dùng

## 📁 Cấu trúc thư mục

```
Microservices/
├── api-gateway/          # API Gateway service
│   ├── grpc/            # gRPC client configurations
│   ├── middleware/      # Authentication middleware
│   ├── proto/           # Protocol buffer definitions
│   ├── routes/          # Express routes
│   └── src/             # Source code
├── auth-service/        # Authentication service
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── grpc/        # gRPC server implementation
│   │   ├── proto/       # Protocol buffer definitions
│   │   ├── service/     # Business logic
│   │   └── utils/       # Utilities (RabbitMQ)
├── todo-service/        # Todo management service
│   └── src/             # Similar structure to auth-service
└── user-service/        # User management service
    └── src/             # Similar structure to auth-service
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js (v14 trở lên)
- RabbitMQ
- npm hoặc yarn

### Cài đặt dependencies

```bash
# Cài đặt dependencies cho tất cả services
cd api-gateway && npm install
cd ../auth-service && npm install
cd ../todo-service && npm install
cd ../user-service && npm install
```

### Cấu hình môi trường

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
RABBITMQ_URL=amqp://localhost:5672
```

**user-service/.env**
```env
GRPC_PORT=50052
RABBITMQ_URL=amqp://localhost:5672
```

**todo-service/.env**
```env
GRPC_PORT=50053
RABBITMQ_URL=amqp://localhost:5672
```

### Chạy các services

Mở 4 terminal riêng biệt và chạy từng service:

```bash
# Terminal 1 - API Gateway
cd api-gateway
npm run dev

# Terminal 2 - Auth Service
cd auth-service
npm run dev

# Terminal 3 - User Service
cd user-service
npm run dev

# Terminal 4 - Todo Service
cd todo-service
npm run dev
```

## 🔧 Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework cho API Gateway
- **gRPC** - Communication protocol giữa các microservices
- **Protocol Buffers** - Serialization format cho gRPC
- **In-Memory Storage** - Sử dụng JavaScript Map để lưu trữ dữ liệu (dữ liệu sẽ mất khi restart service)
- **RabbitMQ** - Message broker cho event-driven communication
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing

### Development Tools
- **nodemon** - Auto-restart development server
- **dotenv** - Environment variables management

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

## 💾 Data Storage

Dự án sử dụng **in-memory storage** với JavaScript Map:

- **Temporary storage** - Dữ liệu chỉ tồn tại trong RAM
- **No persistence** - Dữ liệu sẽ mất khi restart service
- **Fast access** - Truy cập dữ liệu nhanh chóng
- **Development purpose** - Phù hợp cho môi trường development và demo

> ⚠️ **Lưu ý**: Đây là dự án demo, trong production nên sử dụng database thực như MongoDB, PostgreSQL, hoặc MySQL.

## 📊 Message Queue Architecture

Dự án sử dụng RabbitMQ để xử lý các event giữa các services:

- **Event-driven communication** - Services giao tiếp qua events
- **Asynchronous processing** - Xử lý bất đồng bộ
- **Decoupling** - Giảm sự phụ thuộc giữa các services

## 🧪 Testing

```bash
# Chạy health check
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 📝 Scripts có sẵn

Mỗi service có các script sau:
- `npm start` - Chạy production mode
- `npm run dev` - Chạy development mode với nodemon
- `npm test` - Chạy tests (chưa implement)

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
