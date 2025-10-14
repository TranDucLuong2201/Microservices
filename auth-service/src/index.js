require('dotenv').config();
const { startGrpcServer } = require('./grpc/authServer');
const { connectRabbitMQ } = require('./utils/rabbitmq');
const { connectDatabase } = require('./config/database');

async function main() {
    console.log('🚀 Starting Auth Service...');
    // Connect to MongoDB
    await connectDatabase();
    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start gRPC server
    startGrpcServer(process.env.GRPC_PORT);
}

main().catch(console.error);