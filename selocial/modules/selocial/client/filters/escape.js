angular.module('selocial').filter('escape', function(){
    return function(url){
        return typeof(encodeURIComponent) === 'function' ? encodeURIComponent(url) : escape(url);
    }
});