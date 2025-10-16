# 🔧 NGINX CONFIGURATION GUIDE

## 🎯 **TỔNG QUAN NGINX**

Nginx đóng vai trò là **reverse proxy** và **load balancer** trong hệ thống microservices, cung cấp:

- **SSL Termination** - Xử lý HTTPS
- **Request Routing** - Định tuyến requests đến services
- **Rate Limiting** - Bảo vệ API khỏi abuse
- **Security Headers** - Tăng cường bảo mật
- **Static File Serving** - Phục vụ frontend files

---

## 🏗️ **NGINX ARCHITECTURE**

### **Request Flow**
```
Internet → Nginx (Port 80/443) → API Gateway (Port 3000) → Microservices
                ↓
         Frontend (Port 5173)
```

### **Configuration Structure**
```
nginx/
├── nginx.conf              # Main configuration
└── sites-available/        # Site configurations
    └── microservices       # Production site config
```

---

## ⚙️ **MAIN CONFIGURATION**

### **nginx/nginx.conf**
```nginx
# Main nginx configuration
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate Limiting Zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=register:10m rate=3r/m;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # Security Headers Template
    map $sent_http_content_type $csp_header {
        ~^text/html "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';";
        default "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';";
    }
    
    # HTTP to HTTPS Redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }
    
    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name _;
        
        # SSL Certificate paths (update these with your actual certificate paths)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy $csp_header always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
        
        # API Routes với Rate Limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            # Xóa /api/ khỏi path trước khi chuyển tiếp
            rewrite /api/(.*) /$1 break;
            
            # Proxy to API Gateway
            proxy_pass http://api-gateway:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
            
            # Timeout settings
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            
            # Buffer settings
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }
        
        # Login endpoint với stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            
            rewrite /api/(.*) /$1 break;
            proxy_pass http://api-gateway:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Register endpoint với strictest rate limiting
        location /api/auth/register {
            limit_req zone=register burst=3 nodelay;
            
            rewrite /api/(.*) /$1 break;
            proxy_pass http://api-gateway:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Frontend application
        location / {
            proxy_pass http://frontend:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
            
            # Cache settings for static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                add_header Vary "Accept-Encoding";
            }
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Security.txt
        location /.well-known/security.txt {
            return 200 "Contact: mailto:security@yourdomain.com\nExpires: 2025-12-31T23:59:59.000Z\nPreferred-Languages: en\nCanonical: https://yourdomain.com/.well-known/security.txt\n";
            add_header Content-Type text/plain;
        }
        
        # Robots.txt
        location /robots.txt {
            return 200 "User-agent: *\nDisallow: /api/\nSitemap: https://yourdomain.com/sitemap.xml\n";
            add_header Content-Type text/plain;
        }
        
        # Block access to sensitive files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
        
        location ~ ~$ {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
}
```

---

## 🔒 **SECURITY CONFIGURATION**

### **SSL/TLS Configuration**

#### **Certificate Management**
```bash
# Let's Encrypt certificates
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Custom certificates
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

#### **SSL Security Settings**
```nginx
# Modern SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

### **Security Headers**

#### **HSTS (HTTP Strict Transport Security)**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

#### **Content Security Policy**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';" always;
```

#### **Other Security Headers**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

## 🚦 **RATE LIMITING**

### **Rate Limiting Zones**
```nginx
# General API rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Login endpoint rate limiting
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Registration rate limiting
limit_req_zone $binary_remote_addr zone=register:10m rate=3r/m;

# File upload rate limiting
limit_req_zone $binary_remote_addr zone=upload:10m rate=2r/s;
```

### **Rate Limiting Implementation**
```nginx
# API endpoints
location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... proxy configuration
}

# Login endpoint
location /api/auth/login {
    limit_req zone=login burst=5 nodelay;
    # ... proxy configuration
}

# Registration endpoint
location /api/auth/register {
    limit_req zone=register burst=3 nodelay;
    # ... proxy configuration
}
```

### **Rate Limiting Headers**
```nginx
# Add rate limit headers
add_header X-RateLimit-Limit $limit_req_status always;
add_header X-RateLimit-Remaining $limit_req_status always;
add_header X-RateLimit-Reset $limit_req_status always;
```

---

## 📊 **LOGGING CONFIGURATION**

### **Access Log Format**
```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for" '
                'rt=$request_time uct="$upstream_connect_time" '
                'uht="$upstream_header_time" urt="$upstream_response_time"';

