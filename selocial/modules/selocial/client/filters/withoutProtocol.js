angular.module('selocial').filter('withoutProtocol', function(){
    return function(url){
        return url.replace(/.*?:\/\//, '');
    }
});