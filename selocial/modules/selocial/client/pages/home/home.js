/**
 * Home page controller
 */
angular.module('selocial').controller('HomePageController', function($stateParams, dialog){
    var page = this;
    
    if ($stateParams.referralId) {
    	dialog.show('signup');
    }
});