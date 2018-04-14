angular.module('selocial')

/**
 * Forgot password form
 */
.directive('forgotPasswordForm', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/forms/forgotPasswordForm.html',
        
        scope: {
            onSent: '&'
        },
        
        /**
         * Form controller
         */
        controller: function($scope, auth, notify){
            
            $scope.forgotPasswordUser = {};
            
            /**
             * Send password reset instructions
             */
            $scope.sendPasswordResetInstructions = function(){
                auth.forgotPassword($scope.forgotPasswordUser.email).then(function(){
                    $scope.onSent();
                    notify.success("Please find instructions to reset your password in your inbox.");
                });
            };
            
        }
    };
});