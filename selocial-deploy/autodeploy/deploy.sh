#!/bin/sh

cd /opt/tmp

eval `ssh-agent -s`

if [ ! -d selocialnode ]; then
    ssh-agent $(ssh-add ../autodeploy.pem; git clone git@github.com:Selocial/selocialnode.git)
    cd selocialnode
    git checkout meteor
    cd selocial-deploy/meteor-up
    npm install
    cd ../../..
fi

cd selocialnode
ssh-agent $(ssh-add ../../autodeploy.pem; git pull)

cd selocial-deploy/autodeploy-production

../meteor-up/bin/mup deploy
