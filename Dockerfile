# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /build
# Copy package files from the 'app' directory
COPY app/package*.json ./
RUN npm install
# Copy the rest of the frontend source code
COPY app/ .
# Build the app with relative API URL (so it talks to the same server)
ENV VITE_PB_URL="/"
RUN npm run build

# Stage 2: Setup PocketBase
FROM alpine:latest

# Install necessary dependencies
RUN apk add --no-cache unzip ca-certificates

# Set the PocketBase version
ARG PB_VERSION=0.22.4

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Copy the compiled Frontend from Stage 1 to PocketBase's public folder
COPY --from=frontend-build /build/dist /pb/pb_public

# Expose the port
EXPOSE 8090

# Start PocketBase
CMD ["sh", "-c", "/pb/pocketbase serve --http=0.0.0.0:${PORT:-8090}"]
