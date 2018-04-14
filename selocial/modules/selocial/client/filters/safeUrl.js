angular.module('selocial').filter('safeUrl', function(){
    return function(url){
        if (/^http:\/\/selocial\.s3\.amazonaws\.com/.test(url)){
            url = url.replace('http:', 'https:');
        }
        url = url.replace(/https?:\/\/selocial\.s3\.amazonaws\.com\/uploads\//, 'https://d3h9l091br8bj4.cloudfront.net/');
        url = url.replace(/https?:\/\/selocial\.s3\.amazonaws\.com\/selocialweb\//, 'https://dwzrkd09yh5h8.cloudfront.net/');
        return url;
    }
});