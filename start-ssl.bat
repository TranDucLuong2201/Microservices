@echo off
echo 🚀 Starting TodoApp with SSL on todo.lunix.codes
echo ================================================

REM Check if SSL files exist
if not exist "ssl\_.lunix.codes-crt.pem" (
    echo ❌ SSL certificate file not found!
    echo Please ensure ssl\_.lunix.codes-crt.pem exists
    pause
    exit /b 1
)

if not exist "ssl\_.lunix.codes-key.pem" (
    echo ❌ SSL private key file not found!
    echo Please ensure ssl\_.lunix.codes-key.pem exists
    pause
    exit /b 1
)

echo ✅ SSL files found

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down --remove-orphans

REM Start services with SSL
echo 🚀 Starting services with SSL...
docker-compose -f docker-compose.ssl.yml up --build -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak > nul

REM Check service status
echo 📊 Service Status:
docker-compose -f docker-compose.ssl.yml ps

echo.
echo 🎉 TodoApp is now running with SSL!
echo 🌐 Access your app at: https://todo.lunix.codes
echo 📊 RabbitMQ Management: https://todo.lunix.codes:15672 (admin/password)
echo.
echo 📝 Make sure your DNS is pointing todo.lunix.codes to this server's IP address
pause
