# Production image: build the SPA once, serve static assets only.
# Secrets are excluded by .dockerignore and are never copied into this image.
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
