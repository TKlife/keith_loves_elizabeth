#!/bin/bash

if [ -z "$1" ]
then
    TAG="latest"
else
    TAG=$1
fi
echo "Tag is $TAG"

cd frontend

ng build --output-path ../www --configuration production --deploy-url /resource/ --base-href /event/

cd ..

cd backend

npx tsc

cd ..

docker build -t kbush23/keith_loves_elizabeth:$TAG .