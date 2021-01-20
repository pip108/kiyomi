FROM node:14-slim as build
RUN apt-get update && apt-get install python -y
WORKDIR /kiyomi
COPY package*.json ./
RUN npm install --silent
COPY . . 
RUN npm run build

FROM nginx
COPY --from=build /kiyomi/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80