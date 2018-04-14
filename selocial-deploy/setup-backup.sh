#!/bin/bash

# Params info:
# https://github.com/tutumcloud/mongodb-backup

sudo mkdir /opt/backup
docker pull tutum/mongodb-backup
docker run -d --link mongodb:mongodb -v /opt/backup:/backup --env MAX_BACKUPS=7 --env INIT_BACKUP=1 --name mongobackup tutum/mongodb-backup
