# Build stage
FROM node:23-alpine AS build_app

WORKDIR /client_app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx vite build

FROM node:23-alpine
WORKDIR /app

COPY --from=build_app /client_app/dist ./dist

RUN npm install -g serve

EXPOSE 80

# Start the server
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:80"]