import angular from 'angular';

angular.module('admin').directive('toggleNavCollapsedMin', function($rootScope){
    'ngInject';
    
    var directive = {
        restrict: 'A',
        link: link
    };

    return directive;

    function link(scope, ele, attrs) {
        var app;

        app = $('#app');

        ele.on('click', function(e) {
            if (app.hasClass('nav-collapsed-min')) {
                app.removeClass('nav-collapsed-min');
            } else {
                app.addClass('nav-collapsed-min');
                $rootScope.$broadcast('nav:reset');
            }
            setTimeout(function(){
                $(window).trigger('resize');
            }, 300);
            return e.preventDefault();
        });            
    }
});