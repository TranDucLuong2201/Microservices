# auth-service/Dockerfile

FROM node:20-slim
WORKDIR /app
LABEL authors="Duclu"
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 50051

# Start the application
CMD ["npm", "start"]