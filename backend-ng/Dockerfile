FROM alpine:latest

RUN apk add --no-cache \
  ca-certificates \
  unzip \
  wget \
  && rm -rf /var/cache/apk/*

# Download and install PocketBase
ARG POCKETBASE_VERSION=0.33.0
RUN wget -O pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip \
  && unzip pocketbase.zip \
  && chmod +x pocketbase \
  && mv pocketbase /usr/local/bin/ \
  && rm pocketbase.zip

# Create app directory
WORKDIR /app

# Create data directory
RUN mkdir -p /app/pb_data

# Copy pb_* files
COPY pb_* ./

# Expose port
EXPOSE 8090

# Run PocketBase
CMD ["pocketbase", "serve", "--http=0.0.0.0:8090", "--automigrate"]
