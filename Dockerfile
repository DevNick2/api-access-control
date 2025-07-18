FROM node:20-alpine
WORKDIR /api
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

# Install Chrome
RUN apk add --no-cache \
  poppler-utils \
  poppler-data \
  udev \
  ttf-freefont \
  chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . .
RUN yarn build
EXPOSE 3001
CMD [ "yarn", "start:prod" ]