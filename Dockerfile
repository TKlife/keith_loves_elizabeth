FROM node:latest

WORKDIR /app

RUN mkdir backend

COPY ./backend/dist/ .

COPY ./backend/package.json .

RUN ["npm",  "install"]

COPY ./www/browser/. ./www

EXPOSE 80

EXPOSE 443

CMD ["node", "server.js"]