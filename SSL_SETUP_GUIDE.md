# SSL Configuration Guide for todo.lunix.codes

## 📋 Files Created

### SSL Certificate Files
- `ssl/cert.pem` - Paste your SSL certificate here
- `ssl/key.pem` - Paste your SSL private key here  
- `ssl/chain.pem` - Paste intermediate certificate here (optional)

### Configuration Files
- `nginx/nginx-ssl.conf` - Nginx configuration for SSL
- `docker-compose.ssl.yml` - Docker Compose with SSL proxy
- `start-ssl.sh` - Linux/Mac startup script
- `start-ssl.bat` - Windows startup script

## 🔧 Configuration Steps

### 1. Add SSL Certificates
1. Open `ssl/cert.pem` and paste your SSL certificate content
2. Open `ssl/key.pem` and paste your SSL private key content
3. If you have intermediate certificates, paste them in `ssl/chain.pem`

### 2. Certificate Format
Your certificate should look like this:
```
-----BEGIN CERTIFICATE-----
MIIFjTCCA3WgAwIBAgIJAK...
[Your certificate content]
-----END CERTIFICATE-----
```

Your private key should look like this:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
[Your private key content]
-----END PRIVATE KEY-----
```

### 3. DNS Configuration
Make sure your DNS is configured:
- `todo.lunix.codes` → Your server's IP address
- `A` record pointing to your server

### 4. Start Services

#### Linux/Mac:
```bash
chmod +x start-ssl.sh
./start-ssl.sh
```

#### Windows:
```cmd
start-ssl.bat
```

#### Manual:
```bash
docker-compose -f docker-compose.ssl.yml up --build -d
```

## 🌐 Access Points

- **Main App**: https://todo.lunix.codes
- **API**: https://todo.lunix.codes/api/
- **Health Check**: https://todo.lunix.codes/health
- **RabbitMQ Management**: https://todo.lunix.codes:15672 (admin/password)

## 🔒 Security Features

- **HTTP to HTTPS redirect**: All HTTP traffic redirected to HTTPS
- **HSTS**: HTTP Strict Transport Security enabled
- **Security headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Rate limiting**: API rate limiting configured
- **Modern SSL**: TLS 1.2 and 1.3 only

## 🐛 Troubleshooting

### SSL Certificate Issues
1. Check certificate format (should start with `-----BEGIN CERTIFICATE-----`)
2. Verify certificate is for `todo.lunix.codes`
3. Check certificate expiration date
4. Ensure private key matches certificate

### DNS Issues
1. Verify DNS propagation: `nslookup todo.lunix.codes`
2. Check if domain points to correct IP
3. Wait for DNS propagation (up to 48 hours)

### Port Issues
1. Ensure ports 80 and 443 are open
2. Check firewall settings
3. Verify no other services using these ports

### Service Issues
1. Check logs: `docker-compose -f docker-compose.ssl.yml logs`
2. Verify all services are healthy: `docker-compose -f docker-compose.ssl.yml ps`
3. Check SSL files permissions

## 📝 Notes

- The SSL proxy runs on ports 80 and 443
- Internal services communicate via Docker network
- All traffic is encrypted with your SSL certificate
- Automatic HTTP to HTTPS redirect configured
- Rate limiting protects against abuse
