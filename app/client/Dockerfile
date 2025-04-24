FROM node:23-alpine AS build_app

WORKDIR /client_app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx vite build

FROM nginx:alpine

COPY --from=build_app /client_app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
