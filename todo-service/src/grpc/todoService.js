const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const todoService = require('../service/todoService');

const PROTO_PATH = path.join(__dirname, '../proto/todo.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

async function CreateTodo(call, callback) {
    const { userId, title, description, priority, dueDate, tags, category } = call.request;
    const result = await todoService.createTodo(userId, title, description, priority, dueDate, tags, category);
    callback(null, result);
}

async function GetTodos(call, callback) {
    const { userId } = call.request;
    const result = await todoService.getTodos(userId);
    callback(null, result);
}

async function GetTodo(call, callback) {
    const { todoId, userId } = call.request;
    const result = await todoService.getTodo(todoId, userId);
    callback(null, result);
}

async function UpdateTodo(call, callback) {
    const { todoId, userId, title, description, priority, dueDate, tags, category } = call.request;
    const result = await todoService.updateTodo(todoId, userId, title, description, priority, dueDate, tags, category);
    callback(null, result);
}

async function DeleteTodo(call, callback) {
    const { todoId, userId } = call.request;
    const result = await todoService.deleteTodo(todoId, userId);
    callback(null, result);
}

async function ToggleTodo(call, callback) {
    const { todoId, userId } = call.request;
    const result = await todoService.toggleTodo(todoId, userId);
    callback(null, result);
}

function startGrpcServer(port) {
    const server = new grpc.Server();

    server.addService(todoProto.TodoService.service, {
        CreateTodo,
        GetTodos,
        GetTodo,
        UpdateTodo,
        DeleteTodo,
        ToggleTodo
    });

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('Failed to start gRPC server:', error);
                return;
            }
            console.log(`✅ Todo gRPC server running on port ${port}`);
        }
    );
}

module.exports = { startGrpcServer };