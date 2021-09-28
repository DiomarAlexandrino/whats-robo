FROM node:alpine

WORKDIR /usr/app

COPY package.json ./
RUN sudo npm install

COPY . .

EXPOSE 9000

CMD ["npm","start"]