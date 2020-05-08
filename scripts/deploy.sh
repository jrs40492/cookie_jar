#!/bin/bash

echo "$1" | docker login registry.gitlab.com -u gitlab-ci-token --password-stdin
docker stop my_cookie_jar
docker rm my_cookie_jar

docker run \
-d \
--restart always \
-e SQL_HOST=$5 \
-e SQL_PORT=$6 \
-e SQL_USER=$7 \
-e SQL_PASS=$3 \
-e DB_NAME=$4 \
--name my_cookie_jar \
--net nginx-proxy \
registry.gitlab.com/jrs40492/my_cookie_jar:$2

docker network connect ufsports_net my_cookie_jar

docker image prune -a --force --filter "until=4h"
