# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /build

# Copy package files first for better caching
COPY app/package*.json ./
RUN npm install --no-audit --no-fund

# Copy source and build
COPY app/ .
ENV VITE_PB_URL="/"
RUN npm run build

# Stage 2: Setup PocketBase
FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates libstdc++

# Use a stable version that matches the original environment
ARG PB_VERSION=0.22.23

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Copy the compiled Frontend
COPY --from=frontend-build /build/dist /pb/pb_public

# Copy database migrations
COPY pb_migrations /pb/pb_migrations

# Start PocketBase with dynamic port support
# Render provides the port in the $PORT env var
CMD ["sh", "-c", "/pb/pocketbase serve --http=0.0.0.0:${PORT:-8090} --dir=/pb/pb_data"]
