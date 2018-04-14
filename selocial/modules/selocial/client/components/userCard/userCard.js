angular.module('selocial')

/**
 * Mix component
 */
.directive('userCard', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/userCard/userCard.html',
        controllerAs: 'comp',
        
        scope: {
            user: "="
        }
    };
});