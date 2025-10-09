require('dotenv').config();
const { startGrpcServer } = require('./grpc/todoService');
const { connectRabbitMQ } = require('./utils/rabbitmq');

async function main() {
    console.log('🚀 Starting Todo Service...');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start gRPC server
    startGrpcServer(process.env.GRPC_PORT);
}

main().catch(console.error);