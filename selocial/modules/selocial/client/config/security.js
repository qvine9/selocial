angular.module('selocial').config(function($sceDelegateProvider, $provide) {
   
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'http*://selocial.s3.amazonaws.com/**',
        'http*://d3h9l091br8bj4.cloudfront.net/**',
        'http*://dwzrkd09yh5h8.cloudfront.net/**',
        'http*://api.soundcloud.com/**',
        'http*://*.sndcdn.com/**',
    ]);
    
});