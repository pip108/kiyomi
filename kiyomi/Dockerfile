FROM nginx
COPY nginx/default.dev.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

FROM node:14-slim as build
WORKDIR /opt/kiyomi/app
COPY package*.json ./
RUN npm install --silent
COPY . .
CMD ["npm", "start"]