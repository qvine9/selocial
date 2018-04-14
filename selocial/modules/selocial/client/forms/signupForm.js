angular.module('selocial')

/**
 * Signup form
 */
.directive('signupForm', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/forms/signupForm.html',
        
        scope: {
            onSignedUp: '&',
            bandMode: '='
        },
        
        /**
         * Form controller
         */
        controller: function($scope, auth, api, $stateParams){
            // Signup user
            $scope.signupUser = {};
            
            const {referralId} = $stateParams;
            if (referralId) {
                $scope.signupUser.referralId = referralId;
                api('referral.clicked', {referralId}).then((err, res) => console.log(err, res));
            }

            /**
             * Log in a user
             */
            $scope.signup = function(){
                $scope.signupUser.bandMode = $scope.bandMode;
                auth.signup($scope.signupUser).then(function(){
                    $scope.onSignedUp();
                });
            };
        }
    };
});