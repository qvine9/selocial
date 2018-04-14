angular.module('selocial')

/**
 * Stat box component
 */
.directive('statBoxNumber', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/statBox/number.html',
        
        scope: {
            count: '=',
            title: '@',
            icon: '@'
        },
        
        /**
         * Profile card component controller
         */
        controller: function($scope, api, $reactive){
            $reactive(this).attach($scope);
        }
    };
});