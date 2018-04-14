import angular from 'angular';

angular.module('admin').directive('toggleOffCanvas', function () {
    var directive = {
        restrict: 'A',
        link: link
    };

    return directive;

    function link(scope, ele, attrs) {
        ele.on('click', function() {
            return $('#app').toggleClass('on-canvas');
        });         
    }
});