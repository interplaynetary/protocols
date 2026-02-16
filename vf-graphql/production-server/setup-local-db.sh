#!/bin/bash
set -e

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker could not be found."
    echo "This script requires Docker to be installed. Please run:"
    echo ""
    echo "  sudo apt update && sudo apt install -y docker.io docker-compose-v2"
    echo "  sudo usermod -aG docker \$USER"
    echo ""
    echo "Then log out and back in (or run 'newgrp docker') to apply permissions."
    exit 1
fi

# Check if docker daemon is checking permissions
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not accessible. You may need to use 'sudo' or add your user to the 'docker' group."
    exit 1
fi

echo "🚀 Starting PostgreSQL container..."
docker compose up -d

echo "⏳ Waiting for database to be ready..."
until docker compose exec db pg_isready -U user; do
  echo "Sleeping 2s..."
  sleep 2
done

echo "✅ Database is up and running!"
echo "📍 Connection: postgresql://user:password@localhost:5432/valueflows"
