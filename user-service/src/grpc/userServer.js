const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const userService = require('../service/userService');

const PROTO_PATH = path.join(__dirname, '../proto/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

function GetUser(call, callback) {
    const { userId } = call.request;
    const result = userService.getUser(userId);
    callback(null, result);
}

function UpdateUser(call, callback) {
    const { userId, name, phone } = call.request;
    const result = userService.updateUser(userId, name, phone);
    callback(null, result);
}

function GetUserProfile(call, callback) {
    const { userId } = call.request;
    const result = userService.getUserProfile(userId);
    callback(null, result);
}

function startGrpcServer(port) {
    const server = new grpc.Server();

    server.addService(userProto.UserService.service, {
        GetUser,
        UpdateUser,
        GetUserProfile
    });

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('Failed to start gRPC server:', error);
                return;
            }
            console.log(`✅ User gRPC server running on port ${port}`);
        }
    );
}

module.exports = { startGrpcServer };