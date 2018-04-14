angular.module('selocial')

/**
 * Change password form
 */
.directive('changePasswordForm', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/forms/changePasswordForm.html',
        
        scope: {
            onChanged: '&'
        },
        
        /**
         * Form controller
         */
        controller: function($scope, auth, notify){
            
            $scope.changePasswordUser = {};
            
            /**
             * Change password
             */
            $scope.changePassword = function(){
                auth.changePassword($scope.changePasswordUser.oldPassword, $scope.changePasswordUser.newPassword).then(function(){
                    $scope.onChanged();
                    notify.success("You have successfully changed your password.");
                });
            };
            
        }
    };
});