access_log /var/log/nginx/access.log main;
```

### **Error Log Configuration**
```nginx
error_log /var/log/nginx/error.log warn;
```

### **Log Rotation**
```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 nginx adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

---

## 🚀 **PERFORMANCE OPTIMIZATION**

### **Gzip Compression**
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

### **Caching Configuration**
```nginx
# Static assets caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    
    # Enable gzip for cached files
    gzip_static on;
}

# API response caching (if appropriate)
location /api/static/ {
    proxy_pass http://api-gateway:3000;
    proxy_cache_valid 200 1h;
    proxy_cache_valid 404 1m;
    add_header X-Cache-Status $upstream_cache_status;
}
```

### **Connection Optimization**
```nginx
# Keep-alive settings
keepalive_timeout 65;
keepalive_requests 100;

# Buffer settings
client_body_buffer_size 128k;
client_max_body_size 10M;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;

# Proxy buffer settings
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
```

---

## 🔧 **PROXY CONFIGURATION**

### **API Gateway Proxy**
```nginx
location /api/ {
    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    
    # URL rewriting
    rewrite /api/(.*) /$1 break;
    
    # Proxy settings
    proxy_pass http://api-gateway:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    
    # Timeout settings
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    
    # Error handling
    proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    proxy_next_upstream_tries 3;
    proxy_next_upstream_timeout 10s;
}
```

### **Frontend Proxy**
```nginx
location / {
    proxy_pass http://frontend:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    
    # Handle WebSocket connections (if needed)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

---

## 🧪 **TESTING CONFIGURATION**

### **Configuration Test**
```bash
# Test nginx configuration
sudo nginx -t

# Test configuration with specific config file
sudo nginx -t -c /etc/nginx/nginx.conf
```

### **Performance Testing**
```bash
# Test with ab (Apache Bench)
ab -n 1000 -c 10 https://yourdomain.com/health

# Test with wrk
wrk -t12 -c400 -d30s https://yourdomain.com/api/health

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

### **Security Testing**
```bash
# Test SSL Labs
# Visit: https://www.ssllabs.com/ssltest/

# Test security headers
curl -I https://yourdomain.com/

# Test rate limiting
for i in {1..20}; do curl -I https://yourdomain.com/api/health; done
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **1. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout
```

#### **2. Rate Limiting Issues**
```bash
# Check rate limit logs
sudo tail -f /var/log/nginx/access.log | grep "503"

# Test rate limiting
curl -I https://yourdomain.com/api/auth/login
```

#### **3. Proxy Issues**
```bash
# Check upstream connectivity
curl -I http://api-gateway:3000/health

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### **4. Performance Issues**
```bash
# Check nginx status
sudo systemctl status nginx

# Check worker processes
ps aux | grep nginx

# Monitor connections
ss -tuln | grep :443
```

---

## 📈 **MONITORING & METRICS**

### **Nginx Status Module**
```nginx
# Enable status module
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

### **Custom Metrics**
```nginx
# Add custom headers for monitoring
add_header X-Response-Time $request_time always;
add_header X-Upstream-Response-Time $upstream_response_time always;
add_header X-Cache-Status $upstream_cache_status always;
```

### **Log Analysis**
```bash
# Analyze access logs
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Check response codes
sudo awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# Monitor slow requests
sudo awk '$NF > 1 {print $0}' /var/log/nginx/access.log
```

---

## 🔄 **MAINTENANCE**

### **Regular Maintenance Tasks**
```bash
# Reload configuration
sudo nginx -s reload

# Restart nginx
sudo systemctl restart nginx

# Check configuration
sudo nginx -t

# Update certificates
sudo certbot renew

# Rotate logs
sudo logrotate -f /etc/logrotate.d/nginx
```

### **Backup Configuration**
```bash
# Backup nginx configuration
sudo cp -r /etc/nginx /backup/nginx-$(date +%Y%m%d)

# Backup SSL certificates
sudo cp -r /etc/letsencrypt /backup/letsencrypt-$(date +%Y%m%d)
```

---

**📚 Nginx configuration này đảm bảo hiệu suất cao, bảo mật tốt và dễ dàng maintain trong production!**
