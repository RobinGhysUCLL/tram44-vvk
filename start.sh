#!/bin/bash
set -e

# Configuratie
BUILD_NUMBER=$(date +%s)
APP_NAME="VVK-tram44"
PORT=3511
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "🚀 Starting zero-downtime deployment..."

# Build nieuwe container met uniek label
echo "📦 Building new container..."
CONTAINER_NAME="${APP_NAME}-${BUILD_NUMBER}"
docker compose build

# Start nieuwe container
echo "🏃 Starting new container..."
BUILD_NUMBER=$BUILD_NUMBER docker compose up -d

# Wacht tot nieuwe container ECHT ready is
echo "🏥 Waiting for health check..."
retries=0
while [ $retries -lt $MAX_RETRIES ]; do
    if curl -s "http://localhost:${PORT}" > /dev/null; then
        echo "✅ New container is healthy!"
        
        # Stop oude containers pas als nieuwe werkt
        echo "🧹 Cleaning up old containers..."
        docker ps -a | grep "^.*${APP_NAME}-[0-9]\+" | grep -v "${APP_NAME}-${BUILD_NUMBER}" | while read -r container; do
            CONTAINER_ID=$(echo "$container" | awk '{print $1}')
            echo "Stopping container $CONTAINER_ID..."
            docker stop $CONTAINER_ID --time 30
            docker rm $CONTAINER_ID
        done
        
        echo "✨ Deployment completed successfully!"
        exit 0
    fi
    
    echo "⏳ Waiting for container to be ready... (${retries}/${MAX_RETRIES})"
    sleep $RETRY_INTERVAL
    retries=$((retries + 1))
done

# Als we hier komen, is de nieuwe container niet gezond
echo "❌ New container failed health check! Rolling back..."
docker logs "${APP_NAME}-${BUILD_NUMBER}"
docker stop "${APP_NAME}-${BUILD_NUMBER}"
docker rm "${APP_NAME}-${BUILD_NUMBER}"
exit 1