# Azure Deployment Guide for Microservices

## Tổng quan
Hướng dẫn deploy microservices architecture lên Azure sử dụng:
- **Azure Container Instances (ACI)** cho các microservices
- **Azure Cosmos DB** cho MongoDB
- **Azure Service Bus** cho RabbitMQ
- **Azure Static Web Apps** cho frontend React
- **Azure Application Gateway** cho API Gateway

## 1. Chuẩn bị Azure Resources

### 1.1 Tạo Resource Group
```bash
az group create --name microservices-rg --location eastus
```

### 1.2 Tạo Cosmos DB (MongoDB API)
```bash
# Tạo Cosmos DB account
az cosmosdb create \
  --resource-group microservices-rg \
  --name microservices-cosmosdb \
  --kind MongoDB \
  --locations regionName=eastus

# Lấy connection string
az cosmosdb keys list \
  --resource-group microservices-rg \
  --name microservices-cosmosdb \
  --type connection-strings
```

### 1.3 Tạo Service Bus (Thay thế RabbitMQ)
```bash
# Tạo Service Bus namespace
az servicebus namespace create \
  --resource-group microservices-rg \
  --name microservices-servicebus \
  --location eastus \
  --sku Standard

# Tạo queues cho từng service
az servicebus queue create \
  --resource-group microservices-rg \
  --namespace-name microservices-servicebus \
  --name user-events \
  --max-size 1024

az servicebus queue create \
  --resource-group microservices-rg \
  --namespace-name microservices-servicebus \
  --name todo-events \
  --max-size 1024

az servicebus queue create \
  --resource-group microservices-rg \
  --namespace-name microservices-servicebus \
  --name auth-events \
  --max-size 1024

# Lấy connection string
az servicebus namespace authorization-rule keys list \
  --resource-group microservices-rg \
  --namespace-name microservices-servicebus \
  --name RootManageSharedAccessKey
```

### 1.4 Tạo Container Registry
```bash
az acr create \
  --resource-group microservices-rg \
  --name microservicesacr \
  --sku Basic
```

## 2. Cấu hình Docker

### 2.1 Dockerfile cho Auth Service
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 50051
CMD ["npm", "start"]
```

### 2.2 Dockerfile cho User Service
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 50052
CMD ["npm", "start"]
```

### 2.3 Dockerfile cho Todo Service
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 50053
CMD ["npm", "start"]
```

### 2.4 Dockerfile cho API Gateway
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 3. Environment Variables

### 3.1 Auth Service (.env)
```env
GRPC_PORT=50051
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://microservices-cosmosdb-auth.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY
```

### 3.2 User Service (.env)
```env
GRPC_PORT=50052
MONGODB_URI=mongodb://microservices-cosmosdb-user.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY
```

### 3.3 Todo Service (.env)
```env
GRPC_PORT=50053
MONGODB_URI=mongodb://microservices-cosmosdb-todo.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY
```

### 3.4 API Gateway (.env)
```env
PORT=3000
AUTH_SERVICE_URL=auth-service:50051
USER_SERVICE_URL=user-service:50052
TODO_SERVICE_URL=todo-service:50053
```

## 4. Build và Push Docker Images

```bash
# Login to ACR
az acr login --name microservicesacr

# Build và push images
docker build -t microservicesacr.azurecr.io/auth-service:latest ./auth-service
docker push microservicesacr.azurecr.io/auth-service:latest

docker build -t microservicesacr.azurecr.io/user-service:latest ./user-service
docker push microservicesacr.azurecr.io/user-service:latest

docker build -t microservicesacr.azurecr.io/todo-service:latest ./todo-service
docker push microservicesacr.azurecr.io/todo-service:latest

docker build -t microservicesacr.azurecr.io/api-gateway:latest ./api-gateway
docker push microservicesacr.azurecr.io/api-gateway:latest
```

## 5. Deploy với Azure Container Instances

### 5.1 Deploy Auth Service
```bash
az container create \
  --resource-group microservices-rg \
  --name auth-service \
  --image microservicesacr.azurecr.io/auth-service:latest \
  --registry-login-server microservicesacr.azurecr.io \
  --registry-username microservicesacr \
  --registry-password YOUR_ACR_PASSWORD \
  --ports 50051 \
  --environment-variables \
    GRPC_PORT=50051 \
    JWT_SECRET=your-super-secret-jwt-key \
    MONGODB_URI=mongodb://microservices-cosmosdb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb \
    RABBITMQ_URL=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY
```

### 5.2 Deploy User Service
```bash
az container create \
  --resource-group microservices-rg \
  --name user-service \
  --image microservicesacr.azurecr.io/user-service:latest \
  --registry-login-server microservicesacr.azurecr.io \
  --registry-username microservicesacr \
  --registry-password YOUR_ACR_PASSWORD \
  --ports 50052 \
  --environment-variables \
    GRPC_PORT=50052 \
    MONGODB_URI=mongodb://microservices-cosmosdb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb \
    RABBITMQ_URL=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY
