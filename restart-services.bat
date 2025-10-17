@echo off
echo 🔄 Restarting Microservices...

REM Stop all containers
echo ⏹️  Stopping all containers...
docker-compose down

REM Remove old volumes (optional - uncomment if you want to reset data)
REM echo 🗑️  Removing old volumes...
REM docker volume rm microservices_mongodb_auth_data microservices_mongodb_user_data microservices_mongodb_todo_data microservices_rabbitmq_data

REM Remove old images (optional - uncomment if you want to rebuild)
REM echo 🗑️  Removing old images...
REM docker rmi microservices-auth-service microservices-user-service microservices-todo-service microservices-api-gateway microservices-frontend

REM Build and start services
echo 🏗️  Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak > nul

REM Check service status
echo 📊 Checking service status...
docker-compose ps

echo ✅ Restart completed!
echo 🌐 Services available at:
echo    - Frontend: http://localhost:5173
echo    - API Gateway: http://localhost:3000
echo    - RabbitMQ Management: http://localhost:15672 (admin/password)
echo    - MongoDB Auth: localhost:27017
echo    - MongoDB User: localhost:27018
echo    - MongoDB Todo: localhost:27019

pause
