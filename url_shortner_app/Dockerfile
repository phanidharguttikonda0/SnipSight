# ---- Build Stage ----
FROM rust:1.86.0 as builder

# Install protoc and build dependencies
RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    pkg-config \
    libssl-dev \
    build-essential \
    && apt-get clean

# Set working directory
WORKDIR /usr/src/app

# Copy manifests and partial code to cache deps
COPY Cargo.toml Cargo.lock ./
COPY build.rs ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release || true
RUN rm -rf src

# Copy the full source code
COPY . .

# Build your app
RUN cargo build --release

# ---- Runtime Stage ----
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt update && apt install -y libssl3 ca-certificates && apt clean

# Create non-root user
RUN adduser --disabled-password --gecos '' rustuser

# Copy compiled binary
COPY --from=builder /usr/src/app/target/release/url_shortner_app /usr/local/bin/url_shortner_app

# Set user and expose port
USER rustuser
EXPOSE 9091

CMD ["url_shortner_app"]