```

### 5.3 Deploy Todo Service
```bash
az container create \
  --resource-group microservices-rg \
  --name todo-service \
  --image microservicesacr.azurecr.io/todo-service:latest \
  --registry-login-server microservicesacr.azurecr.io \
  --registry-username microservicesacr \
  --registry-password YOUR_ACR_PASSWORD \
  --ports 50053 \
  --environment-variables \
    GRPC_PORT=50053 \
    MONGODB_URI=mongodb://microservices-cosmosdb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb \
    RABBITMQ_URL=Endpoint=sb://microservices-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY
```

### 5.4 Deploy API Gateway
```bash
az container create \
  --resource-group microservices-rg \
  --name api-gateway \
  --image microservicesacr.azurecr.io/api-gateway:latest \
  --registry-login-server microservicesacr.azurecr.io \
  --registry-username microservicesacr \
  --registry-password YOUR_ACR_PASSWORD \
  --ports 3000 \
  --environment-variables \
    PORT=3000 \
    AUTH_SERVICE_URL=auth-service:50051 \
    USER_SERVICE_URL=user-service:50052 \
    TODO_SERVICE_URL=todo-service:50053
```

## 6. Deploy Frontend với Azure Static Web Apps

### 6.1 Cài đặt Azure Static Web Apps CLI
```bash
npm install -g @azure/static-web-apps-cli
```

### 6.2 Build frontend
```bash
cd frontend
npm run build
```

### 6.3 Deploy
```bash
swa deploy --app-location ./dist --deployment-token YOUR_DEPLOYMENT_TOKEN
```

## 7. Cấu hình Application Gateway (Optional)

```bash
# Tạo Virtual Network
az network vnet create \
  --resource-group microservices-rg \
  --name microservices-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name gateway-subnet \
  --subnet-prefix 10.0.1.0/24

# Tạo Application Gateway
az network application-gateway create \
  --resource-group microservices-rg \
  --name microservices-gateway \
  --location eastus \
  --vnet-name microservices-vnet \
  --subnet gateway-subnet \
  --frontend-port 80 \
  --http-settings-port 3000 \
  --http-settings-protocol Http \
  --backend-pool-name api-gateway-pool \
  --backend-pool-addresses api-gateway.eastus.azurecontainer.io
```

## 8. Monitoring và Logging

### 8.1 Application Insights
```bash
az monitor app-insights component create \
  --resource-group microservices-rg \
  --app microservices-insights \
  --location eastus
```

### 8.2 Log Analytics Workspace
```bash
az monitor log-analytics workspace create \
  --resource-group microservices-rg \
  --workspace-name microservices-logs \
  --location eastus
```

## 9. CI/CD Pipeline với GitHub Actions

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Login to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Build and push Docker images
      run: |
        # Build và push các service images
        docker build -t microservicesacr.azurecr.io/auth-service:${{ github.sha }} ./auth-service
        docker push microservicesacr.azurecr.io/auth-service:${{ github.sha }}
        
        # Tương tự cho các service khác
    
    - name: Deploy to Azure Container Instances
      run: |
        # Deploy các container instances
        az container create --resource-group microservices-rg --name auth-service --image microservicesacr.azurecr.io/auth-service:${{ github.sha }}
    
    - name: Deploy Frontend
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/frontend"
        api_location: ""
        output_location: "dist"
```

## 10. Security Best Practices

### 10.1 Azure Key Vault
```bash
# Tạo Key Vault
az keyvault create \
  --resource-group microservices-rg \
  --name microservices-keyvault \
  --location eastus

# Store secrets
az keyvault secret set --vault-name microservices-keyvault --name jwt-secret --value "your-jwt-secret"
az keyvault secret set --vault-name microservices-keyvault --name cosmosdb-connection --value "your-connection-string"
```

### 10.2 Managed Identity
```bash
# Assign managed identity cho containers
az container update \
  --resource-group microservices-rg \
  --name auth-service \
  --assign-identity
```

## 11. Cost Optimization

### 11.1 Auto-scaling
- Sử dụng Azure Container Apps thay vì ACI cho auto-scaling
- Configure horizontal pod autoscaler

### 11.2 Resource Optimization
- Sử dụng Azure Spot Instances cho development
- Configure resource limits cho containers
- Monitor costs với Azure Cost Management

## 12. Troubleshooting

### 12.1 Common Issues
1. **Container không start**: Check logs với `az container logs`
2. **Database connection failed**: Verify connection string và firewall rules
3. **Service discovery issues**: Check DNS resolution và network configuration

### 12.2 Debug Commands
```bash
# Check container status
az container show --resource-group microservices-rg --name auth-service

# View logs
az container logs --resource-group microservices-rg --name auth-service

# Execute commands in container
az container exec --resource-group microservices-rg --name auth-service --exec-command "/bin/sh"
```

## 13. Production Checklist

- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring và alerting
- [ ] Configure backup strategy
- [ ] Implement health checks
- [ ] Set up disaster recovery
- [ ] Configure network security groups
- [ ] Implement rate limiting
- [ ] Set up log aggregation
- [ ] Configure auto-scaling
- [ ] Implement blue-green deployment
