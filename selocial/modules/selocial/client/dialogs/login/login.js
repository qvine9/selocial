/**
 * Login dialog controller
 */
angular.module('selocial').controller('loginDialogController', function($scope, dialog){

    /**
     * Show forgot password form
     */
    $scope.showForgotPassword = function(){
        $scope.$close();
        dialog.show('forgotPassword');
    };
    
});