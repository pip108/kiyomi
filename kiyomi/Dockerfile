FROM node:14-slim as build
WORKDIR /opt/kiyomi/app
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
CMD ["yarn", "start"]