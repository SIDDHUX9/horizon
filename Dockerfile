FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Run Vite dev server bound to 0.0.0.0 for container networking
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
