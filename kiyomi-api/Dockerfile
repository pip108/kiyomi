FROM node:14-alpine
WORKDIR /opt/kiyomi/api

COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . . 

CMD ["yarn", "dev"]