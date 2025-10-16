# 🚨 TROUBLESHOOTING GUIDE

## 🎯 **TỔNG QUAN TROUBLESHOOTING**

Tài liệu này cung cấp hướng dẫn chi tiết để khắc phục các vấn đề thường gặp trong hệ thống microservices, từ development đến production.

---

## 🔍 **DIAGNOSTIC TOOLS**

### **System Monitoring Commands**
```bash
# Check system resources
htop
free -h
df -h
iostat -x 1

# Check network connections
netstat -tulpn
ss -tuln
lsof -i :3000

# Check processes
ps aux | grep node
ps aux | grep docker
```

### **Docker Commands**
```bash
# Check container status
docker ps -a
docker stats
docker system df

# Check container logs
docker logs microservices-api-gateway
docker logs microservices-auth-service
docker logs microservices-frontend

# Check container resources
docker exec microservices-api-gateway top
docker exec microservices-auth-service free -h
```

### **Application Logs**
```bash
# View real-time logs
docker-compose logs -f
docker-compose logs -f api-gateway
docker-compose logs -f auth-service

# View specific service logs
docker logs -f microservices-api-gateway
docker logs -f microservices-auth-service
```

---

## 🐳 **DOCKER ISSUES**

### **1. Container Won't Start**

#### **Symptoms:**
- Container exits immediately
- Status shows "Exited (1)"
- No logs available

#### **Diagnosis:**
```bash
# Check container status
docker ps -a

# Check exit code
docker inspect microservices-auth-service | grep ExitCode

# Check logs
docker logs microservices-auth-service
```

#### **Common Causes & Solutions:**

**A. Port Already in Use**
```bash
# Check port usage
sudo lsof -i :50051
sudo netstat -tulpn | grep :50051

# Kill process using port
sudo kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "50052:50051"  # Use different external port
```

**B. Environment Variables Missing**
```bash
# Check environment variables
docker exec microservices-auth-service env | grep MONGODB_URI

# Verify .env file exists
ls -la .env.production

# Check docker-compose environment section
docker-compose config
```

**C. Database Connection Failed**
```bash
# Test database connectivity
docker exec microservices-auth-service ping mongodb-auth
docker exec microservices-auth-service nslookup mongodb-auth

# Check MongoDB logs
docker logs microservices-mongodb-auth
```

### **2. Container Keeps Restarting**

#### **Symptoms:**
- Container status shows "Restarting"
- High restart count
- Application crashes repeatedly

#### **Diagnosis:**
```bash
# Check restart policy
docker inspect microservices-auth-service | grep RestartPolicy

# Check restart count
docker ps -a | grep microservices-auth-service

# Check logs for crash patterns
docker logs --tail 100 microservices-auth-service
```

#### **Solutions:**

**A. Memory Issues**
```bash
# Check memory usage
docker stats microservices-auth-service

# Increase memory limits
services:
  auth-service:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

**B. Application Errors**
```bash
# Check application logs
docker logs microservices-auth-service 2>&1 | grep -i error

# Check for uncaught exceptions
docker logs microservices-auth-service 2>&1 | grep -i exception
```

### **3. Network Connectivity Issues**

#### **Symptoms:**
- Services can't communicate
- Connection refused errors
- Timeout errors

#### **Diagnosis:**
```bash
# Check Docker network
docker network ls
docker network inspect microservices_microservices-network

# Test connectivity between containers
docker exec microservices-api-gateway ping auth-service
docker exec microservices-api-gateway nslookup auth-service
```

#### **Solutions:**

**A. Network Configuration**
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

**B. Service Discovery Issues**
```bash
# Check service names in docker-compose.yml
# Ensure service names match in environment variables
AUTH_SERVICE_URL=auth-service:50051  # Not localhost:50051
```

---

## 🗄️ **DATABASE ISSUES**

### **1. MongoDB Connection Failed**

#### **Symptoms:**
- "Database connection error" in logs
- Application can't start
- Timeout errors

#### **Diagnosis:**
```bash
# Check MongoDB container
docker logs microservices-mongodb-auth

# Test connection from application container
docker exec microservices-auth-service node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error('Error:', err));
"
```

#### **Solutions:**

**A. Connection String Issues**
```bash
# Verify connection string format
echo $MONGODB_AUTH_URI

# Check for special characters
# Ensure proper URL encoding
```

**B. Authentication Issues**
```bash
# Check MongoDB credentials
docker exec microservices-mongodb-auth mongo --eval "db.runCommand({connectionStatus: 1})"

