const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const userService = require('../service/userService');

const PROTO_PATH = path.join(__dirname, '../proto/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

async function GetUser(call, callback) {
    const { userId } = call.request;
    const result = await userService.getUser(userId);
    callback(null, result);
}

async function UpdateUser(call, callback) {
    const { userId, name, bio, preferences } = call.request;
    const updateData = { name, bio, preferences };
    const result = await userService.updateUser(userId, updateData);
    callback(null, result);
}

async function GetUserProfile(call, callback) {
    const { userId } = call.request;
    const result = await userService.getUserProfile(userId);
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