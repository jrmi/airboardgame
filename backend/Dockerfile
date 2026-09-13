FROM node:22-bookworm-slim

WORKDIR /app

# Install production dependencies separately so the final image does not need
# the npm cache or development dependencies.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# These directories are useful for the default NeDB + disk-media setup.
# Bind mounts or named volumes can be attached to /data at runtime.
RUN mkdir -p /data/db /data/media \
  && chown -R node:node /app /data

ENV NODE_ENV=production \
    SERVER_HOST=0.0.0.0 \
    SERVER_PORT=4050 \
    NEDB_BACKEND_DIRNAME=/data/db \
    DISK_DESTINATION=/data/media

USER node

EXPOSE 4050

CMD ["node", "src/server.js"]
