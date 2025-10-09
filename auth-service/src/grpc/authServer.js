const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const authService = require('../service/authService');

const PROTO_PATH = path.join(__dirname, '../proto/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// gRPC handlers
async function Register(call, callback) {
    const { email, password, name } = call.request;
    const result = await authService.register(email, password, name);
    callback(null, result);
}

async function Login(call, callback) {
    const { email, password } = call.request;
    const result = await authService.login(email, password);
    callback(null, result);
}

function VerifyToken(call, callback) {
    const { token } = call.request;
    const result = authService.verifyToken(token);
    callback(null, result);
}

function startGrpcServer(port) {
    const server = new grpc.Server();

    server.addService(authProto.AuthService.service, {
        Register,
        Login,
        VerifyToken
    });

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('Failed to start gRPC server:', error);
                return;
            }
            console.log(`✅ Auth gRPC server running on port ${port}`);
        }
    );
}

module.exports = { startGrpcServer };