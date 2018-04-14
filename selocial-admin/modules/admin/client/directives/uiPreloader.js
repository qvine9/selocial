import angular from 'angular';

angular.module('admin').directive('uiPreloader', function($rootScope){
    'ngInject';
    
    return {
        restrict: 'A',
        template:'<span class="bar"></span>',
        link: function(scope, el, attrs) {        
            el.addClass('preloaderbar hide');
            scope.$on('$stateChangeStart', function(event) {
                el.removeClass('hide').addClass('active');
            });
            scope.$on('$stateChangeSuccess', function( event, toState, toParams, fromState ) {
                event.targetScope.$watch('$viewContentLoaded', function(){
                    el.addClass('hide').removeClass('active');
                })
            });

            scope.$on('preloader:active', function(event) {
                el.removeClass('hide').addClass('active');
            });
            scope.$on('preloader:hide', function(event) {
                el.addClass('hide').removeClass('active');
            });                
        }
    };        
});