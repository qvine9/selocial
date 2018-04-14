angular.module('selocial')

/**
 * Reset password form
 */
.directive('resetPasswordForm', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/forms/resetPasswordForm.html',
        
        scope: {
            onReseted: '&',
            token: '='
        },
        
        /**
         * Form controller
         */
        controller: function($scope, auth, notify){
            
            $scope.resetPasswordUser = {};
            
            /**
             * Reset password
             */
            $scope.resetPassword = function(){
                auth.resetPassword($scope.resetPasswordUser.password, $scope.token).then(function(){
                    $scope.onReseted();
                    notify.success("You have successfully reset your password.");
                });
            };
            
        }
    };
});