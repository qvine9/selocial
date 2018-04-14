/**
 * Set up Amazone Web Services client
 */

let AWS = Npm.require('aws-sdk');

AWS.config.update({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region: config.aws.region
});