FROM node:14-slim
WORKDIR /mal-reverse-proxy
COPY package*.json ./
RUN npm install --silent
COPY . .
EXPOSE 3001

CMD ["node", "mal-api-proxy.js"]