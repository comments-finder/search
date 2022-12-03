FROM node:18-alpine AS search

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 4000
CMD [ "npm", "start" ]
