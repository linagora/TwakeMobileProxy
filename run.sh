#!/usr/bin/env bash

docker build -t twake-mobile-server .

if docker ps | grep -q twake-mobile-server; then
#  docker stop twake-mobile-server
  docker stop twake-mobile-server-web-qa
  docker stop twake-mobile-server-chat
fi

if docker ps -a | grep -q twake-mobile-server; then
#  docker rm -f twake-mobile-server
  docker rm -f twake-mobile-server-web-qa
  docker rm -f twake-mobile-server-chat

fi
docker run -e NODE_ENV=production -e CORE_HOST=https://web.qa.twake.app -p 80:3123 --name twake-mobile-server-web-qa -d twake-mobile-server
docker run -e NODE_ENV=production -e CORE_HOST=https://chat.twake.app -p 3129:3123 --name twake-mobile-server-chat -d twake-mobile-server
