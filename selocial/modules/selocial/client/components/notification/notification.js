angular.module('selocial')

/**
 * Notification component
 */
.directive('notification', function(){
    return {
        restrict: 'A',
        templateUrl: 'modules/selocial/client/components/notification/notification.html',
        
        scope: {
            notification: "="
        },
        
        /**
         * Channel component controller
         */
        controller: function(){
            
        }
    };
});