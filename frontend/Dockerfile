
# Development stage: install all dependencies, compile TypeScript, and
# serve with hot-reload. Used directly in development via compose.yaml.
FROM node:24-alpine AS dev

WORKDIR /app

# Install dependencies as a separate step to take advantage of Docker's
# caching. Leverage a cache mount to /root/.npm to speed up subsequent
# builds. Leverage a bind mount to package.json to avoid having to copy
# it into this layer.
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci

COPY . .


EXPOSE 3000

CMD ["npm", "run", "dev"]


# Deps stage: install production dependencies only.
FROM node:24-alpine AS deps

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci --omit=dev --no-audit --no-fund



FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules

COPY . .

ENV NODE_ENV=production

RUN npm run build


# Runner stage: minimal runtime image with compiled app and production deps.
FROM node:24-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the run time.
# ENV NEXT_TELEMETRY_DISABLED=1

# Copy production assets
COPY --from=builder --chown=node:node /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# If you want to persist the fetch cache generated during the build so that
# cached responses are available immediately on startup, uncomment this line:
# COPY --from=builder --chown=node:node /app/.next/cache ./.next/cache

# Switch to non-root user for security best practices
USER node

# Expose port 3000 to allow HTTP traffic
EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]
