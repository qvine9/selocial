/**
 * WOW.js helper directive
 */
angular.module('selocial').directive('wow', function(){
    return {
        restrict: 'A',
        link: function (scope, el, attr) {
            new WOW({
                mobile: false,
                live: true,
                scrollContainer: window
            }).init();
        }
    };
});
