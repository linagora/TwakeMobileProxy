FROM node:14.15.0-alpine3.12

RUN npm i nodemon -g
ADD package.json /opt/package.json
RUN cd /opt && npm install --production
ENV NODE_PATH=/opt/node_modules
WORKDIR /opt/app
COPY . .
EXPOSE 3123
EXPOSE 3124

CMD [ "node", "server.js" ]
