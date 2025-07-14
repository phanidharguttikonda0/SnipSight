# ---- Build Stage ----
FROM rust:1.86.0 as builder

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
COPY --from=builder /usr/src/app/target/release/url_shortner_app /usr/local/bin/url_shortner_app

# Switch to the non-root user
USER rustuser

# Expose the port your app listens on (adjust accordingly)
EXPOSE 9091

# Start your app
CMD ["url_shortner_app"]
