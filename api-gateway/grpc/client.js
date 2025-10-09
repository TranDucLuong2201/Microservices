const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Đường dẫn từ grpc/client.js đến proto/ (cùng cấp với grpc)
const authProtoPath = path.join(__dirname, '../proto/auth.proto');
const userProtoPath = path.join(__dirname, '../proto/user.proto');
const todoProtoPath = path.join(__dirname, '../proto/todo.proto');

const authPackageDef = protoLoader.loadSync(authProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const userPackageDef = protoLoader.loadSync(userProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const todoPackageDef = protoLoader.loadSync(todoProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const authProto = grpc.loadPackageDefinition(authPackageDef).auth;
const userProto = grpc.loadPackageDefinition(userPackageDef).user;
const todoProto = grpc.loadPackageDefinition(todoPackageDef).todo;

// Create gRPC clients
const authClient = new authProto.AuthService(
    process.env.AUTH_GRPC_URL,
    grpc.credentials.createInsecure()
);

const userClient = new userProto.UserService(
    process.env.USER_GRPC_URL,
    grpc.credentials.createInsecure()
);

const todoClient = new todoProto.TodoService(
    process.env.TODO_GRPC_URL,
    grpc.credentials.createInsecure()
);

module.exports = {
    authClient,
    userClient,
    todoClient
};