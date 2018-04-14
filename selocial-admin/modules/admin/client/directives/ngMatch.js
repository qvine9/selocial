import angular from 'angular';

/**
 * ngMatch directive
 */
angular.module('admin').directive('ngMatch', function ($parse) {
    'ngInject';
    
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, elem, attrs, ctrl) {
            if (!ctrl) return;
            if (!attrs.ngMatch) return;

            var firstPassword = $parse(attrs.ngMatch);

            var validator = function(value){
                var temp = firstPassword(scope),
                v = value === temp;
                ctrl.$setValidity('match', v);
                return value;
            };

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.push(validator);
            attrs.$observe('ngMatch', function () {
                validator(ctrl.$viewValue);
            });
        }
    };
});