# Build stage: Use a lightweight Alpine Linux image
FROM alpine:latest

# Install necessary dependencies (certificates for HTTPS, unzip, etc.)
RUN apk add --no-cache \
    unzip \
    ca-certificates

# Set the PocketBase version
ARG PB_VERSION=0.22.4

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Expose the port PocketBase runs on
EXPOSE 8090

# Start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
