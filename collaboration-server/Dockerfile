FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY server.js .

# Required environment variables (pass via docker run -e or docker-compose):
#
# COLLAB_PORT     - Port the WebSocket server listens on (default: 6002)
# LARAVEL_URL     - Full URL to the Laravel backend (e.g. https://collabhub.example.com)
#                   Used for auth requests and document load/save API calls
# COLLAB_SECRET   - Shared secret between this server and Laravel.
#                   Sent as X-Collab-Secret header on document load/save requests
#                   so Laravel can verify the request comes from the collab server
#                   (not from a regular user). Must match COLLAB_SECRET in Laravel's
#                   .env file (mapped via config/services.php -> services.collab.secret)
#
# Example:
#   docker run -e COLLAB_PORT=6002 \
#              -e LARAVEL_URL=https://collabhub.example.com \
#              -e COLLAB_SECRET=your-random-secret \
#              -p 6002:6002 collabhub-collab


USER node

CMD ["node", "server.js"]
