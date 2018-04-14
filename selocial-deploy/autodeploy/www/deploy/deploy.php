<?php
header('Content-type: text/plain');

if (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_USER'] !== 'deploy') {
    header('WWW-Authenticate: Basic realm="Deploy"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Deploy';
    exit;
}

set_time_limit(0);

$lockFile = '/opt/tmp/deploy.lock';

if (file_exists($lockFile)){
        die("Already deploying, please wait until it's done");
}

file_put_contents($lockFile, '1');

$target = isset($_GET['dev']) ? 'deploy-dev.sh' : 'deploy.sh';

chdir('../../');
echo `ssh localhost 'bash -s' < ./$target 2>&1`;

unlink($lockFile);