FROM node:22-alpine AS client-build
WORKDIR /app/client
ARG VITE_API_URL=https://api.your-domain.example/api
ENV VITE_API_URL=$VITE_API_URL
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:22-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/package.json
COPY server/src ./server/src
COPY --from=client-build /app/client/dist ./client/dist
WORKDIR /app/server
EXPOSE 5000
USER node
CMD ["node", "src/server.js"]
