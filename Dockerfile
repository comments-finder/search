FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm ci
RUN npm run build
RUN rm -rf ./node_modules && npm cache clean --force

RUN npm ci --omit=dev
RUN rm -rf ./package-lock.json && npm cache clean --force

FROM node:18-alpine AS prod

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

EXPOSE 4000

RUN chmod +x ./start.sh
CMD ["./start.sh"]