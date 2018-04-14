angular.module('selocial')

/**
 * Login form
 */
.directive('loginForm', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/forms/loginForm.html',
        
        scope: {
            onLoggedIn: '&'
        },
        
        /**
         * Form controller
         */
        controller: function($scope, auth){
            
            // Login user
            $scope.loginUser = {};
            
            /**
             * Log in a user
             */
            $scope.login = function(){
                auth.login($scope.loginUser.username, $scope.loginUser.password).then(function(){
                    $scope.onLoggedIn();
                });
            };
            
        }
    };
});