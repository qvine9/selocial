angular.module('selocial').directive('mediaCover', function($filter){
    return {
        scope: {
            mediaCover: '='
        },
        link: function(scope, element, attr){
            scope.$watch('mediaCover', function(url){
                if (url){
                    element.css('background-image', 'url(\'' + $filter('safeUrl')(url) + '\')');
                } else {
                    element.css('background-image', 'none');
                }
            });
        }
    }
});