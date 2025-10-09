const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const todoService = require('../service/todoService');

const PROTO_PATH = path.join(__dirname, '../proto/todo.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

async function CreateTodo(call, callback) {
    const { userId, title, description } = call.request;
    const result = await todoService.createTodo(userId, title, description);
    callback(null, result);
}

function GetTodos(call, callback) {
    const { userId } = call.request;
    const result = todoService.getTodos(userId);
    callback(null, result);
}

function GetTodo(call, callback) {
    const { todoId, userId } = call.request;
    const result = todoService.getTodo(todoId, userId);
    callback(null, result);
}

function UpdateTodo(call, callback) {
    const { todoId, userId, title, description } = call.request;
    const result = todoService.updateTodo(todoId, userId, title, description);
    callback(null, result);
}

async function DeleteTodo(call, callback) {
    const { todoId, userId } = call.request;
    const result = await todoService.deleteTodo(todoId, userId);
    callback(null, result);
}

function ToggleTodo(call, callback) {
    const { todoId, userId } = call.request;
    const result = todoService.toggleTodo(todoId, userId);
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