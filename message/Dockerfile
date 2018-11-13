FROM node:latest
ADD . /message
WORKDIR /message
RUN npm install

LABEL version="1.0"

CMD ["node", "index.js"]