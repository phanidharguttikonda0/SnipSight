# ---- Build Stage ----
FROM rust:1.86.0 as builder

# Install protoc and build dependencies
RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    pkg-config \
    libssl-dev \
    build-essential \
    && apt-get clean

# Set the working directory
WORKDIR /usr/src/app

# Copy Cargo files first to cache dependencies
COPY Cargo.toml Cargo.lock ./


# Copy the entire source code
COPY . .

# Build the application in release mode
RUN cargo build --release

# ---- Runtime Stage ----
FROM debian:bookworm-slim

# Install OpenSSL 3 runtime libraries
RUN apt update && apt install -y libssl3 ca-certificates && apt clean

# Add a non-root user (optional)
RUN adduser --disabled-password --gecos '' rustuser

# Copy the compiled binary from the builder
COPY --from=builder /usr/src/app/target/release/api-gateway /usr/local/bin/api-gateway

# Switch to the non-root user
USER rustuser

# Expose the port your app listens on (adjust accordingly)
EXPOSE 8080

# Start your app
CMD ["api-gateway"]
