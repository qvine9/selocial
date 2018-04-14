/**
 * Sign Up dialog controller
 */
angular.module('selocial').controller('signupDialogController', function($scope, dialog, params){
    
    $scope.isBand = params && params.band;
    
    /**
     * Show the login form
     */
    $scope.showLogin = function(){
        $scope.$close();
        dialog.show('login');
    };
    
});