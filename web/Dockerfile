FROM node:20-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Build the Next.js app
# (Note: In dev mode we might just run npm run dev, but for a stable Docker image we usually build)
# However, for docker-compose development we often use a different CMD or volume mapping.
# According to docker-compose.yml, it doesn't specify a command, so it will use the default.
CMD ["npm", "run", "dev"]
