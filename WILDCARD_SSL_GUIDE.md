# Wildcard SSL Setup Guide for *.lunix.com

## 🎯 **Mục tiêu:**
Tạo wildcard SSL certificate cho `*.lunix.com` để sử dụng cho tất cả subdomain.

## 📋 **Các phương pháp:**

### **1. Self-Signed Certificate (Testing)**
```bash
# Windows
generate-wildcard-ssl.bat

# Linux/Mac
chmod +x generate-wildcard-ssl.sh
./generate-wildcard-ssl.sh
```

### **2. Let's Encrypt (Free, Production)**
```bash
chmod +x setup-letsencrypt-wildcard.sh
./setup-letsencrypt-wildcard.sh
```

### **3. Name.com SSL (Paid)**

## 🔧 **Phương pháp 1: Self-Signed (Nhanh nhất)**

### **Bước 1: Generate CSR**
```bash
# Tạo private key
openssl genrsa -out ssl/wildcard.lunix.com.key 2048

# Tạo CSR
openssl req -new -key ssl/wildcard.lunix.com.key -out ssl/wildcard.lunix.com.csr \
  -subj "/C=VN/ST=Ho Chi Minh/L=Ho Chi Minh City/O=Lunix/OU=IT Department/CN=*.lunix.com"
```

### **Bước 2: Gửi CSR cho Name.com**
1. Mở file `ssl/wildcard.lunix.com.csr`
2. Copy toàn bộ nội dung (bao gồm `-----BEGIN CERTIFICATE REQUEST-----`)
3. Gửi cho Name.com support để họ sign certificate

### **Bước 3: Nhận certificate từ Name.com**
1. Name.com sẽ gửi lại signed certificate
2. Paste vào `ssl/cert.pem`
3. Copy private key vào `ssl/key.pem`

## 🔧 **Phương pháp 2: Let's Encrypt (Free)**

### **Yêu cầu:**
- Quyền quản lý DNS của lunix.com
- Server có thể truy cập internet

### **Bước 1: Install Certbot**
```bash
# Ubuntu/Debian
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot

# macOS
brew install certbot
```

### **Bước 2: Generate Certificate**
```bash
certbot certonly --manual --preferred-challenges dns \
  --email admin@lunix.com --agree-tos --no-eff-email \
  -d "*.lunix.com" -d "lunix.com"
```

### **Bước 3: DNS Challenge**
Certbot sẽ yêu cầu bạn thêm TXT record vào DNS:
```
Name: _acme-challenge.lunix.com
Type: TXT
Value: [random-string-from-certbot]
```

### **Bước 4: Copy Certificates**
```bash
sudo cp /etc/letsencrypt/live/lunix.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/lunix.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
```

## 🔧 **Phương pháp 3: Name.com SSL**

### **Nếu Name.com hỗ trợ wildcard:**
1. Đăng nhập Name.com control panel
2. Tìm SSL certificate section
3. Tạo wildcard certificate cho `*.lunix.com`
4. Download certificate files
5. Copy vào `ssl/cert.pem` và `ssl/key.pem`

### **Nếu Name.com không hỗ trợ wildcard:**
1. Tạo certificate riêng cho từng subdomain
2. Hoặc sử dụng Let's Encrypt

## 🌐 **DNS Configuration**

### **Cần tạo các DNS records:**
```
lunix.com           A    [Your Server IP]
*.lunix.com         A    [Your Server IP]
todo.lunix.com      A    [Your Server IP]
api.lunix.com       A    [Your Server IP]
admin.lunix.com     A    [Your Server IP]
```

## 🚀 **Deploy với SSL**

### **Sau khi có certificate:**
```bash
# Windows
start-ssl.bat

# Linux/Mac
chmod +x start-ssl.sh
./start-ssl.sh

# Manual
docker-compose -f docker-compose.ssl.yml up -d
```

## 🔄 **Auto-renewal (Let's Encrypt)**

### **Setup cron job:**
```bash
# Edit crontab
crontab -e

# Add this line
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f docker-compose.ssl.yml restart nginx-ssl
```

## 🐛 **Troubleshooting**

### **Certificate không hoạt động:**
1. Check certificate format: `openssl x509 -in ssl/cert.pem -text -noout`
2. Verify domain: `openssl x509 -in ssl/cert.pem -text -noout | grep -A1 "Subject Alternative Name"`
3. Check private key match: `openssl x509 -noout -modulus -in ssl/cert.pem | openssl md5`

### **DNS không resolve:**
1. Check DNS: `nslookup todo.lunix.com`
2. Wait for propagation: 5-30 minutes
3. Check DNS provider settings

### **Nginx errors:**
1. Check logs: `docker logs microservices-nginx-ssl`
2. Test config: `nginx -t`
3. Restart nginx: `docker-compose -f docker-compose.ssl.yml restart nginx-ssl`

## 📝 **Notes**

- **Wildcard certificate** hoạt động cho `*.lunix.com` và `lunix.com`
- **Let's Encrypt** free nhưng cần renew mỗi 90 ngày
- **Name.com SSL** có thể đắt hơn nhưng ổn định hơn
- **Self-signed** chỉ dùng cho testing, browser sẽ báo warning
