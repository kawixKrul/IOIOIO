# Development stage
FROM node:23-alpine AS dev

WORKDIR /client_app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:23-alpine AS build_app

WORKDIR /client_app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx vite build

# Production stage
FROM nginx:alpine

COPY --from=build_app /client_app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