# Verify authSource parameter
MONGODB_URI=mongodb://admin:password@mongodb-auth:27017/auth-service?authSource=admin
```

**C. Network Issues**
```bash
# Test network connectivity
docker exec microservices-auth-service ping mongodb-auth
docker exec microservices-auth-service telnet mongodb-auth 27017
```

### **2. Azure Cosmos DB Issues**

#### **Symptoms:**
- SSL certificate errors
- Authentication failed
- Connection timeout

#### **Diagnosis:**
```bash
# Test connection string
mongo "mongodb://microservices-cosmosdb-auth:YOUR_KEY@microservices-cosmosdb-auth.mongo.cosmos.azure.com:10255/auth-service?ssl=true&replicaSet=globaldb"

# Check firewall rules
az cosmosdb show --resource-group microservices-rg --name microservices-cosmosdb-auth
```

#### **Solutions:**

**A. SSL Configuration**
```javascript
// Ensure SSL is enabled
const conn = await mongoose.connect(process.env.MONGODB_URI, {
    ssl: true,
    sslValidate: true,
    authSource: 'admin'
});
```

**B. Firewall Configuration**
```bash
# Enable public network access
az cosmosdb update \
  --resource-group microservices-rg \
  --name microservices-cosmosdb-auth \
  --enable-public-network true
```

---

## 🌐 **API GATEWAY ISSUES**

### **1. Request Routing Failed**

#### **Symptoms:**
- 502 Bad Gateway errors
- Service unavailable
- Connection refused

#### **Diagnosis:**
```bash
# Check API Gateway logs
docker logs microservices-api-gateway

# Test gRPC connections
docker exec microservices-api-gateway telnet auth-service 50051
docker exec microservices-api-gateway telnet user-service 50052
```

#### **Solutions:**

**A. Service Discovery**
```bash
# Check service names
docker exec microservices-api-gateway nslookup auth-service
docker exec microservices-api-gateway nslookup user-service

# Verify environment variables
docker exec microservices-api-gateway env | grep SERVICE_URL
```

**B. gRPC Connection Issues**
```bash
# Check gRPC server status
docker exec microservices-auth-service netstat -tulpn | grep 50051

# Test gRPC health check
grpcurl -plaintext auth-service:50051 grpc.health.v1.Health/Check
```

### **2. Authentication Issues**

#### **Symptoms:**
- 401 Unauthorized errors
- JWT token invalid
- Authentication middleware fails

#### **Diagnosis:**
```bash
# Check JWT secret
docker exec microservices-api-gateway env | grep JWT_SECRET

# Test token verification
curl -H "Authorization: Bearer YOUR_TOKEN" https://yourdomain.com/api/auth/verify-token
```

#### **Solutions:**

**A. JWT Secret Mismatch**
```bash
# Ensure same JWT_SECRET in all services
# Check environment variables
docker exec microservices-api-gateway env | grep JWT_SECRET
docker exec microservices-auth-service env | grep JWT_SECRET
```

**B. Token Format Issues**
```bash
# Verify token format
echo "YOUR_TOKEN" | base64 -d

# Check token expiration
node -e "
const jwt = require('jsonwebtoken');
const token = 'YOUR_TOKEN';
const decoded = jwt.decode(token);
console.log('Expires:', new Date(decoded.exp * 1000));
"
```

---

## 🎨 **FRONTEND ISSUES**

### **1. Build Failures**

#### **Symptoms:**
- Frontend container fails to build
- Build errors in logs
- Missing dependencies

#### **Diagnosis:**
```bash
# Check build logs
docker logs microservices-frontend

# Check package.json
cat frontend/package.json

# Test build locally
cd frontend
npm install
npm run build
```

#### **Solutions:**

**A. Dependency Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**B. Build Configuration**
```bash
# Check Vite configuration
cat frontend/vite.config.js

# Check environment variables
echo $VITE_API_URL
```

### **2. API Connection Issues**

#### **Symptoms:**
- Frontend can't connect to API
- CORS errors
- Network errors

#### **Diagnosis:**
```bash
# Check browser console
# Open Developer Tools → Console

# Test API endpoint
curl https://yourdomain.com/api/health

# Check CORS headers
curl -H "Origin: https://yourdomain.com" -I https://yourdomain.com/api/health
```

#### **Solutions:**

**A. CORS Configuration**
```javascript
// api-gateway/src/index.js
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
    credentials: true
}));
```

**B. API URL Configuration**
```bash
# Check VITE_API_URL
echo $VITE_API_URL

