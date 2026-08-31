# Production Dockerfile for Node.js + TypeScript + Prisma ORM Backend

FROM node:20-alpine

# Install OpenSSL required by Prisma binary query engine on Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Set default environment variables inside container
ENV DATABASE_URL="file:./dev.db"
ENV PORT=8080
ENV JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
ENV SESSION_SECRET="ghmc_session_secret_key_2026"
ENV GEMINI_API_KEY="demo_key"

# Copy package definition & Prisma schema & .env
COPY package*.json ./
COPY .env ./
COPY prisma ./prisma/

# Install dependencies & generate Prisma client
RUN npm install
RUN npx prisma generate

# Copy source code & static frontend assets
COPY tsconfig.json ./
COPY src ./src

# Expose HTTP port
EXPOSE 8080

# Push database schema, seed initial data & start Node.js server
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm run dev"]
