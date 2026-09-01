# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Cache node_modules separately from source
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ── Stage 2: Runtime (Nginx) ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
