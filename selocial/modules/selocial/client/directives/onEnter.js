/**
 * On pressing the return key...
 */
angular.module('selocial').directive('onEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.onEnter);
                });
                event.preventDefault();
            }
        });
    };       
});

