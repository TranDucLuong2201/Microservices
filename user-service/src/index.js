require('dotenv').config();
const connectDB = require('./config/database');
const { startGrpcServer } = require('./grpc/userServer');
const { startEventConsumer } = require('./events/eventConsumer');

async function main() {
    console.log('🚀 Starting User Service...');

    // Connect to MongoDB
    await connectDB();

    // Start event consumer
    await startEventConsumer();

    // Start gRPC server
    startGrpcServer(process.env.GRPC_PORT);
}

main().catch(console.error);