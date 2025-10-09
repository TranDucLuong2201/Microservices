require('dotenv').config();
const { startGrpcServer } = require('./grpc/authServer');
const { connectRabbitMQ } = require('./utils/rabbitmq');

async function main() {
    console.log('🚀 Starting Auth Service...');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start gRPC server
    startGrpcServer(process.env.GRPC_PORT);
}

main().catch(console.error);