#!/bin/bash

docker build -t docker.rcode.link/my-organisation:v0.4 -f deploy/prod/Dockerfile .
docker push docker.rcode.link/my-organisation:v0.4
#curl -X POST https://portainer.rcode.link/api/webhooks/12cba4c1-94a1-4cd8-8395-cbf381d2f720
