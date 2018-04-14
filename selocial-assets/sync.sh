#!/bin/sh

echo "Syncing data with S3"

SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`

cd $SCRIPTPATH/content

aws s3 sync . s3://selocial/selocialweb
