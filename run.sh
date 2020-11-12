#!/usr/bin/env bash

if [[ $1 != "prod" ]] && [[ $1 != "dev" ]]; then
  echo ''
  echo 'Use dev of prod as first parameter'
  echo ''
  exit 1
fi

docker build -t twake-mobile-server .

if docker ps | grep -q twake-mobile-server; then
  docker stop twake-mobile-server
fi

if docker ps -a | grep -q twake-mobile-server; then
  docker rm -f twake-mobile-server
fi

if [[ $1 == "prod" ]]; then
  echo "Starting in PROD mode"
  docker run -e NODE_ENV=production -p 3123:3123 -p 3124:3124 --name twake-mobile-server -d twake-mobile-server

elif [[ $1 == "dev" ]]; then
  echo "Starting in DEV mode"
  docker run -e NODE_ENV=development -p 3123:3123 -p 3124:3124 -p 5858:5858 --name twake-mobile-server -v $(pwd):/opt/app -it twake-mobile-server nodemon  server.js
fi
