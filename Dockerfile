# Dockerfile
FROM node:20-alpine

WORKDIR /app

# install build deps for stockfish wasm if necessary
RUN apk add --no-cache python3 make g++ && rm -rf /var/cache/apk/*

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