# Should be relative path for production
VITE_API_URL=/api
```

---

## 🔒 **SECURITY ISSUES**

### **1. SSL Certificate Issues**

#### **Symptoms:**
- SSL certificate errors
- Mixed content warnings
- Certificate expired

#### **Diagnosis:**
```bash
# Check certificate status
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect yourdomain.com:443

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout | grep "Not After"
```

#### **Solutions:**

**A. Certificate Renewal**
```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Reload nginx
sudo nginx -s reload
```

**B. Certificate Installation**
```bash
# Check certificate files
ls -la /etc/letsencrypt/live/yourdomain.com/

# Verify nginx configuration
sudo nginx -t
```

### **2. Rate Limiting Issues**

#### **Symptoms:**
- 429 Too Many Requests
- Legitimate users blocked
- API unavailable

#### **Diagnosis:**
```bash
# Check rate limit logs
sudo tail -f /var/log/nginx/access.log | grep "429"

# Test rate limiting
for i in {1..20}; do curl -I https://yourdomain.com/api/health; done
```

#### **Solutions:**

**A. Adjust Rate Limits**
```nginx
# Increase rate limits in nginx.conf
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
limit_req zone=api burst=50 nodelay;
```

**B. Whitelist IPs**
```nginx
# Whitelist specific IPs
geo $whitelist {
    default 0;
    192.168.1.0/24 1;
    10.0.0.0/8 1;
}

map $whitelist $limit {
    0 $binary_remote_addr;
    1 "";
}

limit_req_zone $limit zone=api:10m rate=10r/s;
```

---

## 📊 **PERFORMANCE ISSUES**

### **1. Slow Response Times**

#### **Symptoms:**
- High response times
- Timeout errors
- Poor user experience

#### **Diagnosis:**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/api/health

# Monitor system resources
htop
iostat -x 1

# Check database performance
docker exec microservices-mongodb-auth mongosh --eval "db.runCommand({serverStatus: 1})"
```

#### **Solutions:**

**A. Database Optimization**
```javascript
// Add database indexes
db.todos.createIndex({ userId: 1, createdAt: -1 });
db.todos.createIndex({ userId: 1, completed: 1 });
```

**B. Application Optimization**
```bash
# Increase container resources
services:
  auth-service:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### **2. High Memory Usage**

#### **Symptoms:**
- Out of memory errors
- Container killed
- System slowdown

#### **Diagnosis:**
```bash
# Check memory usage
docker stats
free -h
ps aux --sort=-%mem | head

# Check for memory leaks
docker exec microservices-auth-service node --inspect=0.0.0.0:9229
```

#### **Solutions:**

**A. Memory Limits**
```bash
# Set memory limits
services:
  auth-service:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

**B. Application Optimization**
```javascript
// Implement connection pooling
const mongoose = require('mongoose');
mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});
```

---

## 🔧 **MAINTENANCE TASKS**

### **Regular Maintenance**

#### **Daily Tasks**
```bash
# Check system status
docker ps
docker stats --no-stream

# Check logs for errors
docker-compose logs --tail=100 | grep -i error

# Check disk space
df -h
docker system df
```

#### **Weekly Tasks**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker
docker system prune -f

# Check certificate expiration
sudo certbot certificates

# Backup configuration
sudo cp -r /etc/nginx /backup/nginx-$(date +%Y%m%d)
```

#### **Monthly Tasks**
```bash
# Security audit
sudo apt list --upgradable
sudo fail2ban-client status

# Performance review
sudo journalctl --since "1 month ago" | grep -i error

# Update dependencies
cd microservices
git pull origin main
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 **SUPPORT RESOURCES**

### **Documentation**
- **Docker**: https://docs.docker.com/
- **Nginx**: https://nginx.org/en/docs/
- **MongoDB**: https://docs.mongodb.com/
- **Azure Cosmos DB**: https://docs.microsoft.com/en-us/azure/cosmos-db/

### **Community Support**
- **Stack Overflow**: Tag questions with relevant technologies
- **GitHub Issues**: Report bugs và feature requests
- **Docker Community**: https://forums.docker.com/

### **Monitoring Tools**
- **Azure Monitor**: For Azure resources
- **Prometheus + Grafana**: For application metrics
- **ELK Stack**: For log analysis

---

**📚 Troubleshooting guide này sẽ giúp bạn nhanh chóng xác định và khắc phục các vấn đề trong hệ thống microservices!**
