FROM node:14-slim
RUN apt-get update
RUN apt-get install python -y && apt-get install g++ -y && apt-get install make -y
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . . 

EXPOSE 3002

CMD [ "node", "kiyomi-api.js"]