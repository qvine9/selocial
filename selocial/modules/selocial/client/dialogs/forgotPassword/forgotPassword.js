/**
 * Forgot password dialog controller
 */
angular.module('selocial').controller('forgotPasswordDialogController', function($scope, dialog){

    /**
     * Show signup form
     */
    $scope.showSignup = function(){
        $scope.$close();
        dialog.show('signup');
    };
    
});