# Multi-stage hardened container for PromptPulse
# Maintainer: Jatin Sharma (https://jatinsh.netlify.app/)

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
COPY src/ ./src/
RUN npm install -g typescript && tsc

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=builder /app/dist ./dist

# Non-root user execution
USER node
EXPOSE 6060

ENTRYPOINT ["node", "dist/bin.js"]
CMD ["studio"]
