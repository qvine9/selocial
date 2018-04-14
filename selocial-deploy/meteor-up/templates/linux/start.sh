#!/bin/bash

APPNAME=<%= appName %>
APP_PATH=/opt/$APPNAME
BUNDLE_PATH=$APP_PATH/current
ENV_FILE=$APP_PATH/config/env.list
PORT=<%= port %>
USE_LOCAL_MONGO=<%= useLocalMongo? "1" : "0" %>
#DOCKER_CONTAINER_NAME=<%= /admin/.test(appName) ? 'abernix/meteord:base' : 'meteorhacks/meteord:base' %>
DOCKER_CONTAINER_NAME=abernix/meteord:base

# Remove previous version of the app, if exists
docker rm -f $APPNAME

# Remove frontend container if exists
# docker rm -f $APPNAME-frontend

# We don't need to fail the deployment because of a docker hub downtime
set +e
docker pull $DOCKER_CONTAINER_NAME
set -e

if [ "$USE_LOCAL_MONGO" == "1" ]; then
  docker run \
    -d \
    --restart=always \
    --publish=$PORT:80 \
    --volume=$BUNDLE_PATH:/bundle \
    --env-file=$ENV_FILE \
    --link=mongodb:mongodb \
    --hostname="$HOSTNAME-$APPNAME" \
    --env=MONGO_URL=mongodb://mongodb:27017/selocial \
    --name=$APPNAME \
    $DOCKER_CONTAINER_NAME

else
  docker run \
    -d \
    --restart=always \
    --publish=$PORT:80 \
    --volume=$BUNDLE_PATH:/bundle \
    --hostname="$HOSTNAME-$APPNAME" \
    --env-file=$ENV_FILE \
    --name=$APPNAME \
    $DOCKER_CONTAINER_NAME
fi

<% if(!/admin/.test(appName)){ %>
docker exec $APPNAME /usr/bin/apt-get -qq update
docker exec $APPNAME /usr/bin/apt-get -qq -y install wget mp3info libavcodec-extra graphicsmagick imagemagick # libav-tools

docker exec $APPNAME /usr/bin/wget http://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz
docker exec $APPNAME /bin/tar xf ffmpeg-release-64bit-static.tar.xz --strip=1
docker exec $APPNAME /bin/cp ffmpeg /usr/bin/
<% } %>
