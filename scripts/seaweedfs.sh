#!/bin/bash

MASTER_PORT=${SEAWEEDFS_MASTER_PORT:-9333}
VOLUME_PORT=${SEAWEEDFS_VOLUME_PORT:-8080}
FILER_PORT=${SEAWEEDFS_FILER_PORT:-8888}
S3_PORT=${SEAWEEDFS_S3_PORT:-8333}
BUCKET=${AWS_BUCKET:-collabhub}

# Start SeaweedFS in background to capture PID
docker run --rm \
  -p "${MASTER_PORT}:9333" \
  -p "${VOLUME_PORT}:8080" \
  -p "${FILER_PORT}:8888" \
  -p "${S3_PORT}:8333" \
  -e S3_ACCESS_KEY="${AWS_ACCESS_KEY_ID:-any}" \
  -e S3_SECRET_KEY="${AWS_SECRET_ACCESS_KEY:-any}" \
  -v seaweedfs-data:/data \
  chrislusf/seaweedfs server -dir=/data -filer -s3 &

DOCKER_PID=$!

# Wait for S3 API to respond
echo "Waiting for SeaweedFS S3 API on port ${S3_PORT}..."
until curl -sf "http://localhost:${S3_PORT}/" >/dev/null 2>&1; do
    sleep 1
done

# Create bucket if it doesn't exist
STATUS=$(curl -so /dev/null -w "%{http_code}" "http://localhost:${S3_PORT}/${BUCKET}")
if [ "$STATUS" != "200" ]; then
    echo "Creating bucket: ${BUCKET}"
    curl -sX PUT "http://localhost:${S3_PORT}/${BUCKET}"
    echo "Bucket '${BUCKET}' ready."
else
    echo "Bucket '${BUCKET}' already exists."
fi

wait $DOCKER_PID
