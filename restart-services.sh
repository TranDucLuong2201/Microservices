#!/bin/bash

echo "🔄 Restarting Microservices..."

# Stop all containers
echo "⏹️  Stopping all containers..."
docker-compose down

# Remove old volumes (optional - uncomment if you want to reset data)
# echo "🗑️  Removing old volumes..."
# docker volume rm microservices_mongodb_auth_data microservices_mongodb_user_data microservices_mongodb_todo_data microservices_rabbitmq_data

# Remove old images (optional - uncomment if you want to rebuild)
# echo "🗑️  Removing old images..."
# docker rmi microservices-auth-service microservices-user-service microservices-todo-service microservices-api-gateway microservices-frontend

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

echo "✅ Restart completed!"
echo "🌐 Services available at:"
echo "   - Frontend: http://localhost:5173"
echo "   - API Gateway: http://localhost:3000"
echo "   - RabbitMQ Management: http://localhost:15672 (admin/password)"
echo "   - MongoDB Auth: localhost:27017"
echo "   - MongoDB User: localhost:27018"
echo "   - MongoDB Todo: localhost:27019"
