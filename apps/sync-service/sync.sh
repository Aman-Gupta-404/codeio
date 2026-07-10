#!/bin/sh

set -eu

echo "========================================="
echo "Workspace Sync Sidecar Started"
echo "========================================="

echo "Project: ${PROJECT_ID}"
echo "Bucket : ${R2_BUCKET}"

INTERVAL="${SYNC_INTERVAL:-300}"

sync_workspace() {
    echo "-----------------------------------------"
    echo "Sync started at $(date)"

    if aws s3 sync \
        /workspace \
        s3://${R2_BUCKET}/projects/${PROJECT_ID}/ \
        --endpoint-url="${R2_ENDPOINT}" \
        --delete
    then
        echo "Sync completed successfully."
    else
        echo "Sync failed. Will retry on next interval."
    fi
}

trap 'echo "SIGTERM received"; sync_workspace; exit 0' TERM INT

# Wait a little before first sync
sleep 10

while true
do
    sync_workspace
    sleep "$INTERVAL"
done